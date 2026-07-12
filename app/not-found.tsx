import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl">Page not found</CardTitle>
          <CardDescription>
            The page you are looking for does not exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
