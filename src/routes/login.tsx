import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
Bell,
Brain,
GraduationCap,
ShieldCheck,
Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/login")({
component: LoginPage,
head: () => ({
meta: [
{ title: "Sign in — CampusPulse" },
{
name: "description",
content:
"Sign in to CampusPulse to submit, track, and resolve campus complaints powered by AI.",
},
{ property: "og:title", content: "Sign in — CampusPulse" },
{
property: "og:description",
content: "Access your CampusPulse student or administrator dashboard.",
},
{ property: "og:type", content: "website" },
{ name: "twitter:card", content: "summary" },
],
}),
});

function LoginPage() {
const { login } = useAuth();
const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [remember, setRemember] = useState(true);
const [loading, setLoading] = useState(false);

async function onSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!email.trim() || !password) {
    toast.error("Please enter your email and password.");
    return;
  }

  setLoading(true);

  try {
    const loggedInUser = await login(email.trim(), password);

    toast.success(`Welcome back, ${loggedInUser.name}!`);

    const destination =
      loggedInUser.role === "admin"
        ? "/app/dashboard"
        : loggedInUser.role === "faculty"
          ? "/app/dashboard"
          : "/app/dashboard";

    navigate({ to: destination });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to sign in. Please check your email and password.";

    toast.error(message);
  } finally {
    setLoading(false);
  }
}

return ( <AuthShell
   title="Welcome back"
   subtitle="Sign in to continue to your CampusPulse account."
 > <Card className="border-border/60 bg-background/95 p-6 shadow-xl backdrop-blur sm:p-8"> <form onSubmit={onSubmit} className="space-y-5"> <div className="space-y-2"> <Label htmlFor="email">Email</Label>


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
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="password">Password</Label>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="remember"
          checked={remember}
          onCheckedChange={(value) => setRemember(value === true)}
        />

        <Label
          htmlFor="remember"
          className="cursor-pointer text-sm font-normal"
        >
          Remember me on this device
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          to="/register"
          className="font-medium text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  </Card>
</AuthShell>


);
}

export function AuthShell({
title,
subtitle,
children,
}: {
title: string;
subtitle: string;
children: React.ReactNode;
}) {
const features = [
{
icon: Brain,
text: "AI categorization and priority detection",
},
{
icon: ShieldCheck,
text: "Secure role-based authentication",
},
{
icon: Bell,
text: "Real-time complaint notifications",
},
{
icon: GraduationCap,
text: "Built for educational institutions",
},
];

return ( <main className="min-h-screen bg-muted/30"> <div className="grid min-h-screen lg:grid-cols-2"> <section className="relative hidden overflow-hidden bg-primary px-10 py-12 text-primary-foreground lg:flex lg:flex-col"> <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/70" />


      <div className="relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-3 text-xl font-bold"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/15">
            <Sparkles className="h-5 w-5" />
          </span>

          CampusPulse
        </Link>
      </div>

      <div className="relative z-10 my-auto max-w-xl">
        <h1 className="text-4xl font-bold leading-tight">
          AI-powered complaint intelligence for modern campuses.
        </h1>

        <p className="mt-5 text-lg leading-8 text-primary-foreground/80">
          Report issues, track progress, and help create a better campus
          experience.
        </p>

        <div className="mt-10 space-y-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.text}
                className="flex items-center gap-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/15">
                  <Icon className="h-5 w-5" />
                </span>

                <span className="text-sm font-medium">
                  {feature.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="relative z-10 text-sm text-primary-foreground/60">
        © {new Date().getFullYear()} CampusPulse
      </p>
    </section>

    <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-10 flex items-center justify-center gap-3 text-xl font-bold lg:hidden"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>

          CampusPulse
        </Link>

        <div className="mb-7">
          <h2 className="text-3xl font-bold tracking-tight">
            {title}
          </h2>

          <p className="mt-2 text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {children}
      </div>
    </section>
  </div>
</main>


);
}
