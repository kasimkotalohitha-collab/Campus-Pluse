import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Brain, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [email, setEmail] = useState("student@demo.com");
  const [password, setPassword] = useState("password");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate({ to: "/app/dashboard" });
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to CampusPulse to manage and track your campus complaints."
    >
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
          />
          Remember me on this device
        </label>
        <Button
          type="submit"
          disabled={loading}
          className="w-full gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
      <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Demo accounts</p>
        <p>student@demo.com · admin@demo.com (any password)</p>
      </div>
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
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 [background:radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_50%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            <span className="text-lg font-semibold">CampusPulse</span>
          </Link>
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              AI-powered complaint intelligence for modern campuses.
            </h2>
            <p className="mt-3 max-w-md text-primary-foreground/80">
              Trusted by student communities and admin teams to resolve issues faster,
              smarter, and transparently.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-primary-foreground/90">
              {[
                { icon: Brain, text: "AI categorization & priority detection" },
                { icon: ShieldCheck, text: "Secure role-based authentication" },
                { icon: Bell, text: "Real-time complaint notifications" },
                { icon: GraduationCap, text: "Built for educational institutions" },
              ].map((f) => (
                <li key={f.text} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                    <f.icon className="h-4 w-4" />
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-primary-foreground/70">
            © {new Date().getFullYear()} CampusPulse
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <Card className="w-full max-w-md border-border/60 p-8 shadow-[var(--shadow-elevated)]">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </Card>
      </div>
    </div>
  );
}
