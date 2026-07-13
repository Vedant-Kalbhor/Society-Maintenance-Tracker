import { ComplaintCategory, ComplaintPriority, ComplaintStatus, Role } from "@prisma/client";
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const complaintCreateSchema = z.object({
  category: z.nativeEnum(ComplaintCategory),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  photoUrl: z.string().url().optional().or(z.literal("")).transform((value) => value || undefined),
  priority: z.nativeEnum(ComplaintPriority).default("MEDIUM"),
});

export const sessionRoleSchema = z.nativeEnum(Role);
export const complaintStatusUpdateSchema = z.object({
  status: z.nativeEnum(ComplaintStatus),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ComplaintCreateInput = z.output<typeof complaintCreateSchema>;
export type ComplaintCreateFormInput = z.input<typeof complaintCreateSchema>;
