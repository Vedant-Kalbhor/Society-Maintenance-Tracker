import { NextResponse } from "next/server";
import { ComplaintPriority, ComplaintStatus, Role } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { createComplaintHistoryEntry } from "@/lib/complaints";
import { prisma } from "@/lib/prisma";

const complaintAdminUpdateSchema = z.object({
  status: z.nativeEnum(ComplaintStatus).optional(),
  priority: z.nativeEnum(ComplaintPriority).optional(),
  note: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().max(1000).optional()
  ),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json().catch(() => null);
  const parsed = complaintAdminUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) {
    return NextResponse.json({ message: "Complaint not found" }, { status: 404 });
  }

  const { status, priority, note } = parsed.data;

  const updateData: {
    status?: ComplaintStatus;
    priority?: ComplaintPriority;
    resolvedAt?: Date | null;
    closedAt?: Date | null;
    isClosed?: boolean;
  } = {};

  if (status && status !== complaint.status) {
    updateData.status = status;
    if (status === ComplaintStatus.RESOLVED) {
      updateData.resolvedAt = new Date();
      updateData.closedAt = new Date();
      updateData.isClosed = true;
      updateData.status = ComplaintStatus.CLOSED;
    } else if (status === ComplaintStatus.CLOSED) {
      updateData.closedAt = new Date();
      updateData.isClosed = true;
    }
  }

  if (priority) {
    updateData.priority = priority;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ complaint });
  }

  const updatedComplaint = await prisma.$transaction(async (tx) => {
    const nextComplaint = await tx.complaint.update({
      where: { id },
      data: updateData,
    });

    if (status && status !== complaint.status) {
      await createComplaintHistoryEntry({
        complaintId: id,
        previousStatus: complaint.status,
        newStatus: nextComplaint.status,
        actorId: session.user.id,
        actorName: session.user.name ?? session.user.email ?? "Admin",
        note,
        tx,
      });
    }

    return nextComplaint;
  });

  return NextResponse.json({ complaint: updatedComplaint });
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      resident: { select: { name: true, email: true } },
      history: {
        orderBy: { timestamp: "asc" },
        include: {
          actor: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!complaint) {
    return NextResponse.json({ message: "Complaint not found" }, { status: 404 });
  }

  return NextResponse.json({ complaint });
}
