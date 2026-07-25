import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "./login";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    toast.success("Reset link sent (demo).");
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to set a new password."
    >
      {sent ? (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
          If an account exists for <strong>{email}</strong>, a reset link has been sent.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Remembered?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
