import { ComplaintCategory, ComplaintPriority, ComplaintStatus, Role } from "@prisma/client";

export const complaintCategoryLabels: Record<ComplaintCategory, string> = {
  ELECTRICAL: "Electrical",
  PLUMBING: "Plumbing",
  CLEANING: "Cleaning",
  SECURITY: "Security",
  PARKING: "Parking",
  OTHER: "Other",
};

export const complaintPriorityLabels: Record<ComplaintPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const complaintStatusLabels: Record<ComplaintStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const roleLabels: Record<Role, string> = {
  RESIDENT: "Resident",
  ADMIN: "Admin",
};

export const complaintCategoryOptions = Object.entries(complaintCategoryLabels).map(
  ([value, label]) => ({ value: value as ComplaintCategory, label })
);

export const complaintPriorityOptions = Object.entries(complaintPriorityLabels).map(
  ([value, label]) => ({ value: value as ComplaintPriority, label })
);

export const complaintStatusOptions = Object.entries(complaintStatusLabels).map(
  ([value, label]) => ({ value: value as ComplaintStatus, label })
);
