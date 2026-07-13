"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { complaintCategoryOptions, complaintPriorityOptions, complaintStatusOptions } from "@/lib/constants";

type ComplaintRow = {
  id: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  resident: {
    name: string;
    email: string;
  };
  historyCount: number;
  overdue: boolean;
};

type ComplaintHistoryItem = {
  id: string;
  previousStatus: string | null;
  newStatus: string;
  actorName: string;
  note: string | null;
  proofPhotoUrl: string | null;
  timestamp: string;
};

type Props = {
  complaints: ComplaintRow[];
};

export function AdminComplaintsClient({ complaints }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [status, setStatus] = useState("OPEN");
  const [priority, setPriority] = useState("MEDIUM");
  const [note, setNote] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadedProofUrl, setUploadedProofUrl] = useState("");
  const [history, setHistory] = useState<ComplaintHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const selectedComplaint = useMemo(
    () => complaints.find((complaint) => complaint.id === selectedComplaintId) ?? null,
    [complaints, selectedComplaintId]
  );

  async function openComplaint(complaint: ComplaintRow) {
    setSelectedComplaintId(complaint.id);
    setStatus(complaint.status);
    setPriority(complaint.priority);
    setNote("");
    setProofFile(null);
    setUploadedProofUrl("");
    if (proofInputRef.current) {
      proofInputRef.current.value = "";
    }
    setLoadingHistory(true);

    try {
      const response = await fetch(`/api/admin/complaints/${complaint.id}`);
      const data = (await response.json()) as {
        complaint?: { history?: ComplaintHistoryItem[] };
      };
      setHistory(data.complaint?.history ?? []);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function updateComplaint() {
    if (!selectedComplaintId) return;

    try {
      let proofPhotoUrl = uploadedProofUrl || undefined;
      if (proofFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", proofFile);

        const uploadResponse = await fetch("/api/uploads/photo", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload proof photo");
        }

        const uploadData = (await uploadResponse.json()) as { url: string };
        proofPhotoUrl = uploadData.url;
        setUploadedProofUrl(uploadData.url);
      }

      const response = await fetch(`/api/admin/complaints/${selectedComplaintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority, note, proofPhotoUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to update complaint");
      }

      toast.success("Complaint updated");
      setNote("");
      setProofFile(null);
      setUploadedProofUrl("");
      if (proofInputRef.current) {
        proofInputRef.current.value = "";
      }
      setSelectedComplaintId(null);
      setHistory([]);
      router.refresh();
    } catch {
      toast.error("Unable to update complaint");
    }
  }

  function updateQuery(next: Record<string, string | undefined>) {
    const url = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) {
        url.set(key, value);
      } else {
        url.delete(key);
      }
    }

    const queryString = url.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }

  const filters = {
    status: searchParams.get("status") ?? "",
    category: searchParams.get("category") ?? "",
    priority: searchParams.get("priority") ?? "",
    search: searchParams.get("search") ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-4">
        <Input
          placeholder="Search complaints"
          defaultValue={filters.search}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const value = (event.currentTarget as HTMLInputElement).value;
              updateQuery({ search: value || undefined });
            }
          }}
        />
        <Select
          defaultValue={filters.status}
          onChange={(event) => {
            updateQuery({ status: event.target.value || undefined });
          }}
        >
          <option value="">All Statuses</option>
          {complaintStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select
          defaultValue={filters.category}
          onChange={(event) => {
            updateQuery({ category: event.target.value || undefined });
          }}
        >
          <option value="">All Categories</option>
          {complaintCategoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select
          defaultValue={filters.priority}
          onChange={(event) => {
            updateQuery({ priority: event.target.value || undefined });
          }}
        >
          <option value="">All Priorities</option>
          {complaintPriorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3">Resident</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Overdue</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-muted-foreground" colSpan={6}>
                  No complaints match these filters.
                </td>
              </tr>
            ) : (
              complaints.map((complaint) => (
                <tr key={complaint.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{complaint.resident.name}</div>
                    <div className="text-xs text-muted-foreground">{complaint.resident.email}</div>
                  </td>
                  <td className="px-4 py-3">{complaint.category}</td>
                  <td className="px-4 py-3">{complaint.status}</td>
                  <td className="px-4 py-3">{complaint.priority}</td>
                  <td className="px-4 py-3">{complaint.overdue ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        void openComplaint(complaint);
                      }}
                    >
                      Resolve / Update
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedComplaint ? (
        <Card className="border-border/70">
          <CardContent className="space-y-4 p-6">
            <div>
              <h3 className="text-lg font-semibold">Update complaint</h3>
              <p className="text-sm text-muted-foreground">
                Editing complaint from {selectedComplaint.resident.name}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <div className="font-medium">{selectedComplaint.description}</div>
              <div className="mt-1 text-muted-foreground">
                Created at {new Date(selectedComplaint.createdAt).toLocaleString()} - Overdue{" "}
                {selectedComplaint.overdue ? "Yes" : "No"}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                  {complaintStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={priority} onChange={(event) => setPriority(event.target.value)}>
                  {complaintPriorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Resolution note</Label>
                <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
                <p className="text-xs text-muted-foreground">
                  Saved with the next status update and shown in complaint history.
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proofPhoto">Optional proof photo</Label>
              <Input
                ref={proofInputRef}
                id="proofPhoto"
                type="file"
                accept="image/*"
                onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
              />
              {uploadedProofUrl ? (
                <p className="break-all text-xs text-muted-foreground">{uploadedProofUrl}</p>
              ) : null}
            </div>
            <div className="flex gap-3">
              <Button type="button" onClick={updateComplaint}>
                Save changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedComplaintId(null);
                  setProofFile(null);
                  setUploadedProofUrl("");
                  setNote("");
                  setHistory([]);
                  if (proofInputRef.current) {
                    proofInputRef.current.value = "";
                  }
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Complaint history
              </h4>
              {loadingHistory ? (
                <p className="text-sm text-muted-foreground">Loading history...</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history entries yet.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div key={entry.id} className="rounded-lg border px-4 py-3 text-sm">
                      <div className="font-medium">
                        {entry.previousStatus ?? "Created"} {"->"} {entry.newStatus}
                      </div>
                      <div className="text-muted-foreground">
                        By {entry.actorName} on {new Date(entry.timestamp).toLocaleString()}
                      </div>
                      {entry.note ? <div className="mt-1">{entry.note}</div> : null}
                      {entry.proofPhotoUrl ? (
                        <div className="mt-3">
                          <Image
                            src={entry.proofPhotoUrl}
                            alt="Resolution proof"
                            width={720}
                            height={480}
                            className="h-auto max-h-48 rounded-lg border object-cover"
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
