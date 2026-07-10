"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { complaintCategoryOptions, complaintPriorityOptions } from "@/lib/constants";
import { complaintCreateSchema, type ComplaintCreateInput } from "@/lib/validators";

type ComplaintFormProps = {
  residentId: string;
};

export function ComplaintForm({ residentId }: ComplaintFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplaintCreateInput>({
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
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
      router.refresh();
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
        <Label htmlFor="photoUrl">Optional photo URL</Label>
        <Input id="photoUrl" placeholder="https://..." {...register("photoUrl")} />
        <p className="text-xs text-muted-foreground">Phase 7 will replace this with Cloudinary upload.</p>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Raise Complaint"}
      </Button>
    </form>
  );
}
