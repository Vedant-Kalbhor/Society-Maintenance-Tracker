import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOverdueComplaint } from "@/lib/complaints";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const config = (await prisma.config.findFirst()) ?? (await prisma.config.create({ data: {} }));
  const complaints = await prisma.complaint.findMany();
  const overdueCount = complaints.filter((complaint) => isOverdueComplaint(complaint, config.overdueDays)).length;

  const byStatus = await prisma.complaint.groupBy({ by: ["status"], _count: { id: true } });
  const byCategory = await prisma.complaint.groupBy({ by: ["category"], _count: { id: true } });

  return NextResponse.json({
    totalComplaints: complaints.length,
    overdueCount,
    overdueDays: config.overdueDays,
    byStatus,
    byCategory,
  });
}
