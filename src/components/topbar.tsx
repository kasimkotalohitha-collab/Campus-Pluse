import { Link } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";

export function Topbar() {
  const { user } = useAuth();
  const { notifications } = useData();
  const unread = notifications.filter((n) => n.userId === user?.id && !n.read).length;

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger />
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search complaints, users, departments..." className="pl-9" />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Link
          to="/app/notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-primary px-1 text-[10px]">
              {unread}
            </Badge>
          )}
        </Link>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left leading-tight sm:block">
            <div className="text-xs font-medium">{user?.name}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
