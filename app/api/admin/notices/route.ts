import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendEmail } from "@/lib/resend";

const noticeSchema = z.object({
  title: z.string().trim().min(3),
  description: z.string().trim().min(10),
  pdfUrl: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().url().optional()
  ),
  isImportant: z.boolean().default(false),
  isPinned: z.boolean().default(false),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = noticeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  const notice = await prisma.notice.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      pdfUrl: parsed.data.pdfUrl,
      isImportant: parsed.data.isImportant,
      isPinned: parsed.data.isPinned,
      createdById: session.user.id,
    },
  });

  if (notice.isImportant) {
    const residents = await prisma.user.findMany({
      where: { role: Role.RESIDENT },
      select: { email: true },
    });

    const emails = residents.map((resident) => resident.email);
    if (emails.length > 0) {
      void sendEmail({
        to: emails,
        subject: `Important notice: ${notice.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>${notice.title}</h2>
            <p>${notice.description}</p>
            ${notice.pdfUrl ? `<p><a href="${notice.pdfUrl}">Download attached PDF</a></p>` : ""}
          </div>
        `,
      }).catch((error) => {
        console.error("Failed to send important notice email:", error);
      });
    }
  }

  return NextResponse.json({ notice }, { status: 201 });
}
