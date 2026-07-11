import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOverdueComplaint } from "@/lib/complaints";
import { AdminNoticeForm } from "@/components/admin/admin-notice-form";
import { AdminThresholdForm } from "@/components/admin/admin-threshold-form";
import { AdminAnalyticsPanel } from "@/components/admin/admin-analytics-panel";
import { buildAnalyticsSummary } from "@/lib/analytics";
import { complaintCategoryLabels, complaintStatusLabels } from "@/lib/constants";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const config = (await prisma.config.findFirst()) ?? (await prisma.config.create({ data: {} }));
  const [complaints, totalUsers] = await Promise.all([
    prisma.complaint.findMany({
      include: { resident: { select: { name: true, email: true } }, history: true },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.user.count({ where: { role: "RESIDENT" } }),
  ]);

  const analytics = buildAnalyticsSummary(complaints, config.overdueDays);
  const overdueCount = complaints.filter((complaint) => isOverdueComplaint(complaint, config.overdueDays)).length;

  const statusCounts = Object.fromEntries(
    analytics.statusData.map((entry) => [entry.name, entry.value])
  );
  const categoryCounts = Object.fromEntries(
    analytics.categoryData.map((entry) => [entry.name, entry.value])
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total complaints</CardDescription>
            <CardTitle>{complaints.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Overdue complaints</CardDescription>
            <CardTitle>{overdueCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Residents</CardDescription>
            <CardTitle>{totalUsers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Threshold</CardDescription>
            <CardTitle>{config.overdueDays} days</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <AdminAnalyticsPanel analytics={analytics} />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Complaint status</CardTitle>
            <CardDescription>Summary of current complaint states.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(complaintStatusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <span>{label}</span>
                <span className="font-semibold">{statusCounts[label] ?? 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Complaint categories</CardTitle>
            <CardDescription>Where the requests are coming from.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(complaintCategoryLabels).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <span>{label}</span>
                <span className="font-semibold">{categoryCounts[label] ?? 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Overdue threshold</CardTitle>
            <CardDescription>Update the number of days before a complaint is considered overdue.</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminThresholdForm overdueDays={config.overdueDays} />
          </CardContent>
        </Card>

        <AdminNoticeForm />
      </section>
    </div>
  );
}
