"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { complaintCategoryOptions, complaintPriorityOptions } from "@/lib/constants";
import {
  complaintCreateSchema,
  type ComplaintCreateFormInput,
} from "@/lib/validators";

type ComplaintFormProps = {
  residentId: string;
};

export function ComplaintForm({ residentId }: ComplaintFormProps) {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplaintCreateFormInput>({
    resolver: zodResolver(complaintCreateSchema),
    defaultValues: {
      category: "ELECTRICAL",
      description: "",
      photoUrl: "",
      priority: "MEDIUM",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      let photoUrl = values.photoUrl;

      if (photoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", photoFile);

        const uploadResponse = await fetch("/api/uploads/photo", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload photo");
        }

        const uploadData = (await uploadResponse.json()) as { url: string };
        photoUrl = uploadData.url;
        setUploadedPhotoUrl(uploadData.url);
      }

      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          photoUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit complaint");
      }

      reset({
        category: "ELECTRICAL",
        description: "",
        photoUrl: "",
        priority: "MEDIUM",
      });
      setPhotoFile(null);
      setUploadedPhotoUrl("");
      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
      toast.success("Complaint submitted successfully");
      router.refresh();
    } catch {
      toast.error("Unable to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" value={residentId} />
      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          {...register("category")}
        >
          {complaintCategoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.category ? <p className="text-sm text-destructive">{errors.category.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="priority">Priority</Label>
        <select
          id="priority"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          {...register("priority")}
        >
          {complaintPriorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.priority ? <p className="text-sm text-destructive">{errors.priority.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the issue in detail"
          {...register("description")}
        />
        {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="photo">Optional photo</Label>
        <Input
          ref={photoInputRef}
          id="photo"
          type="file"
          accept="image/*"
          onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
        />
        <input type="hidden" {...register("photoUrl")} />
        <p className="text-xs text-muted-foreground">
          Images are uploaded to Cloudinary and the URL is stored in the complaint record.
        </p>
        {uploadedPhotoUrl ? (
          <p className="text-xs text-muted-foreground break-all">{uploadedPhotoUrl}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Raise Complaint"}
      </Button>
    </form>
  );
}
