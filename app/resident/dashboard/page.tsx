import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ComplaintForm } from "@/components/resident/complaint-form";
import { ComplaintTable } from "@/components/resident/complaint-table";
import { NoticeBoard } from "@/components/resident/notice-board";

export default async function ResidentDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [complaints, notices, stats, totalComplaints] = await Promise.all([
    prisma.complaint.findMany({
      where: { residentId: session.user.id },
      orderBy: [{ createdAt: "desc" }],
      take: 10,
    }),
    prisma.notice.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
    prisma.complaint.groupBy({
      by: ["status"],
      where: { residentId: session.user.id },
      _count: { id: true },
    }),
    prisma.complaint.count({
      where: { residentId: session.user.id },
    }),
  ]);

  const openCount = stats.find((item) => item.status === "OPEN")?._count.id ?? 0;
  const inProgressCount = stats.find((item) => item.status === "IN_PROGRESS")?._count.id ?? 0;
  const resolvedCount = stats.find((item) => item.status === "RESOLVED")?._count.id ?? 0;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total complaints</CardDescription>
            <CardTitle>{totalComplaints}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Open</CardDescription>
            <CardTitle>{openCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>In Progress</CardDescription>
            <CardTitle>{inProgressCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Resolved</CardDescription>
            <CardTitle>{resolvedCount}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Raise a complaint</CardTitle>
            <CardDescription>Submit a maintenance issue for the society team to review.</CardDescription>
          </CardHeader>
          <CardContent>
            <ComplaintForm residentId={session.user.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest notices</CardTitle>
            <CardDescription>Pinned and important notices from administration.</CardDescription>
          </CardHeader>
          <CardContent>
            <NoticeBoard notices={notices} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Recent complaints</h2>
          <p className="text-sm text-muted-foreground">Your latest maintenance requests.</p>
        </div>
        <ComplaintTable complaints={complaints} />
      </section>
    </div>
  );
}
