"use client";

import { useEffect, useState } from "react";
import type { ComplaintCategory, ComplaintPriority, ComplaintStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { complaintCategoryLabels, complaintPriorityLabels, complaintStatusLabels } from "@/lib/constants";

type HistoryItem = {
  id: string;
  previousStatus: ComplaintStatus | null;
  newStatus: ComplaintStatus;
  actorName: string;
  note: string | null;
  proofPhotoUrl: string | null;
  timestamp: string;
};

type ComplaintRow = {
  id: string;
  category: ComplaintCategory;
  description: string;
  photoUrl: string | null;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
};

type Props = {
  complaints: ComplaintRow[];
};

export function ComplaintHistoryView({ complaints }: Props) {
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(
    complaints[0]?.id ?? null
  );
  const activeComplaint = complaints.find((complaint) => complaint.id === activeComplaintId) ?? null;
  const [history, setHistory] = useState<HistoryItem[] | null>(null);

  useEffect(() => {
    if (!activeComplaintId) {
      setHistory([]);
      return;
    }

    let cancelled = false;
    setHistory(null);

    void fetch(`/api/complaints/${activeComplaintId}/history`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return { history: [] as HistoryItem[] };
        }
        return (await response.json()) as { history?: HistoryItem[] };
      })
      .then((data) => {
        if (!cancelled) {
          setHistory(data.history ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHistory([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeComplaintId]);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {complaints.length === 0 ? (
              <p className="py-8 text-sm text-muted-foreground">
                You have not raised any complaints yet.
              </p>
            ) : (
              complaints.map((complaint) => (
                <button
                  key={complaint.id}
                  type="button"
                  onClick={() => setActiveComplaintId(complaint.id)}
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    activeComplaintId === complaint.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{complaintCategoryLabels[complaint.category]}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(complaint.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>{complaintStatusLabels[complaint.status]}</div>
                      <div>{complaintPriorityLabels[complaint.priority]}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          {activeComplaint ? (
            <>
              <div>
                <h3 className="text-xl font-semibold">
                  {complaintCategoryLabels[activeComplaint.category]}
                </h3>
                <p className="text-sm text-muted-foreground">{activeComplaint.description}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Full Status History
                </h4>
                {history === null ? (
                  <p className="text-sm text-muted-foreground">Loading status history...</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No history entries yet.</p>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="rounded-lg border p-4">
                      <div className="font-medium">
                        {item.previousStatus ?? "Created"} {"->"} {item.newStatus}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        By {item.actorName} on {new Date(item.timestamp).toLocaleString()}
                      </div>
                      {item.note ? <p className="mt-2 text-sm">{item.note}</p> : null}
                      {item.proofPhotoUrl ? (
                        <Button asChild variant="outline" className="mt-3">
                          <a href={item.proofPhotoUrl} target="_blank" rel="noreferrer">
                            View proof photo
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a complaint to view its history.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
