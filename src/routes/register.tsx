import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/auth-context";
import { AuthShell } from "./login";
import type { Role } from "@/types";

export const Route = createFileRoute("/register")({
component: RegisterPage,
});

function RegisterPage() {
const { register } = useAuth();
const navigate = useNavigate();

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [role, setRole] = useState<Role>("student");
const [loading, setLoading] = useState(false);

async function onSubmit(event: FormEvent<HTMLFormElement>) {
event.preventDefault();


const trimmedName = name.trim();
const trimmedEmail = email.trim();

if (!trimmedName || !trimmedEmail || !password) {
  toast.error("Please fill in all required fields.");
  return;
}

if (password.length < 6) {
  toast.error("Password must be at least 6 characters.");
  return;
}

setLoading(true);

try {
  const newUser = await register(
    trimmedName,
    trimmedEmail,
    password,
    role,
  );

  toast.success(`Account created for ${newUser.name}!`);

  navigate({
    to: "/app/dashboard",
  });
} catch (error) {
  const message =
    error instanceof Error
      ? error.message
      : "Registration failed. Please try again.";

  toast.error(message);
} finally {
  setLoading(false);
}


}

return ( <AuthShell
   title="Create your account"
   subtitle="Join CampusPulse and start resolving campus issues."
 > <form onSubmit={onSubmit} className="space-y-4"> <div className="space-y-2"> <Label htmlFor="name">Full name</Label>


      <Input
        id="name"
        type="text"
        placeholder="Enter your full name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoComplete="name"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>

      <Input
        id="email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>

      <Input
        id="password"
        type="password"
        placeholder="Create a password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
        minLength={6}
        required
      />

      <p className="text-xs text-muted-foreground">
        Use at least 6 characters.
      </p>
    </div>

    <div className="space-y-2">
      <Label>Sign up as</Label>

      <RadioGroup
        value={role}
        onValueChange={(value) => setRole(value as Role)}
        className="grid grid-cols-2 gap-2"
      >
        {(["student", "faculty", "admin"] as Role[]).map((currentRole) => (
          <label
            key={currentRole}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm capitalize transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
          >
            <RadioGroupItem
              value={currentRole}
              id={`role-${currentRole}`}
            />

            <span>{currentRole}</span>
          </label>
        ))}
      </RadioGroup>
    </div>

    <Button
      type="submit"
      disabled={loading}
      className="w-full gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
    >
      {loading ? "Creating account..." : "Create account"}
    </Button>
  </form>

  <p className="mt-4 text-center text-sm text-muted-foreground">
    Already have an account?{" "}
    <Link
      to="/login"
      className="font-medium text-primary hover:underline"
    >
      Sign in
    </Link>
  </p>
</AuthShell>


);
}
