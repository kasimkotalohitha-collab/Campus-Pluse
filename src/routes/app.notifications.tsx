import { Link, createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck, Megaphone, MessageCircle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
});

const typeIcon = {
  update: MessageCircle,
  assignment: UserCheck,
  resolution: CheckCheck,
  announcement: Megaphone,
} as const;

function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllRead } = useData();

  const mine = notifications.filter((n) => n.userId === user?.id || user?.role === "admin");
  const unread = mine.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unread} unread · {mine.length} total
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => user && markAllRead(user.id)}
          disabled={unread === 0}
        >
          <CheckCheck className="mr-1.5 h-4 w-4" />
          Mark all read
        </Button>
      </div>

      <Card className="divide-y divide-border p-0">
        {mine.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          mine.map((n) => {
            const Icon = typeIcon[n.type];
            return (
              <button
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={cn(
                  "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/40",
                  !n.read && "bg-primary/5",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    !n.read ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                    {n.complaintId && (
                      <Link
                        to="/app/complaints/$id"
                        params={{ id: n.complaintId }}
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View complaint →
                      </Link>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </Card>
    </div>
  );
}
