import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";

import type {
  AIAnalysis,
  Category,
  Complaint,
  ComplaintComment,
  ComplaintStatus,
  ComplaintTimelineEvent,
  Department,
  Notification,
  Priority,
  Role,
  User,
} from "@/types";

interface DataContextValue {
  complaints: Complaint[];
  notifications: Notification[];
  users: User[];
  departments: Department[];
  isLoading: boolean;

  addComplaint: (
    complaint: Complaint
  ) => Promise<void>;

  updateComplaintStatus: (
    id: string,
    status: ComplaintStatus,
    note?: string
  ) => Promise<void>;

  assignComplaint: (
    id: string,
    assigneeId: string,
    assigneeName?: string
  ) => Promise<void>;

  addComment: (
    id: string,
    message: string,
    author: string,
    role: Role
  ) => Promise<void>;

  markNotificationRead: (
    id: string
  ) => void;

  markAllRead: (
    userId: string
  ) => void;
}

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
  timeline: ComplaintTimelineEvent[] | null;
  comments: ComplaintComment[] | null;
  assigned_to: string | null;
  assigned_faculty_name: string | null;
  assigned_at: string | null;
  admin_notes: string | null;
};

type ProfileRow = {
  id: string;
  name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  department?: string;
  student_id?: string;
  phone?: string;
  joined_at?: string;
  avatar?: string;
};

/* ---------------------------------------------------------
   COMPLAINT MAPPER
--------------------------------------------------------- */

function mapComplaint(
  row: ComplaintRow
): Complaint {
  const createdAt =
    row.created_at ??
    new Date().toISOString();

  return {
    id: row.id,
    title: row.title,
    description: row.description,

    category:
      (row.category ?? "Other") as Category,

    building:
      row.building ?? "N/A",

    location:
      row.location ?? "N/A",

    urgency:
      (row.priority ?? "Medium") as Priority,

    anonymous:
      row.anonymous ?? false,

    images:
      row.images ?? [],

    status:
      (row.status ??
        "Submitted") as ComplaintStatus,

    submittedBy:
      row.submitted_by ?? "",

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
      row.updated_at ?? createdAt,

    ai:
      row.ai ?? {
        category:
          (row.category ??
            "Other") as Category,

        priority:
          (row.priority ??
            "Medium") as Priority,

        confidence: 0,

        department:
          row.department ??
          "General Admin",

        estimatedResolution:
          "Not available",

        keywords: [],
      },

    timeline:
      row.timeline ?? [
        {
          id: `timeline-${row.id}`,

          status:
            (row.status ??
              "Submitted") as ComplaintStatus,

          note:
            "Complaint received.",

          actor:
            "System",

          timestamp:
            createdAt,
        },
      ],

    comments:
      row.comments ?? [],

    adminNotes:
      row.admin_notes ??
      undefined,
  };
}

/* ---------------------------------------------------------
   PROFILE -> USER
--------------------------------------------------------- */

function buildUserFromProfile(
  profile: ProfileRow
): User {
  let role: Role = "student";

  if (profile.role === "admin") {
    role = "admin";
  } else if (profile.role === "faculty") {
    role = "faculty";
  } else if (profile.role === "student") {
    role = "student";
  }

  return {
    id: profile.id,

    name:
      profile.full_name ??
      profile.name ??
      profile.email?.split("@")[0] ??
      "CampusPulse User",

    email:
      profile.email ?? "",

    role,

    department:
      profile.department ??
      (role === "admin"
        ? "Campus Operations"
        : role === "faculty"
          ? "Faculty"
          : "Computer Science"),

    studentId:
      profile.student_id,

    phone:
      profile.phone,

    joinedAt:
      profile.joined_at ??
      new Date().toISOString(),

    avatar:
      profile.avatar,
  };
}

/* ---------------------------------------------------------
   NOTIFICATIONS
--------------------------------------------------------- */

