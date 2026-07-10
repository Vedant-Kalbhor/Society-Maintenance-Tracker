import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const noticeSchema = z.object({
  title: z.string().trim().min(3),
  description: z.string().trim().min(10),
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
      isImportant: parsed.data.isImportant,
      isPinned: parsed.data.isPinned,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ notice }, { status: 201 });
}
