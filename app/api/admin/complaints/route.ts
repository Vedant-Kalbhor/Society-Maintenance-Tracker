import { NextResponse } from "next/server";
import { ComplaintPriority, ComplaintStatus, Role } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOverdueComplaint } from "@/lib/complaints";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") as ComplaintStatus | null;
  const category = url.searchParams.get("category");
  const priority = url.searchParams.get("priority") as ComplaintPriority | null;
  const search = url.searchParams.get("search")?.toLowerCase();

  const config = (await prisma.config.findFirst()) ?? (await prisma.config.create({ data: {} }));
  const complaints = await prisma.complaint.findMany({
    include: { resident: { select: { name: true, email: true } }, history: true },
    orderBy: [{ createdAt: "desc" }],
  });

  const filtered = complaints
    .filter((complaint) => (status ? complaint.status === status : true))
    .filter((complaint) => (category ? complaint.category === category : true))
    .filter((complaint) => (priority ? complaint.priority === priority : true))
    .filter((complaint) =>
      search
        ? complaint.description.toLowerCase().includes(search) ||
          complaint.resident.name.toLowerCase().includes(search) ||
          complaint.resident.email.toLowerCase().includes(search)
        : true
    )
    .sort((a, b) => {
      const overdueA = isOverdueComplaint(a, config.overdueDays) ? 1 : 0;
      const overdueB = isOverdueComplaint(b, config.overdueDays) ? 1 : 0;
      if (overdueA !== overdueB) return overdueB - overdueA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .map((complaint) => ({
      ...complaint,
      overdue: isOverdueComplaint(complaint, config.overdueDays),
    }));

  return NextResponse.json({ complaints: filtered });
}
