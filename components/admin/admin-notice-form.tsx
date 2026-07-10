"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AdminNoticeForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  async function submit() {
    await fetch("/api/admin/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, isImportant, isPinned }),
    });
    setTitle("");
    setDescription("");
    setIsImportant(false);
    setIsPinned(false);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div>
          <h3 className="text-lg font-semibold">Post notice</h3>
          <p className="text-sm text-muted-foreground">Pinned notices appear first.</p>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Important</Label>
              <Select value={String(isImportant)} onChange={(event) => setIsImportant(event.target.value === "true")}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Pinned</Label>
              <Select value={String(isPinned)} onChange={(event) => setIsPinned(event.target.value === "true")}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </Select>
            </div>
          </div>
        </div>
        <Button onClick={submit}>Publish notice</Button>
      </CardContent>
    </Card>
  );
}
