export type Role = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department?: string;
  studentId?: string;
  phone?: string;
  joinedAt: string;
}

export type ComplaintStatus =
  | "Submitted"
  | "Under Review"
  | "Assigned"
  | "In Progress"
  | "Resolved"
  | "Rejected";

export type Priority = "Low" | "Medium" | "High" | "Critical";

export type Category =
  | "Electrical"
  | "Plumbing"
  | "Cleanliness"
  | "Internet & IT"
  | "Furniture"
  | "Safety & Security"
  | "Food Services"
  | "Academics"
  | "Transportation"
  | "Other";

export interface AIAnalysis {
  category: Category;
  priority: Priority;
  confidence: number;
  department: string;
  estimatedResolution: string;
  keywords: string[];
}

export interface ComplaintComment {
  id: string;
  author: string;
  role: Role;
  message: string;
  createdAt: string;
}

export interface ComplaintTimelineEvent {
  id: string;
  status: ComplaintStatus;
  note: string;
  actor: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: Category;
  building: string;
  location: string;
  urgency: Priority;
  anonymous: boolean;
  images: string[];
  status: ComplaintStatus;
  submittedBy: string;
  submittedByName: string;
  assignedTo?: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  ai: AIAnalysis;
  timeline: ComplaintTimelineEvent[];
  comments: ComplaintComment[];
  adminNotes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "update" | "assignment" | "resolution" | "announcement";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  complaintId?: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  workload: number;
  resolved: number;
}
