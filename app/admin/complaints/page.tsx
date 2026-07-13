import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOverdueComplaint, sortComplaintsForAdmin } from "@/lib/complaints";
import { AdminComplaintsClient } from "@/components/admin/admin-complaints-client";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AdminComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const config = (await prisma.config.findFirst()) ?? (await prisma.config.create({ data: {} }));
  const complaints = await prisma.complaint.findMany({
    include: { resident: { select: { name: true, email: true } }, history: true },
    orderBy: [{ createdAt: "desc" }],
  });

  const status =
    typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : undefined;
  const category =
    typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category : undefined;
  const priority =
    typeof resolvedSearchParams.priority === "string" ? resolvedSearchParams.priority : undefined;
  const search =
    typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined;

  const filtered = sortComplaintsForAdmin(
    complaints.filter((complaint) => {
      if (status && complaint.status !== status) return false;
      if (category && complaint.category !== category) return false;
      if (priority && complaint.priority !== priority) return false;
      return true;
    }),
    config.overdueDays,
    search
  ).map((complaint) => ({
    id: complaint.id,
    category: complaint.category,
    description: complaint.description,
    priority: complaint.priority,
    status: complaint.status,
    createdAt: complaint.createdAt.toISOString(),
    resident: complaint.resident,
    historyCount: complaint.history.length,
    overdue: isOverdueComplaint(complaint, config.overdueDays),
  }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-3xl font-semibold">All Complaints</h1>
        <p className="text-muted-foreground">
          Review complaints raised by every resident, then resolve, close, or update status.
        </p>
      </div>
      <AdminComplaintsClient complaints={filtered} />
    </div>
  );
}
