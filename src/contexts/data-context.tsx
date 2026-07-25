import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { mockComplaints, mockDepartments, mockNotifications, mockUsers } from "@/lib/mock-data";
import type { Complaint, ComplaintStatus, Notification } from "@/types";

interface DataContextValue {
  complaints: Complaint[];
  notifications: Notification[];
  users: typeof mockUsers;
  departments: typeof mockDepartments;
  addComplaint: (c: Complaint) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus, note?: string) => void;
  assignComplaint: (id: string, assignee: string) => void;
  addComment: (id: string, message: string, author: string, role: "student" | "admin") => void;
  markNotificationRead: (id: string) => void;
  markAllRead: (userId: string) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

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
              : c,
          ),
        );
      },
      assignComplaint(id, assignee) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, assignedTo: assignee, status: "Assigned" } : c)),
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
              : c,
          ),
        );
      },
      markNotificationRead(id) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      },
      markAllRead(userId) {
        setNotifications((prev) =>
          prev.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
        );
      },
    }),
    [complaints, notifications],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
