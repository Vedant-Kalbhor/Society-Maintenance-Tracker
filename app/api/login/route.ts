import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(parsed.data.password, user.password);
  if (!valid) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json(
    {
      message: "Login validated",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 200 }
  );
}