function createNotification(
  type: Notification["type"],
  title: string,
  body: string,
  userId: string,
  complaintId?: string
): Notification {
  return {
    id:
      `n-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    userId,

    type,

    title,

    body,

    createdAt:
      new Date().toISOString(),

    read: false,

    complaintId,
  };
}

/* ---------------------------------------------------------
   DATA CONTEXT
--------------------------------------------------------- */

const DataContext =
  createContext<DataContextValue | undefined>(
    undefined
  );

export function DataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [complaints, setComplaints] =
    useState<Complaint[]>([]);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [users, setUsers] =
    useState<User[]>([]);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  /* -------------------------------------------------------
     LOAD DATA
  ------------------------------------------------------- */

  useEffect(() => {
    let active = true;

    async function loadData() {
      setIsLoading(true);

      try {
        const [
          complaintsResult,
          profilesResult,
        ] = await Promise.all([
          supabase
            .from("complaints")
            .select("*")
            .order(
              "created_at",
              {
                ascending: false,
              }
            ),

          supabase
            .from("profiles")
            .select(
              `
                id,
                name,
                full_name,
                email,
                role,
                department,
                student_id,
                phone,
                joined_at,
                avatar
              `
            )
            .order(
              "full_name",
              {
                ascending: true,
              }
            ),
        ]);

        if (!active) return;

        /* -----------------------------------------------
           COMPLAINTS
        ------------------------------------------------ */

        if (
          complaintsResult.error
        ) {
          console.error(
            "Error fetching complaints:",
            complaintsResult.error
          );

          setComplaints([]);
        } else {
          const rows =
            (complaintsResult.data ??
              []) as ComplaintRow[];

          setComplaints(
            rows.map(mapComplaint)
          );
        }

        /* -----------------------------------------------
           USERS
        ------------------------------------------------ */

        if (
          profilesResult.error
        ) {
          /*
           * IMPORTANT:
           * Don't silently hide this error.
           */
          console.error(
            "ERROR FETCHING PROFILES:",
            profilesResult.error
          );

          setUsers([]);
        } else {
          const rows =
            (profilesResult.data ??
              []) as ProfileRow[];

          console.log(
            "CampusPulse profiles loaded:",
            rows
          );

          const mappedUsers =
            rows.map(
              buildUserFromProfile
            );

          console.log(
            "CampusPulse users loaded:",
            mappedUsers
          );

          setUsers(mappedUsers);
        }

        /* -----------------------------------------------
           DEPARTMENTS
        ------------------------------------------------ */

        const complaintDepartments =
          (
            (complaintsResult.data ??
              []) as ComplaintRow[]
          ).map(
            (row) =>
              row.department ??
              "General Admin"
          );

        const profileDepartments =
          (
            (profilesResult.data ??
              []) as ProfileRow[]
          ).map(
            (row) =>
              row.department ??
              "General Admin"
          );

        const allDepartments = [
          ...complaintDepartments,
          ...profileDepartments,
        ];

        const uniqueDepartments =
          Array.from(
            new Set(
              allDepartments
            )
          );

        setDepartments(
          uniqueDepartments.map(
            (name) => ({
              id: name,
              name,
              head: name,
              workload: 0,
              resolved: 0,
            })
          )
        );
      } catch (error) {
        console.error(
          "Data loading failed:",
          error
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    /* -----------------------------------------------------
       REALTIME COMPLAINTS
    ----------------------------------------------------- */

    const channel =
      supabase.channel(
        "complaints-realtime"
      );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "complaints",
      },
      (payload) => {
        const row =
          payload.new ??
          payload.old;

        /* INSERT */

        if (
          payload.eventType ===
          "INSERT"
        ) {
          const mapped =
            mapComplaint(
              row as ComplaintRow
            );

          setComplaints(
            (prev) => [
              mapped,
              ...prev.filter(
                (item) =>
                  item.id !==
                  mapped.id
              ),
            ]
          );

          setNotifications(
            (prev) => [
              createNotification(
                "update",
                "Complaint submitted",
                `${mapped.title} has been received.`,
                mapped.submittedBy,
                mapped.id
              ),
              ...prev,
            ]
          );

          return;
        }

        /* UPDATE */

        if (
          payload.eventType ===
          "UPDATE"
        ) {
          const mapped =
            mapComplaint(
              row as ComplaintRow
            );

          setComplaints(
            (prev) =>
              prev.some(
                (item) =>
                  item.id ===
                  mapped.id
              )
                ? prev.map(
                    (item) =>
                      item.id ===
                      mapped.id
                        ? mapped
                        : item
                  )
                : [
                    mapped,
                    ...prev,
                  ]
          );

          return;
        }

        /* DELETE */

        if (
          payload.eventType ===
          "DELETE"
        ) {
          const deleted =
            row as Partial<ComplaintRow>;

          setComplaints(
            (prev) =>
              prev.filter(
                (item) =>
                  item.id !==
                  deleted.id
              )
          );
        }
      }
    );

    void channel.subscribe();

    return () => {
      active = false;

      void supabase.removeChannel(
        channel
      );
    };
  }, []);

  /* -------------------------------------------------------
     CONTEXT VALUE
  ------------------------------------------------------- */

  const value =
    useMemo<DataContextValue>(
      () => ({
        complaints,

        notifications,

        users,

        departments,

        isLoading,

        /* -----------------------------------------------
           ADD COMPLAINT
        ------------------------------------------------ */

        async addComplaint(
          complaint
        ) {
          const {
            error,
          } =
            await supabase
              .from("complaints")
              .insert({
                id:
                  complaint.id,

                title:
                  complaint.title,

                description:
                  complaint.description,

                category:
                  complaint.category,

                priority:
                  complaint.urgency,

                status:
                  complaint.status,

                location:
                  complaint.location,

                submitted_by:
                  complaint.submittedBy,

                submitted_by_name:
                  complaint.submittedByName,

                created_at:
                  complaint.createdAt,

                updated_at:
                  complaint.updatedAt,

                building:
                  complaint.building,

                anonymous:
                  complaint.anonymous,

                images:
                  complaint.images,

                department:
                  complaint.department,

                ai:
                  complaint.ai,

                timeline:
                  complaint.timeline,

                comments:
                  complaint.comments,

                assigned_to:
                  complaint.assignedTo ??
                  null,

                assigned_faculty_name:
                  complaint.assignedFacultyName ??
                  null,

                assigned_at:
                  complaint.assignedTo
                    ? complaint.updatedAt
                    : null,
              });

          if (error) {
            console.error(
              "Failed to add complaint:",
              error
            );

            throw new Error(
              error.message
            );
          }

          setComplaints(
            (prev) => [
              complaint,
              ...prev.filter(
                (item) =>
                  item.id !==
                  complaint.id
              ),
            ]
          );

          setNotifications(
            (prev) => [
              createNotification(
                "update",
                "Complaint submitted",
                `${complaint.title} has been received.`,
                complaint.submittedBy,
                complaint.id
              ),
              ...prev,
            ]
          );
        },

        /* -----------------------------------------------
           UPDATE STATUS
        ------------------------------------------------ */

        async updateComplaintStatus(
          id,
          status,
          note
        ) {
          const existing =
            complaints.find(
              (item) =>
                item.id === id
            );

          const updatedAt =
            new Date().toISOString();

          const nextTimeline = [
            ...(existing?.timeline ??
              []),

            {
              id:
                `t-${Date.now()}`,

              status,

              note:
                note ??
                `Status updated to ${status}`,

              actor:
                "Admin",

              timestamp:
                updatedAt,
            },
          ];

          const {
            error,
          } =
            await supabase
              .from("complaints")
              .update({
                status,

                timeline:
                  nextTimeline,

                updated_at:
                  updatedAt,
              })
              .eq(
                "id",
                id
              );

          if (error) {
            console.error(
              "Failed to update complaint:",
              error
            );

            throw new Error(
              error.message
            );
          }

          setComplaints(
            (prev) =>
              prev.map(
                (item) =>
                  item.id === id
                    ? {
                        ...item,
                        status,
                        updatedAt,
                        timeline:
                          nextTimeline,
                      }
                    : item
              )
          );

          if (existing) {
            setNotifications(
              (prev) => [
                createNotification(
                  "update",
                  "Status changed",
                  `${existing.title} is now ${status}.`,
                  existing.submittedBy,
                  existing.id
                ),
                ...prev,
              ]
            );
          }
        },

        /* -----------------------------------------------
           ASSIGN COMPLAINT
        ------------------------------------------------ */

        async assignComplaint(
          id,
          assigneeId,
          assigneeName
        ) {
          const existing =
            complaints.find(
              (item) =>
                item.id === id
            );

          const updatedAt =
            new Date().toISOString();

          const {
            error,
          } =
            await supabase
              .from("complaints")
              .update({
                assigned_to:
                  assigneeId,

                assigned_faculty_name:
                  assigneeName ??
                  null,

                assigned_at:
                  updatedAt,

                status:
                  "Assigned",

                updated_at:
                  updatedAt,
              })
              .eq(
                "id",
                id
              );

          if (error) {
            console.error(
              "Failed to assign complaint:",
              error
            );

            throw new Error(
              error.message
            );
          }

          setComplaints(
            (prev) =>
              prev.map(
                (item) =>
                  item.id === id
                    ? {
                        ...item,

                        assignedTo:
                          assigneeId,

                        assignedFacultyName:
                          assigneeName,

                        status:
                          "Assigned",

                        updatedAt,
                      }
                    : item
              )
          );

          if (existing) {
            setNotifications(
              (prev) => [
                createNotification(
                  "assignment",
                  "Complaint assigned",
                  `${existing.title} has been assigned to ${
                    assigneeName ??
                    assigneeId
                  }.`,
                  assigneeId,
                  existing.id
                ),
                ...prev,
              ]
            );
          }
        },

        /* -----------------------------------------------
           ADD COMMENT
        ------------------------------------------------ */

        async addComment(
          id,
          message,
          author,
          role
        ) {
          const existing =
            complaints.find(
              (item) =>
                item.id === id
            );

          const updatedAt =
            new Date().toISOString();

          const nextComments = [
            ...(existing?.comments ??
              []),

            {
              id:
                `c-${Date.now()}`,

              author,

              role,

              message,

              createdAt:
                updatedAt,
            },
          ];

          const {
            error,
          } =
            await supabase
              .from("complaints")
              .update({
                comments:
                  nextComments,

                updated_at:
                  updatedAt,
              })
              .eq(
                "id",
                id
              );

          if (error) {
            console.error(
              "Failed to add comment:",
              error
            );

            throw new Error(
              error.message
            );
          }

          setComplaints(
            (prev) =>
              prev.map(
                (item) =>
                  item.id === id
                    ? {
                        ...item,

                        comments:
                          nextComments,

                        updatedAt,
                      }
                    : item
              )
          );
        },

        /* -----------------------------------------------
           NOTIFICATIONS
        ------------------------------------------------ */

        markNotificationRead(
          id
        ) {
          setNotifications(
            (prev) =>
              prev.map(
                (item) =>
                  item.id === id
                    ? {
                        ...item,
                        read: true,
                      }
                    : item
              )
          );
        },

        markAllRead(
          userId
        ) {
          setNotifications(
            (prev) =>
              prev.map(
                (item) =>
                  item.userId ===
                  userId
                    ? {
                        ...item,
                        read: true,
                      }
                    : item
              )
          );
        },
      }),
      [
        complaints,
        notifications,
        users,
        departments,
        isLoading,
      ]
    );

  return (
    <DataContext.Provider
      value={value}
    >
      {children}
    </DataContext.Provider>
  );
}

/* ---------------------------------------------------------
   USE DATA
--------------------------------------------------------- */

export function useData() {
  const ctx =
    useContext(DataContext);

  if (!ctx) {
    throw new Error(
      "useData must be used within DataProvider"
    );
  }

  return ctx;
}