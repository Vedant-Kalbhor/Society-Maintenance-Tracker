import { Notice } from "@prisma/client";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type NoticeBoardProps = {
  notices: Notice[];
};

export function NoticeBoard({ notices }: NoticeBoardProps) {
  return (
    <div className="grid gap-4">
      {notices.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No notices yet</CardTitle>
            <CardDescription>Admin announcements will appear here.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        notices.map((notice) => (
          <Card key={notice.id} className={notice.isPinned ? "border-primary/40" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{notice.title}</CardTitle>
                  <CardDescription>{new Date(notice.createdAt).toLocaleString()}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {notice.isPinned ? <Badge>Pinned</Badge> : null}
                  {notice.isImportant ? <Badge variant="destructive">Important</Badge> : null}
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {notice.description}
                </p>
                {notice.pdfUrl ? (
                  <Link
                    href={notice.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
                  >
                    Download attached PDF
                  </Link>
                ) : null}
              </CardContent>
            </Card>
        ))
      )}
    </div>
  );
}
