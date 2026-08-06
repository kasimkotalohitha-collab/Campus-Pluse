import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Filter,
  Loader2,
  MessageSquarePlus,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  PriorityBadge,
  StatusBadge,
} from "@/components/status-badge";

import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

import type {
  AIAnalysis,
  Category,
  Complaint,
  ComplaintComment,
  ComplaintStatus,
  ComplaintTimelineEvent,
  Priority,
} from "@/types";

export const Route = createFileRoute(
  "/app/complaints",
)({
  component: ComplaintsRoute,
});

type ComplaintRow = {
  id: string;
  title: string;
  description: string;

  category: string | null;
  priority: string | null;
  status: string | null;

  location: string | null;
  submitted_by: string | null;

  created_at: string | null;
  updated_at: string | null;

  building: string | null;
  anonymous: boolean | null;

  images: string[] | null;

  submitted_by_name: string | null;

  department: string | null;

  ai: AIAnalysis | null;

  timeline:
    | ComplaintTimelineEvent[]
    | null;

  comments:
    | ComplaintComment[]
    | null;

  assigned_to: string | null;
  assigned_faculty_name: string | null;

  admin_notes: string | null;
};

function mapComplaint(
  row: ComplaintRow,
): Complaint {
  const createdAt =
    row.created_at ??
    new Date().toISOString();

  return {
    id:
      row.id,

    title:
      row.title,

    description:
      row.description,

    category: (
      row.category ??
      "Other"
    ) as Category,

    building:
      row.building ??
      "N/A",

    location:
      row.location ??
      "N/A",

    urgency: (
      row.priority ??
      "Medium"
    ) as Priority,

    anonymous:
      row.anonymous ??
      false,

    images:
      row.images ??
      [],

    status: (
      row.status ??
      "Submitted"
    ) as ComplaintStatus,

    submittedBy:
      row.submitted_by ??
      "",

    submittedByName:
      row.submitted_by_name ??
      "Unknown",

    assignedTo:
      row.assigned_to ??
      undefined,

    assignedFacultyName:
      row.assigned_faculty_name ??
      undefined,

    department:
      row.department ??
      "General Admin",

    createdAt,

    updatedAt:
      row.updated_at ??
      createdAt,

    ai:
      row.ai ?? {
        category: (
          row.category ??
          "Other"
        ) as Category,

        priority: (
          row.priority ??
          "Medium"
        ) as Priority,

        confidence:
          0,

        department:
          row.department ??
          "General Admin",

        estimatedResolution:
          "Not available",

        keywords:
          [],
      },

    timeline:
      row.timeline ?? [
        {
          id:
            `t-${row.id}`,

          status: (
            row.status ??
            "Submitted"
          ) as ComplaintStatus,

          note:
            "Complaint received.",

          actor:
            "System",

          timestamp:
            createdAt,
        },
      ],

    comments:
      row.comments ??
      [],

    adminNotes:
      row.admin_notes ??
      undefined,
  };
}

function ComplaintsRoute() {
  const pathname =
    useRouterState({
      select: (
        state,
      ) =>
        state.location
          .pathname,
    });

  const isDetailPage =
    pathname !==
    "/app/complaints";

  if (
    isDetailPage
  ) {
    return <Outlet />;
  }

  return (
    <ComplaintsPage />
  );
}

