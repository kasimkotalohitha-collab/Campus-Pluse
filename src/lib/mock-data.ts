import type {
  Category,
  Complaint,
  ComplaintStatus,
  Department,
  Notification,
  Priority,
  User,
} from "@/types";

const buildings = [
  "Main Academic Block",
  "Library",
  "Hostel A",
  "Hostel B",
  "Hostel C",
  "Cafeteria",
  "Science Complex",
  "Sports Complex",
  "Auditorium",
  "Admin Block",
];

const categories: Category[] = [
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
];

const statuses: ComplaintStatus[] = [
  "Submitted",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected",
];

const priorities: Priority[] = ["Low", "Medium", "High", "Critical"];

const departmentNames = [
  "Facilities Maintenance",
  "IT Services",
  "Housekeeping",
  "Security",
  "Food & Beverage",
  "Academic Office",
  "Transport",
  "Electrical",
  "Plumbing",
  "General Admin",
];

const categoryToDept: Record<Category, string> = {
  Electrical: "Electrical",
  Plumbing: "Plumbing",
  Cleanliness: "Housekeeping",
  "Internet & IT": "IT Services",
  Furniture: "Facilities Maintenance",
  "Safety & Security": "Security",
  "Food Services": "Food & Beverage",
  Academics: "Academic Office",
  Transportation: "Transport",
  Other: "General Admin",
};

const sampleTitles: Record<Category, string[]> = {
  Electrical: ["Flickering lights in lab", "Power outage in Room 204", "Broken socket near stairs"],
  Plumbing: ["Leaking tap in washroom", "Blocked drain in hostel", "Low water pressure"],
  Cleanliness: ["Dirty washroom on 2nd floor", "Overflowing dustbins", "Unclean cafeteria tables"],
  "Internet & IT": ["Wi-Fi not working", "Projector offline", "Slow lab computers"],
  Furniture: ["Broken chair in classroom", "Damaged desk", "Wobbly benches in library"],
  "Safety & Security": ["Broken door lock", "CCTV camera not working", "Suspicious activity at gate"],
  "Food Services": ["Stale food served", "Long queues at counter", "Poor food hygiene"],
  Academics: ["Missing lecture notes", "Timetable clash", "Attendance not updated"],
  Transportation: ["Bus delay on route 4", "Overcrowded shuttle", "Broken seats in bus"],
  Other: ["Lost & found query", "General suggestion", "Miscellaneous request"],
};

