import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import { mockDepartments, mockUsers } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import type { Complaint, ComplaintStatus, Notification } from "@/types";

interface DataContextValue {
  complaints: Complaint[];
  notifications: Notification[];
  users: typeof mockUsers;
  departments: typeof mockDepartments;

  addComplaint: (c: Complaint) => void;
  updateComplaintStatus: (
    id: string,
    status: ComplaintStatus,
    note?: string
  ) => void;
  assignComplaint: (id: string, assignee: string) => void;
  addComment: (
    id: string,
    message: string,
    author: string,
    role: "student" | "admin" | "faculty"
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: (userId: string) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch complaints from Supabase
  useEffect(() => {
    async function fetchComplaints() {
      const { data, error } = await supabase
        .from("complaints")
        .select("*");

      if (error) {
        console.error("Error fetching complaints:", error);
        return;
      }

      setComplaints(data as Complaint[]);
    }

    fetchComplaints();
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      complaints,
      notifications,

      users: mockUsers,
      departments: mockDepartments,

      addComplaint(c) {
        setComplaints((prev) => [c, ...prev]);

        setNotifications((prev) => [
          {
            id: `n-${Date.now()}`,
            userId: c.submittedBy,
            type: "update",
            title: "Complaint submitted",
            body: `${c.title} has been received.`,
            createdAt: new Date().toISOString(),
            read: false,
            complaintId: c.id,
          },
          ...prev,
        ]);
      },

      updateComplaintStatus(id, status, note) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status,
                  updatedAt: new Date().toISOString(),
                  timeline: [
                    ...c.timeline,
                    {
                      id: `t-${Date.now()}`,
                      status,
                      note: note ?? `Status updated to ${status}`,
                      actor: "Admin",
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : c
          )
        );
      },

      assignComplaint(id, assignee) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  assignedTo: assignee,
                  status: "Assigned",
                }
              : c
          )
        );
      },

      addComment(id, message, author, role) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  comments: [
                    ...c.comments,
                    {
                      id: `c-${Date.now()}`,
                      author,
                      role,
                      message,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : c
          )
        );
      },

      markNotificationRead(id) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
        );
      },

      markAllRead(userId) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.userId === userId
              ? { ...n, read: true }
              : n
          )
        );
      },
    }),
    [complaints, notifications]
  );

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);

  if (!ctx) {
    throw new Error("useData must be used within DataProvider");
  }

  return ctx;
}