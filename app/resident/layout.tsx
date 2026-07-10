import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/layout/logout-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function ResidentLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Resident Portal</p>
            <h1 className="text-xl font-semibold">Society Maintenance Tracker</h1>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/resident/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/resident/complaints">Complaints</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/resident/notices">Notices</Link>
            </Button>
            {session?.user ? <LogoutButton /> : null}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
