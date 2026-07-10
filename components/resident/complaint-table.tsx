import { Complaint, ComplaintPriority, ComplaintStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { complaintCategoryLabels, complaintPriorityLabels, complaintStatusLabels } from "@/lib/constants";

type ComplaintTableProps = {
  complaints: Complaint[];
};

const priorityTone: Record<ComplaintPriority, "default" | "secondary" | "destructive"> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "destructive",
};

const statusTone: Record<ComplaintStatus, "default" | "secondary" | "outline"> = {
  OPEN: "secondary",
  IN_PROGRESS: "default",
  RESOLVED: "outline",
  CLOSED: "outline",
};

export function ComplaintTable({ complaints }: ComplaintTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                No complaints yet. Raise the first one from the form above.
              </TableCell>
            </TableRow>
          ) : (
            complaints.map((complaint) => (
              <TableRow key={complaint.id}>
                <TableCell>{complaintCategoryLabels[complaint.category]}</TableCell>
                <TableCell>
                  <Badge variant={statusTone[complaint.status]}>
                    {complaintStatusLabels[complaint.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityTone[complaint.priority]}>
                    {complaintPriorityLabels[complaint.priority]}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[24rem] truncate">{complaint.description}</TableCell>
                <TableCell>{new Date(complaint.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
