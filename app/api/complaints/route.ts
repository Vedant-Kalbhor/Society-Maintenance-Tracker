import { NextResponse } from "next/server";

import { ComplaintPriority, ComplaintStatus, Role } from "@prisma/client";

import { auth } from "@/lib/auth";
import { createComplaintHistoryEntry } from "@/lib/complaints";
import { prisma } from "@/lib/prisma";
import { complaintCreateSchema } from "@/lib/validators";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const complaints = await prisma.complaint.findMany({
    where: { residentId: session.user.id },
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json({ complaints });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.RESIDENT) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = complaintCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const complaint = await prisma.$transaction(async (tx) => {
    const created = await tx.complaint.create({
      data: {
        residentId: session.user.id,
        category: parsed.data.category,
        description: parsed.data.description,
        photoUrl: parsed.data.photoUrl,
        priority: ComplaintPriority.MEDIUM,
        status: ComplaintStatus.OPEN,
        isClosed: false,
      },
    });

    await createComplaintHistoryEntry({
      complaintId: created.id,
      previousStatus: null,
      newStatus: ComplaintStatus.OPEN,
      actorId: session.user.id,
      actorName: session.user.name ?? session.user.email ?? "Resident",
      tx,
    });

    return created;
  });

  return NextResponse.json({ complaint }, { status: 201 });
}
