import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ComplaintTable } from "@/components/resident/complaint-table";

export default async function ResidentComplaintsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const complaints = await prisma.complaint.findMany({
    where: { residentId: session.user.id },
    orderBy: [{ createdAt: "desc" }],
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Complaint history</CardTitle>
          <CardDescription>Everything you have raised so far.</CardDescription>
        </CardHeader>
        <CardContent>
          <ComplaintTable complaints={complaints} />
        </CardContent>
      </Card>
    </div>
  );
}
