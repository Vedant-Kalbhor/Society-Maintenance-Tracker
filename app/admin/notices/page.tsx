import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminNoticeForm } from "@/components/admin/admin-notice-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminNoticesPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const notices = await prisma.notice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[0.8fr_1.2fr]">
      <AdminNoticeForm />
      <Card>
        <CardHeader>
          <CardTitle>Published notices</CardTitle>
          <CardDescription>Latest announcements visible to residents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notices.map((notice) => (
            <div key={notice.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{notice.title}</h3>
                  <p className="text-sm text-muted-foreground">{notice.description}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {notice.isPinned ? "Pinned" : ""} {notice.isImportant ? "Important" : ""}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
