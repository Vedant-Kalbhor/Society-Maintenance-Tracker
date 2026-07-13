import { ComplaintStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type ComplaintSortableFields = {
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: string;
  createdAt: Date;
};

export function isOverdueComplaint<T extends { status: ComplaintStatus; createdAt: Date }>(
  complaint: T,
  overdueDays: number
) {
  if (complaint.status === ComplaintStatus.RESOLVED || complaint.status === ComplaintStatus.CLOSED) {
    return false;
  }

  const ageInMs = Date.now() - new Date(complaint.createdAt).getTime();
  const thresholdInMs = overdueDays * 24 * 60 * 60 * 1000;
  return ageInMs > thresholdInMs;
}

export function sortComplaintsForAdmin<T extends ComplaintSortableFields>(
  complaints: T[],
  overdueDays: number,
  searchTerm?: string
): T[] {
  const filtered = searchTerm
    ? complaints.filter((complaint) => {
        const needle = searchTerm.toLowerCase();
        return (
          complaint.description.toLowerCase().includes(needle) ||
          complaint.category.toLowerCase().includes(needle) ||
          complaint.status.toLowerCase().includes(needle) ||
          complaint.priority.toLowerCase().includes(needle)
        );
      })
    : complaints;

  return [...filtered].sort((a, b) => {
    const overdueA = isOverdueComplaint(a, overdueDays) ? 1 : 0;
    const overdueB = isOverdueComplaint(b, overdueDays) ? 1 : 0;

    if (overdueA !== overdueB) {
      return overdueB - overdueA;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }) as T[];
}

export async function createComplaintHistoryEntry(params: {
  complaintId: string;
  previousStatus: ComplaintStatus | null;
  newStatus: ComplaintStatus;
  actorId: string | null;
  actorName: string;
  note?: string | null;
  proofPhotoUrl?: string | null;
  tx?: Prisma.TransactionClient;
}) {
  const client = params.tx ?? prisma;

  return client.complaintHistory.create({
    data: {
      complaintId: params.complaintId,
      previousStatus: params.previousStatus,
      newStatus: params.newStatus,
      actorId: params.actorId,
      actorName: params.actorName,
      note: params.note ?? null,
      proofPhotoUrl: params.proofPhotoUrl ?? null,
    },
  });
}
