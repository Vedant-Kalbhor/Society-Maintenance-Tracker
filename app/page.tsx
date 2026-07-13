import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  "Resident complaint tracking",
  "Admin dashboards and filters",
  "History-aware audit trail",
  "Cloud-ready architecture",
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col justify-center gap-8 lg:flex-row lg:items-center">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex rounded-full border bg-card px-4 py-1 text-sm text-muted-foreground shadow-sm">
            Society Maintenance Tracker
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              A modern maintenance platform for residents and administrators.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Track complaints, manage notices, and keep maintenance operations transparent with a
              secure full-stack workflow built for scale.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>

        <Card className="w-full max-w-xl border-border/70 bg-card/90 backdrop-blur">
          
        </Card>
      </section>
    </main>
  );
}
