import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ComplaintHistoryView } from "@/components/resident/complaint-history-view";

export default async function ResidentComplaintsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const complaints = await prisma.complaint.findMany({
    where: { residentId: session.user.id },
    include: {
      history: {
        orderBy: { timestamp: "asc" },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Complaint history</CardTitle>
          <CardDescription>Browse every complaint and its full status history.</CardDescription>
        </CardHeader>
        <CardContent>
          <ComplaintHistoryView
            complaints={complaints.map((complaint) => ({
              id: complaint.id,
              category: complaint.category,
              description: complaint.description,
              photoUrl: complaint.photoUrl,
              priority: complaint.priority,
              status: complaint.status,
              createdAt: complaint.createdAt.toISOString(),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
