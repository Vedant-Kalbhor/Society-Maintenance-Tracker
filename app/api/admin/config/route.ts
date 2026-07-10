import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const configSchema = z.object({
  overdueDays: z.number().int().positive(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = configSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  const config = (await prisma.config.findFirst()) ?? (await prisma.config.create({ data: {} }));
  const updated = await prisma.config.update({
    where: { id: config.id },
    data: { overdueDays: parsed.data.overdueDays },
  });

  return NextResponse.json({ config: updated });
}
