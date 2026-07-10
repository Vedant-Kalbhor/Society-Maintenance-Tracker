import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
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

  if (session.user.role !== Role.ADMIN && complaint.residentId !== session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ history: complaint.history });
}
