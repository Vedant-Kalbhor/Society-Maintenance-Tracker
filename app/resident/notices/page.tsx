import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NoticeBoard } from "@/components/resident/notice-board";

export default async function ResidentNoticesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const notices = await prisma.notice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-3xl font-semibold">Notice board</h1>
        <p className="text-muted-foreground">Stay up to date with society updates.</p>
      </div>
      <NoticeBoard notices={notices} />
    </div>
  );
}