function ComplaintsPage() {
  const {
    user,
  } = useAuth();

  const navigate =
    useNavigate();

  const [
    complaints,
    setComplaints,
  ] = useState<
    Complaint[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

  const [
    loadError,
    setLoadError,
  ] = useState(
    "",
  );

  const [
    q,
    setQ,
  ] = useState(
    "",
  );

  const [
    status,
    setStatus,
  ] = useState(
    "all",
  );

  const [
    priority,
    setPriority,
  ] = useState(
    "all",
  );

  const [
    category,
    setCategory,
  ] = useState(
    "all",
  );

  useEffect(() => {
    let active =
      true;

    async function loadComplaints() {
      setLoading(
        true,
      );

      setLoadError(
        "",
      );

      let query = supabase
        .from("complaints")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (user?.role === "student") {
        query = query.eq("submitted_by", user.id);
      } else if (user?.role === "faculty") {
        query = query.eq("assigned_to", user.id);
      }

      const { data, error } = await query;

      if (
        !active
      ) {
        return;
      }

      if (
        error
      ) {
        console.error(
          "Supabase complaints error:",
          error,
        );

        setLoadError(
          error.message,
        );

        setComplaints(
          [],
        );
      } else {
        const rows =
          (
            data ??
            []
          ) as ComplaintRow[];

        setComplaints(
          rows.map(
            mapComplaint,
          ),
        );
      }

      setLoading(
        false,
      );
    }

    loadComplaints();

    return () => {
      active = false;
    };
  }, [user]);

  const scoped =
    useMemo(
      () => {
        if (user?.role === "admin") {
          return complaints;
        }

        if (user?.role === "faculty") {
          return complaints.filter(
            (complaint) =>
              complaint.assignedTo ===
              user.id,
          );
        }

        return complaints.filter(
          (complaint) =>
            complaint.submittedBy ===
            user?.id,
        );
      },
      [
        complaints,
        user,
      ],
    );

  const filtered =
    useMemo(
      () => {
        return scoped.filter(
          (
            complaint,
          ) => {
            if (
              status !==
                "all" &&
              complaint.status !==
                status
            ) {
              return false;
            }

            if (
              priority !==
                "all" &&
              complaint.urgency !==
                priority
            ) {
              return false;
            }

            if (
              category !==
                "all" &&
              complaint.category !==
                category
            ) {
              return false;
            }

            if (
              q.trim()
            ) {
              const search =
                q
                  .trim()
                  .toLowerCase();

              const titleMatches =
                complaint.title
                  .toLowerCase()
                  .includes(
                    search,
                  );

              const idMatches =
                complaint.id
                  .toLowerCase()
                  .includes(
                    search,
                  );

              if (
                !titleMatches &&
                !idMatches
              ) {
                return false;
              }
            }

            return true;
          },
        );
      },
      [
        scoped,
        q,
        status,
        priority,
        category,
      ],
    );

  function openComplaint(
    complaintId: string,
  ) {
    navigate({
      to:
        "/app/complaints/$id",

      params: {
        id:
          String(
            complaintId,
          ),
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {user?.role === "admin"
            ? "All complaints"
            : user?.role === "faculty"
            ? "Assigned complaints"
            : "My complaints"}
          </h1>

          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading..."
              : `${filtered.length} ${
                  filtered.length ===
                  1
                    ? "result"
                    : "results"
                }`}
          </p>
        </div>

        {user?.role !== "faculty" && (
          <Button
            asChild
            className="gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            <Link to="/app/submit">
              <MessageSquarePlus className="mr-1.5 h-4 w-4" />

              New complaint
            </Link>
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search by title or ID..."
              value={
                q
              }
              onChange={(
                event,
              ) =>
                setQ(
                  event
                    .target
                    .value,
                )
              }
              className="pl-9"
            />
          </div>

          <Filter className="h-4 w-4 text-muted-foreground" />

          <Select
            value={
              status
            }
            onValueChange={
              setStatus
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All status
              </SelectItem>

              {[
                "Submitted",
                "Under Review",
                "Assigned",
                "In Progress",
                "Resolved",
                "Rejected",
              ].map(
                (
                  item,
                ) => (
                  <SelectItem
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {
                      item
                    }
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <Select
            value={
              priority
            }
            onValueChange={
              setPriority
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All priority
              </SelectItem>

              {[
                "Low",
                "Medium",
                "High",
                "Critical",
              ].map(
                (
                  item,
                ) => (
                  <SelectItem
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {
                      item
                    }
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <Select
            value={
              category
            }
            onValueChange={
              setCategory
            }
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All categories
              </SelectItem>

              {[
                "Electrical",
                "Plumbing",
                "Cleanliness",
                "Internet & IT",
                "Furniture",
                "Safety & Security",
                "Food Services",
                "Academics",
                "Transportation",
                "Other",
              ].map(
                (
                  item,
                ) => (
                  <SelectItem
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {
                      item
                    }
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loadError && (
        <Card className="border-destructive/40 p-4">
          <p className="text-sm font-medium text-destructive">
            Could not load
            complaints
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {
              loadError
            }
          </p>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />

              Loading
              complaints...
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  ID
                </TableHead>

                <TableHead>
                  Title
                </TableHead>

                <TableHead className="hidden md:table-cell">
                  Category
                </TableHead>

                <TableHead className="hidden lg:table-cell">
                  Building
                </TableHead>

                <TableHead>
                  Priority
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead className="hidden md:table-cell">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map(
                (
                  complaint,
                ) => (
                  <TableRow
                    key={
                      complaint.id
                    }
                    role="button"
                    tabIndex={
                      0
                    }
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      openComplaint(
                        complaint.id,
                      )
                    }
                    onKeyDown={(
                      event,
                    ) => {
                      if (
                        event.key ===
                          "Enter" ||
                        event.key ===
                          " "
                      ) {
                        event.preventDefault();

                        openComplaint(
                          complaint.id,
                        );
                      }
                    }}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {
                        complaint.id
                      }
                    </TableCell>

                    <TableCell className="max-w-[300px] truncate font-medium hover:text-primary">
                      {
                        complaint.title
                      }
                    </TableCell>

                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {
                        complaint.category
                      }
                    </TableCell>

                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {
                        complaint.building
                      }
                    </TableCell>

                    <TableCell>
                      <PriorityBadge
                        priority={
                          complaint.urgency
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={
                          complaint.status
                        }
                      />
                    </TableCell>

                    <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                      {new Date(
                        complaint.createdAt,
                      ).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ),
              )}

              {filtered.length ===
                0 && (
                <TableRow>
                  <TableCell
                    colSpan={
                      7
                    }
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No complaints
                    match your
                    filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}