import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/layout/logout-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Admin Portal</p>
            <h1 className="text-xl font-semibold">Society Maintenance Tracker</h1>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/admin/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/admin/complaints">Complaints</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/admin/notices">Notices</Link>
            </Button>
            {session?.user ? <LogoutButton /> : null}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
