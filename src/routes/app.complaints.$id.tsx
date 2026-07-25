import { Link, createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Building2, Calendar, MapPin, Send, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { AIAnalysisCard } from "@/components/ai-analysis-card";
import { ComplaintTimeline } from "@/components/complaint-timeline";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import type { ComplaintStatus } from "@/types";

export const Route = createFileRoute("/app/complaints/$id")({
  component: ComplaintDetailPage,
});

const STATUSES: ComplaintStatus[] = [
  "Submitted",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected",
];

function ComplaintDetailPage() {
  const { id } = useParams({ from: "/app/complaints/$id" });
  const { complaints, updateComplaintStatus, addComment, departments, assignComplaint } = useData();
  const { user } = useAuth();
  const [comment, setComment] = useState("");

  const complaint = complaints.find((c) => c.id === id);

  if (!complaint) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <h2 className="text-xl font-semibold">Complaint not found</h2>
        <Button asChild className="mt-4">
          <Link to="/app/complaints">Back to complaints</Link>
        </Button>
      </div>
    );
  }

  function submitComment() {
    if (!comment.trim() || !user) return;
    addComment(complaint!.id, comment, user.name, user.role);
    setComment("");
    toast.success("Comment added");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link to="/app/complaints">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted-foreground">{complaint.id}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{complaint.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.urgency} />
              <span className="text-xs text-muted-foreground">
                Submitted by {complaint.submittedByName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-sm font-semibold">Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {complaint.description}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm sm:grid-cols-4">
              <Meta icon={Building2} label="Building" value={complaint.building} />
              <Meta icon={MapPin} label="Location" value={complaint.location} />
              <Meta icon={User} label="Department" value={complaint.department} />
              <Meta
                icon={Calendar}
                label="Submitted"
                value={new Date(complaint.createdAt).toLocaleDateString()}
              />
            </dl>
            {complaint.images.length > 0 && (
              <div className="mt-5 grid grid-cols-4 gap-2 border-t border-border pt-5">
                {complaint.images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="aspect-square w-full rounded-lg border border-border object-cover"
                  />
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-5 text-sm font-semibold">Timeline</h2>
            <ComplaintTimeline events={complaint.timeline} />
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold">Comments</h2>
            <div className="mt-4 space-y-4">
              {complaint.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              ) : (
                complaint.comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {c.author.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold">{c.author}</span>
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase text-accent-foreground">
                          {c.role}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{c.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <Button onClick={submitComment} size="sm">
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Post comment
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <AIAnalysisCard analysis={complaint.ai} />

          {user?.role === "admin" && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold">Admin actions</h3>
              <div className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <Select
                    value={complaint.status}
                    onValueChange={(v) => {
                      updateComplaintStatus(complaint.id, v as ComplaintStatus);
                      toast.success(`Status updated to ${v}`);
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Assign to</label>
                  <Select
                    value={complaint.assignedTo ?? ""}
                    onValueChange={(v) => {
                      assignComplaint(complaint.id, v);
                      toast.success(`Assigned to ${v}`);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department head" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.head}>
                          {d.head} · {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {complaint.adminNotes && (
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
                    <p className="font-semibold text-foreground">Admin notes</p>
                    <p className="mt-1 text-muted-foreground">{complaint.adminNotes}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {complaint.assignedTo && (
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Assigned to</p>
              <p className="mt-1 text-sm font-semibold">{complaint.assignedTo}</p>
              <p className="text-xs text-muted-foreground">{complaint.department}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
