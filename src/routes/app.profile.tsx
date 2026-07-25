import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [department, setDepartment] = useState(user?.department ?? "");

  function save(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({ name, email, phone, department });
    toast.success("Profile updated");
  }

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account details.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="gradient-primary text-lg font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{user?.name}</h2>
            <p className="text-sm text-muted-foreground capitalize">
              {user?.role} · {user?.department}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept">Department</Label>
            <Input id="dept" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button
              type="submit"
              className="gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
            >
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
