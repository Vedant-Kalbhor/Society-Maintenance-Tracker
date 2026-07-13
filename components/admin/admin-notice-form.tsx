"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AdminNoticeForm() {
  const router = useRouter();
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  async function submit() {
    try {
      let pdfUrl = uploadedPdfUrl || undefined;
      if (pdfFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", pdfFile);

        const uploadResponse = await fetch("/api/uploads/document", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload PDF");
        }

        const uploadData = (await uploadResponse.json()) as { url: string };
        pdfUrl = uploadData.url;
        setUploadedPdfUrl(uploadData.url);
      }

      const response = await fetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, pdfUrl, isImportant, isPinned }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish notice");
      }

      toast.success("Notice published");
      setTitle("");
      setDescription("");
      setPdfFile(null);
      setUploadedPdfUrl("");
      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }
      setIsImportant(false);
      setIsPinned(false);
      router.refresh();
    } catch {
      toast.error("Unable to publish notice");
    }
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
          <div className="grid gap-2">
            <Label htmlFor="pdf">Optional PDF attachment</Label>
            <Input
              ref={pdfInputRef}
              id="pdf"
              type="file"
              accept="application/pdf"
              onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              Uploaded PDF will be attached to the notice and shown to residents.
            </p>
            {uploadedPdfUrl ? (
              <p className="break-all text-xs text-muted-foreground">{uploadedPdfUrl}</p>
            ) : null}
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
        <Button type="button" onClick={submit}>
          Publish notice
        </Button>
      </CardContent>
    </Card>
  );
}