const descriptions = [
  "This issue has been persisting for the past few days and is causing significant inconvenience to students. Kindly look into it at the earliest.",
  "Multiple students have raised concerns about this. It is affecting daily activities and needs immediate attention.",
  "Requesting the concerned department to please resolve this on priority. Photos attached for reference.",
  "This has been an ongoing problem. Please assign the right team to fix it as soon as possible.",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const mockUsers: User[] = [
  {
    id: "u-student",
    name: "Aarav Sharma",
    email: "student@demo.com",
    role: "student",
    studentId: "CS2023045",
    department: "Computer Science",
    phone: "+91 98765 43210",
    joinedAt: daysAgo(400),
  },
  {
    id: "u-admin",
    name: "Priya Menon",
    email: "admin@demo.com",
    role: "admin",
    department: "Campus Operations",
    phone: "+91 98765 11111",
    joinedAt: daysAgo(900),
  },
  {
    id: "u-faculty-1",
    name: "Dr. Rekha Nair",
    email: "faculty1@campus.edu",
    role: "faculty",
    department: "IT Services",
    phone: "+91 98765 22222",
    joinedAt: daysAgo(650),
  },
  {
    id: "u-faculty-2",
    name: "Prof. Amit Bose",
    email: "faculty2@campus.edu",
    role: "faculty",
    department: "Facilities Maintenance",
    phone: "+91 98765 33333",
    joinedAt: daysAgo(620),
  },
  ...Array.from({ length: 13 }).map((_, i) => ({
    id: `u-${i + 3}`,
    name: pick(
      [
        "Rahul Verma",
        "Sneha Patil",
        "Kabir Khan",
        "Ananya Rao",
        "Ishan Gupta",
        "Neha Singh",
        "Devansh Iyer",
        "Ritika Joshi",
        "Arjun Nair",
        "Meera Das",
        "Vivaan Shah",
        "Diya Kapoor",
        "Yash Malhotra",
      ],
      i,
    ),
    email: `user${i + 3}@campus.edu`,
    role: (i % 6 === 0 ? "admin" : "student") as "student" | "admin",
    studentId: i % 6 === 0 ? undefined : `CS20230${i + 10}`,
    department: pick(["Computer Science", "Mechanical", "Electronics", "Civil", "MBA"], i),
    phone: `+91 90000 000${i + 10}`,
    joinedAt: daysAgo(100 + i * 15),
  })),
];

export const mockDepartments: Department[] = departmentNames.map((name, i) => ({
  id: `dept-${i}`,
  name,
  head: pick(["Dr. Rao", "Mr. Khanna", "Ms. Iyer", "Mr. Bose", "Dr. Nair"], i),
  workload: 5 + ((i * 7) % 30),
  resolved: 20 + ((i * 11) % 60),
}));

function generateComplaint(i: number): Complaint {
  const category = pick(categories, i);
  const priority = pick(priorities, i + 1);
  const status = pick(statuses, i * 3 + 1);
  const building = pick(buildings, i * 2);
  const owner = i % 4 === 0 ? mockUsers[0] : mockUsers[(i % (mockUsers.length - 2)) + 2];
  const created = daysAgo(i * 2 + 1);
  const updated = daysAgo(Math.max(0, i - 1));
  const dept = categoryToDept[category];
  const title = pick(sampleTitles[category], i);

  return {
    id: `CMP-${String(1000 + i)}`,
    title,
    description: pick(descriptions, i),
    category,
    building,
    location: `Room ${100 + (i % 40)}`,
    urgency: priority,
    anonymous: i % 9 === 0,
    images: [],
    status,
    submittedBy: owner.id,
    submittedByName: i % 9 === 0 ? "Anonymous" : owner.name,
    assignedTo: status !== "Submitted" ? mockDepartments[i % mockDepartments.length].head : undefined,
    department: dept,
    createdAt: created,
    updatedAt: updated,
    ai: {
      category,
      priority,
      confidence: 0.72 + ((i * 7) % 25) / 100,
      department: dept,
      estimatedResolution: pick(["4 hours", "1 day", "2 days", "3 days", "1 week"], i),
      keywords: pick(
        [
          ["urgent", "safety"],
          ["repair", "maintenance"],
          ["hygiene", "cleanliness"],
          ["network", "connectivity"],
          ["broken", "damaged"],
        ],
        i,
      ),
    },
    timeline: buildTimeline(status, created),
    comments:
      i % 3 === 0
        ? [
            {
              id: `c-${i}-1`,
              author: "Priya Menon",
              role: "admin",
              message: "We're looking into this. Thanks for reporting.",
              createdAt: updated,
            },
          ]
        : [],
    adminNotes: i % 5 === 0 ? "Escalated to department head for review." : undefined,
  };
}

function buildTimeline(status: ComplaintStatus, created: string) {
  const flow: ComplaintStatus[] = [
    "Submitted",
    "Under Review",
    "Assigned",
    "In Progress",
    "Resolved",
  ];
  const idx = status === "Rejected" ? 1 : flow.indexOf(status);
  const steps = status === "Rejected" ? ["Submitted", "Rejected"] : flow.slice(0, idx + 1);
  const start = new Date(created).getTime();
  return steps.map((s, i) => ({
    id: `t-${i}`,
    status: s as ComplaintStatus,
    note:
      s === "Submitted"
        ? "Complaint received."
        : s === "Under Review"
          ? "Reviewed by admin team."
          : s === "Assigned"
            ? "Assigned to concerned department."
            : s === "In Progress"
              ? "Work in progress."
              : s === "Resolved"
                ? "Issue resolved successfully."
                : "Complaint rejected with reason.",
    actor: i === 0 ? "System" : "Priya Menon",
    timestamp: new Date(start + i * 1000 * 60 * 60 * 6).toISOString(),
  }));
}

export const mockComplaints: Complaint[] = Array.from({ length: 50 }).map((_, i) =>
  generateComplaint(i),
);

export const mockNotifications: Notification[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `n-${i}`,
  userId: i % 3 === 0 ? "u-admin" : "u-student",
  type: pick(["update", "assignment", "resolution", "announcement"], i) as Notification["type"],
  title: pick(
    [
      "Your complaint was updated",
      "New complaint assigned",
      "Complaint resolved",
      "Campus announcement",
      "Status changed to In Progress",
    ],
    i,
  ),
  body: "Tap to view details and latest activity on this item.",
  createdAt: daysAgo(i),
  read: i > 4,
  complaintId: mockComplaints[i % mockComplaints.length].id,
}));
