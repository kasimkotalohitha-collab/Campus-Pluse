import { Link, createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Loader2,
  MapPin,
  Send,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  PriorityBadge,
  StatusBadge,
} from "@/components/status-badge";

import {
  AIAnalysisCard,
} from "@/components/ai-analysis-card";

import {
  ComplaintTimeline,
} from "@/components/complaint-timeline";

import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { supabase } from "@/lib/supabase";

import type {
  Complaint,
  ComplaintStatus,
} from "@/types";

export const Route = createFileRoute(
  "/app/complaints/$id",
)({
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
  const { id } = useParams({
    from: "/app/complaints/$id",
  });

  const {
    departments,
    updateComplaintStatus,
    addComment,
    assignComplaint,
  } = useData();

  const { user } = useAuth();

  const [complaint, setComplaint] =
    useState<Complaint | null>(null);

  const [comment, setComment] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [savingComment, setSavingComment] =
    useState(false);

  const [savingStatus, setSavingStatus] =
    useState(false);

  const [savingAssignment, setSavingAssignment] =
    useState(false);

  useEffect(() => {
    async function loadComplaint() {
      setLoading(true);
      setComplaint(null);

      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(
          "Error loading complaint:",
          error,
        );

        toast.error(
          "Could not load this complaint",
        );

        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      const mappedComplaint: Complaint = {
        id: data.id,

        title:
          data.title ??
          "Untitled complaint",

        description:
          data.description ??
          "",

        category:
          data.category ??
          "Other",

        urgency:
          data.priority ??
          "Medium",

        status:
          data.status ??
          "Submitted",

        location:
          data.location ??
          "Not specified",

        building:
          data.building ??
          "Not specified",

        department:
          data.department ??
          "Not assigned",

        submittedBy:
          data.submitted_by ??
          "",

        submittedByName:
          data.submitted_by ??
          "Student",
        anonymous:
  data.anonymous ?? false,
        createdAt:
          data.created_at ??
          new Date().toISOString(),

        updatedAt:
          data.updated_at ??
          data.created_at ??
          new Date().toISOString(),

        assignedTo:
          data.assigned_to ??
          undefined,

        adminNotes:
          data.admin_notes ??
          undefined,

        images:
          Array.isArray(data.images)
            ? data.images
            : [],

        comments:
          Array.isArray(data.comments)
            ? data.comments
            : [],

        timeline:
          Array.isArray(data.timeline)
            ? data.timeline
            : [],

        ai:
          data.ai ??
          {
            category:
              data.category ?? "Other",
            priority:
              data.priority ?? "Medium",
            confidence: 0,
            summary:
              "AI analysis is not available yet.",
          },
      };

      setComplaint(mappedComplaint);
      setLoading(false);
    }

    loadComplaint();
  }, [id]);

  async function submitComment() {
    if (
      !comment.trim() ||
      !user ||
      !complaint ||
      savingComment
    ) {
      return;
    }

    setSavingComment(true);

    const newComment = {
      id: `c-${Date.now()}`,

      author:
        user.name ??
        "User",

      role:
        user.role,

      message:
        comment.trim(),

      createdAt:
        new Date().toISOString(),
    };

    const updatedComments = [
      ...(complaint.comments ?? []),
      newComment,
    ];

    const { error } = await supabase
      .from("complaints")
      .update({
        comments:
          updatedComments,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        complaint.id,
      );

    if (error) {
      console.error(
        "Comment error:",
        error,
      );

      toast.error(
        "Could not save the comment",
      );

      setSavingComment(false);
      return;
    }

    setComplaint({
      ...complaint,

      comments:
        updatedComments,
    });

    addComment(
      complaint.id,
      newComment.message,
      newComment.author,
      newComment.role,
    );

    setComment("");

    setSavingComment(false);

    toast.success(
      "Comment added",
    );
  }

  async function handleStatusChange(
    value: string,
  ) {
    if (
      !complaint ||
      savingStatus
    ) {
      return;
    }

    const newStatus =
      value as ComplaintStatus;

    setSavingStatus(true);

    const newTimelineEvent = {
      id: `t-${Date.now()}`,

      status:
        newStatus,

      note:
        `Status updated to ${newStatus}`,

      actor:
        user?.name ??
        "Admin",

      timestamp:
        new Date().toISOString(),
    };

    const updatedTimeline = [
      ...(complaint.timeline ?? []),
      newTimelineEvent,
    ];

    const { error } = await supabase
      .from("complaints")
      .update({
        status:
          newStatus,

        timeline:
          updatedTimeline,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        complaint.id,
      );

    if (error) {
      console.error(
        "Status error:",
        error,
      );

      toast.error(
        "Could not update the status",
      );

      setSavingStatus(false);
      return;
    }

    setComplaint({
      ...complaint,

      status:
        newStatus,

      timeline:
        updatedTimeline,
    });

    updateComplaintStatus(
      complaint.id,
      newStatus,
    );

    setSavingStatus(false);

    toast.success(
      `Status updated to ${newStatus}`,
    );
  }

  async function handleAssignment(
    assignee: string,
  ) {
    if (
      !complaint ||
      savingAssignment
    ) {
      return;
    }

    setSavingAssignment(true);

    const selectedDepartment =
      departments.find(
        (department) =>
          department.head ===
          assignee,
      );

    const { error } = await supabase
      .from("complaints")
      .update({
        assigned_to:
          assignee,

        department:
          selectedDepartment?.name ??
          complaint.department,

        status:
          "Assigned",

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        complaint.id,
      );

    if (error) {
      console.error(
        "Assignment error:",
        error,
      );

      toast.error(
        "Could not save the assignment",
      );

      setSavingAssignment(false);
      return;
    }

    setComplaint({
      ...complaint,

      assignedTo:
        assignee,

      department:
        selectedDepartment?.name ??
        complaint.department,

      status:
        "Assigned",
    });

    assignComplaint(
      complaint.id,
      assignee,
    );

    setSavingAssignment(false);

    toast.success(
      `Assigned to ${assignee}`,
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <h2 className="text-xl font-semibold">
          Complaint not found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          This complaint does not exist
          or could not be loaded.
        </p>

        <Button
          asChild
          className="mt-4"
        >
          <Link to="/app/complaints">
            Back to complaints
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2"
        >
          <Link to="/app/complaints">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted-foreground">
              {complaint.id}
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {complaint.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge
                status={
                  complaint.status
                }
              />

              <PriorityBadge
                priority={
                  complaint.urgency
                }
              />

              <span className="text-xs text-muted-foreground">
                Submitted by{" "}
                {
                  complaint.submittedByName
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-sm font-semibold">
              Description
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {
                complaint.description
              }
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm sm:grid-cols-4">
              <Meta
                icon={
                  Building2
                }
                label="Building"
                value={
                  complaint.building
                }
              />

              <Meta
                icon={
                  MapPin
                }
                label="Location"
                value={
                  complaint.location
                }
              />

              <Meta
                icon={
                  User
                }
                label="Department"
                value={
                  complaint.department
                }
              />

              <Meta
                icon={
                  Calendar
                }
                label="Submitted"
                value={new Date(
                  complaint.createdAt,
                ).toLocaleDateString()}
              />
            </dl>

            {complaint.images
              ?.length > 0 && (
              <div className="mt-5 grid grid-cols-4 gap-2 border-t border-border pt-5">
                {complaint.images.map(
                  (
                    src,
                    index,
                  ) => (
                    <img
                      key={
                        index
                      }
                      src={
                        src
                      }
                      alt={`Complaint attachment ${
                        index +
                        1
                      }`}
                      className="aspect-square w-full rounded-lg border border-border object-cover"
                    />
                  ),
                )}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-5 text-sm font-semibold">
              Timeline
            </h2>

            {complaint.timeline
              ?.length > 0 ? (
              <ComplaintTimeline
                events={
                  complaint.timeline
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No timeline updates yet.
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold">
              Comments
            </h2>

            <div className="mt-4 space-y-4">
              {complaint.comments
                ?.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No comments yet.
                </p>
              ) : (
                complaint.comments?.map(
                  (
                    currentComment,
                  ) => (
                    <div
                      key={
                        currentComment.id
                      }
                      className="flex gap-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {currentComment.author
                            .split(
                              " ",
                            )
                            .map(
                              (
                                word,
                              ) =>
                                word[0],
                            )
                            .slice(
                              0,
                              2,
                            )
                            .join(
                              "",
                            )}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold">
                            {
                              currentComment.author
                            }
                          </span>

                          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase text-accent-foreground">
                            {
                              currentComment.role
                            }
                          </span>

                          <span className="text-muted-foreground">
                            {new Date(
                              currentComment.createdAt,
                            ).toLocaleString()}
                          </span>
                        </div>

                        <p className="mt-1 text-sm">
                          {
                            currentComment.message
                          }
                        </p>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <Textarea
                value={
                  comment
                }
                onChange={(
                  event,
                ) =>
                  setComment(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Add a comment..."
                rows={3}
              />

              <div className="mt-2 flex justify-end">
                <Button
                  onClick={
                    submitComment
                  }
                  disabled={
                    savingComment ||
                    !comment.trim()
                  }
                  size="sm"
                >
                  {savingComment ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                  )}

                  Post comment
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <AIAnalysisCard
            analysis={
              complaint.ai
            }
          />

          {user?.role ===
            "admin" && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold">
                Admin actions
              </h3>

              <div className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Status
                  </label>

                  <Select
                    value={
                      complaint.status
                    }
                    onValueChange={
                      handleStatusChange
                    }
                    disabled={
                      savingStatus
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {STATUSES.map(
                        (
                          status,
                        ) => (
                          <SelectItem
                            key={
                              status
                            }
                            value={
                              status
                            }
                          >
                            {
                              status
                            }
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Assign to
                  </label>

                  <Select
                    value={
                      complaint.assignedTo ??
                      ""
                    }
                    onValueChange={
                      handleAssignment
                    }
                    disabled={
                      savingAssignment
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department head" />
                    </SelectTrigger>

                    <SelectContent>
                      {departments.map(
                        (
                          department,
                        ) => (
                          <SelectItem
                            key={
                              department.id
                            }
                            value={
                              department.head
                            }
                          >
                            {
                              department.head
                            }
                            {" · "}
                            {
                              department.name
                            }
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {complaint.adminNotes && (
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
                    <p className="font-semibold text-foreground">
                      Admin notes
                    </p>

                    <p className="mt-1 text-muted-foreground">
                      {
                        complaint.adminNotes
                      }
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {complaint.assignedTo && (
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">
                Assigned to
              </p>

              <p className="mt-1 text-sm font-semibold">
                {
                  complaint.assignedTo
                }
              </p>

              <p className="text-xs text-muted-foreground">
                {
                  complaint.department
                }
              </p>
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
        <Icon className="h-3 w-3" />

        {label}
      </dt>

      <dd className="mt-1 text-sm font-medium">
        {value}
      </dd>
    </div>
  );
}