import {
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
} from "@prisma/client";

import {
  complaintCategoryLabels,
  complaintPriorityLabels,
  complaintStatusLabels,
} from "@/lib/constants";
import { isOverdueComplaint } from "@/lib/complaints";

export type AnalyticsSummary = {
  totalComplaints: number;
  overdueCount: number;
  statusData: { name: string; value: number }[];
  categoryData: { name: string; value: number }[];
  priorityData: { name: string; value: number }[];
  trendData: { date: string; total: number; overdue: number }[];
};

export function buildAnalyticsSummary(
  complaints: Complaint[],
  overdueDays: number,
  trendDays = 14
): AnalyticsSummary {
  const statusCounts = new Map<ComplaintStatus, number>();
  const categoryCounts = new Map<ComplaintCategory, number>();
  const priorityCounts = new Map<ComplaintPriority, number>();

  for (const complaint of complaints) {
    statusCounts.set(complaint.status, (statusCounts.get(complaint.status) ?? 0) + 1);
    categoryCounts.set(complaint.category, (categoryCounts.get(complaint.category) ?? 0) + 1);
    priorityCounts.set(complaint.priority, (priorityCounts.get(complaint.priority) ?? 0) + 1);
  }

  const totalComplaints = complaints.length;
  const overdueCount = complaints.filter((complaint) => isOverdueComplaint(complaint, overdueDays)).length;

  const statusData = Object.entries(complaintStatusLabels).map(([status, label]) => ({
    name: label,
    value: statusCounts.get(status as ComplaintStatus) ?? 0,
  }));

  const categoryData = Object.entries(complaintCategoryLabels).map(([category, label]) => ({
    name: label,
    value: categoryCounts.get(category as ComplaintCategory) ?? 0,
  }));

  const priorityData = Object.entries(complaintPriorityLabels).map(([priority, label]) => ({
    name: label,
    value: priorityCounts.get(priority as ComplaintPriority) ?? 0,
  }));

  const today = new Date();
  const trendData = Array.from({ length: trendDays }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (trendDays - 1 - index));
    const key = date.toISOString().slice(0, 10);

    const dayComplaints = complaints.filter(
      (complaint) => complaint.createdAt.toISOString().slice(0, 10) === key
    );

    return {
      date: key,
      total: dayComplaints.length,
      overdue: dayComplaints.filter((complaint) => isOverdueComplaint(complaint, overdueDays)).length,
    };
  });

  return {
    totalComplaints,
    overdueCount,
    statusData,
    categoryData,
    priorityData,
    trendData,
  };
}
