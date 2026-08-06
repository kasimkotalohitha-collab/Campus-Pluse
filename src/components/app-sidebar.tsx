import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquarePlus,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const studentNav = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Submit Complaint", url: "/app/submit", icon: MessageSquarePlus },
  { title: "My Complaints", url: "/app/complaints", icon: FileText },
  { title: "Notifications", url: "/app/notifications", icon: Bell },
  { title: "Profile", url: "/app/profile", icon: Settings },
];

const facultyNav = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Assigned Complaints", url: "/app/complaints", icon: FileText },
  { title: "Profile", url: "/app/profile", icon: Settings },
];

const adminNav = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Complaints", url: "/app/complaints", icon: FileText },
  { title: "Analytics", url: "/app/analytics", icon: BarChart3 },
  { title: "Faculty", url: "/app/users", icon: Users },
  { title: "Reports", url: "/app/reports", icon: ShieldCheck },
  { title: "Notifications", url: "/app/notifications", icon: Bell },
  { title: "Profile", url: "/app/profile", icon: Settings },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items =
    user?.role === "admin"
      ? adminNav
      : user?.role === "faculty"
      ? facultyNav
      : studentNav;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/app/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground shadow-[var(--shadow-glow)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">CampusPulse</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {user?.role === "admin"
                ? "Admin"
                : user?.role === "faculty"
                ? "Faculty"
                : "Student"}
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center gap-2",
                          active && "font-medium",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Sign out">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
