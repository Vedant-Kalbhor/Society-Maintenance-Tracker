"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-3xl">Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. You can try loading the page again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={reset}>Try again</Button>
            </CardContent>
          </Card>
        </main>
      </body>
    </html>
  );
}
