import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

import { auth } from "@/lib/auth";
import { buildAnalyticsSummary } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const config = (await prisma.config.findFirst()) ?? (await prisma.config.create({ data: {} }));
  const complaints = await prisma.complaint.findMany();
  const analytics = buildAnalyticsSummary(complaints, config.overdueDays);

  return NextResponse.json({
    totalComplaints: analytics.totalComplaints,
    overdueCount: analytics.overdueCount,
    overdueDays: config.overdueDays,
    statusData: analytics.statusData,
    categoryData: analytics.categoryData,
    priorityData: analytics.priorityData,
    trendData: analytics.trendData,
  });
}
