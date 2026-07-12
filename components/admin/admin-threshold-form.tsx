"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  overdueDays: number;
};

export function AdminThresholdForm({ overdueDays }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(String(overdueDays));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overdueDays: Number(value) }),
      });

      if (!response.ok) {
        throw new Error("Failed to update threshold");
      }

      toast.success("Overdue threshold updated");
      router.refresh();
    } catch {
      toast.error("Unable to update overdue threshold");
    }
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-3">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Days</label>
        <Input type="number" min={1} value={value} onChange={(event) => setValue(event.target.value)} />
      </div>
      <Button type="submit">Save threshold</Button>
    </form>
  );
}
