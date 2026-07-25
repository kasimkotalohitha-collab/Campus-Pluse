import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, MessageSquarePlus, Search } from "lucide-react";
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
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";

export const Route = createFileRoute("/app/complaints")({
  component: ComplaintsPage,
});

function ComplaintsPage() {
  const { user } = useAuth();
  const { complaints } = useData();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");

  const scoped = useMemo(
    () =>
      user?.role === "admin"
        ? complaints
        : complaints.filter((c) => c.submittedBy === user?.id),
    [complaints, user],
  );

  const filtered = useMemo(() => {
    return scoped.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (priority !== "all" && c.urgency !== priority) return false;
      if (category !== "all" && c.category !== category) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!c.title.toLowerCase().includes(s) && !c.id.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [scoped, q, status, priority, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {user?.role === "admin" ? "All complaints" : "My complaints"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </p>
        </div>
        <Button asChild className="gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]">
          <Link to="/app/submit">
            <MessageSquarePlus className="mr-1.5 h-4 w-4" />
            New complaint
          </Link>
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {["Submitted", "Under Review", "Assigned", "In Progress", "Resolved", "Rejected"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priority</SelectItem>
              {["Low", "Medium", "High", "Critical"].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {["Electrical","Plumbing","Cleanliness","Internet & IT","Furniture","Safety & Security","Food Services","Academics","Transportation","Other"].map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Building</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id} className="cursor-pointer">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  <Link to="/app/complaints/$id" params={{ id: c.id }}>{c.id}</Link>
                </TableCell>
                <TableCell className="max-w-[300px] truncate font-medium">
                  <Link to="/app/complaints/$id" params={{ id: c.id }} className="hover:text-primary">
                    {c.title}
                  </Link>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                  {c.category}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                  {c.building}
                </TableCell>
                <TableCell><PriorityBadge priority={c.urgency} /></TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                  {new Date(c.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No complaints match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
