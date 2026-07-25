import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileText,
  Filter,
  Gauge,
  Github,
  GraduationCap,
  Image as ImageIcon,
  LineChart,
  Lock,
  MessageSquarePlus,
  Quote,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "CampusPulse — AI Complaint Management for Campuses" },
      {
        name: "description",
        content:
          "CampusPulse helps students report campus issues and administrators resolve them faster with AI categorization, priority detection, and analytics.",
      },
      { property: "og:title", content: "CampusPulse — AI Complaint Management for Campuses" },
      {
        property: "og:description",
        content:
          "AI-powered complaint intelligence built for educational institutions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How It Works" },
  { href: "#ai", label: "AI Intelligence" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

function Landing() {
  return (
    <div id="home" className="min-h-screen bg-background scroll-smooth">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">CampusPulse</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="story-link hover:text-foreground">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70 [background:radial-gradient(circle_at_top_right,theme(colors.primary/20),transparent_55%),radial-gradient(circle_at_bottom_left,theme(colors.info/15),transparent_55%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-20 md:pt-28 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered complaint intelligence for campuses
            </div>
            <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-6xl">
              <span className="text-gradient-primary">CampusPulse</span>
            </h1>
            <p className="mt-4 text-xl font-medium text-foreground md:text-2xl">
              AI-Powered Campus Complaint Management for Educational Institutions
            </p>
            <p className="mt-5 text-base text-muted-foreground md:text-lg">
              CampusPulse enables students to report campus issues effortlessly while
              helping administrators categorize, prioritize, assign, and resolve
              complaints using Artificial Intelligence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]">
                <Link to="/login">
                  Login <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#preview">View Demo</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Try it instantly — use{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">student@demo.com</code> or{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">admin@demo.com</code>
            </p>
          </div>

          {/* Hero illustration */}
          <div className="relative animate-scale-in">
            <div className="absolute -inset-6 -z-10 rounded-3xl gradient-primary opacity-20 blur-2xl" />
            <div className="relative rounded-3xl border border-border bg-card/80 p-6 shadow-[var(--shadow-elevated)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="gradient-primary flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground">
                    <Brain className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">Live AI Analysis</span>
                </div>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                  ACTIVE
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Incoming complaint</p>
                <p className="mt-1 text-sm font-medium">
                  "Water leakage in Hostel Block C bathroom on 2nd floor."
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Category", value: "Maintenance", tone: "bg-primary/10 text-primary" },
                  { label: "Priority", value: "High", tone: "bg-destructive/10 text-destructive" },
                  { label: "Department", value: "Facilities", tone: "bg-info/10 text-info" },
                  { label: "ETA", value: "4 hrs", tone: "bg-success/10 text-success" },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{m.label}</p>
                    <p className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${m.tone}`}>
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">AI confidence</span>
                  <span className="font-semibold">94%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div className="h-full w-[94%] gradient-primary" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Powered by Google Gemini
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY / STATS */}
      <section className="border-y border-border bg-muted/30 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Brain, value: "99%", label: "AI Categorization Accuracy", tone: "bg-primary/10 text-primary" },
              { icon: Zap, value: "3×", label: "Faster Complaint Resolution", tone: "bg-warning/20 text-warning-foreground" },
              { icon: Lock, value: "SSO", label: "Secure Student Authentication", tone: "bg-info/10 text-info" },
              { icon: TrendingUp, value: "24/7", label: "Real-Time Complaint Tracking", tone: "bg-success/10 text-success" },
            ].map((s) => (
              <div
                key={s.label}
                className="group rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tone}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything a modern campus needs
            </h2>
            <p className="mt-3 text-muted-foreground">
              A complete toolkit for reporting, analyzing, and resolving campus issues.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Lock, title: "Secure Authentication", text: "Role-based access for students and administrators." },
              { icon: MessageSquarePlus, title: "Complaint Submission", text: "Guided form with instant AI feedback as you type." },
              { icon: Camera, title: "Image Upload", text: "Attach photos for richer context and faster action." },
              { icon: Brain, title: "AI Complaint Categorization", text: "Auto-detect the right category for every issue." },
              { icon: Zap, title: "AI Priority Detection", text: "Urgent issues rise to the top automatically." },
              { icon: TrendingUp, title: "Complaint Tracking", text: "Transparent timeline from submission to resolution." },
              { icon: GraduationCap, title: "Student Dashboard", text: "Track your reports and updates in one place." },
              { icon: UserCog, title: "Administrator Dashboard", text: "Assign, manage, and resolve across departments." },
              { icon: BarChart3, title: "Analytics Dashboard", text: "Trends, workload, and resolution metrics at a glance." },
              { icon: Filter, title: "Search & Filters", text: "Slice complaints by status, department, or priority." },
              { icon: Bell, title: "Notifications", text: "Stay informed on every status change instantly." },
              { icon: FileText, title: "Report Generation", text: "Export CSV and PDF reports in one click." },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)]"
              >
                <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(circle_at_top_left,theme(colors.primary/10),transparent_60%)]" />
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">
              From a student's tap to a resolved issue — every step tracked and intelligent.
            </p>
          </div>

          <ol className="relative mt-14 space-y-4 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-border md:before:left-1/2">
            {[
              { icon: Send, title: "Student submits complaint", text: "A quick guided form captures the issue." },
              { icon: ImageIcon, title: "Image uploaded (optional)", text: "Photos add crucial visual context." },
              { icon: Brain, title: "AI analyzes complaint", text: "Language models parse intent and details." },
              { icon: ClipboardList, title: "AI predicts category", text: "The right department is chosen instantly." },
              { icon: Zap, title: "AI assigns priority", text: "High-urgency issues surface first." },
              { icon: UserCog, title: "Complaint reaches administrator", text: "Routed to the right team automatically." },
              { icon: UserCheck, title: "Administrator reviews & assigns", text: "Ownership is clear from day one." },
              { icon: Wrench, title: "Issue resolved", text: "Actions and outcomes are recorded." },
              { icon: Bell, title: "Student receives updates", text: "Real-time status notifications keep everyone aligned." },
            ].map((step, i) => (
              <li
                key={step.title}
                className={`relative grid gap-3 md:grid-cols-2 md:gap-10 ${i % 2 === 1 ? "md:[&>div:first-child]:col-start-2" : ""}`}
              >
                <div className={`group rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] ${i % 2 === 1 ? "md:text-left" : "md:text-right"}`}>
                  <div className={`flex items-center gap-3 ${i % 2 === 1 ? "md:justify-start" : "md:justify-end"}`}>
                    <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                </div>
                <div className="hidden md:block" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* AI INTELLIGENCE */}
      <section id="ai" className="relative overflow-hidden py-20">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70 [background:radial-gradient(circle_at_50%_0%,theme(colors.primary/15),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by Artificial Intelligence
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Intelligence at every step
            </h2>
            <p className="mt-3 text-muted-foreground">
              CampusPulse uses modern AI to understand, prioritize, and route complaints in real time.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Brain,
                title: "Google Gemini AI",
                items: ["Complaint Categorization", "Complaint Summarization", "Department Recommendation"],
              },
              {
                icon: Gauge,
                title: "AI Priority Engine",
                items: ["High", "Medium", "Low", "Confidence Score"],
              },
              {
                icon: LineChart,
                title: "Smart Analytics",
                items: ["Complaint Trends", "Resolution Insights", "Department Performance"],
              },
            ].map((c) => (
              <div
                key={c.title}
                className="group relative overflow-hidden rounded-2xl border border-white/40 bg-card/60 p-6 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)]"
              >
                <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full gradient-primary opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-40" />
                <div className="gradient-primary flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{c.title}</h3>
                <ul className="mt-3 space-y-1.5">
                  {c.items.map((i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section id="preview" className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">A closer look</h2>
            <p className="mt-3 text-muted-foreground">
              Beautiful, focused dashboards for every role on campus.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {[
              { title: "Student Dashboard", subtitle: "Your reports, at a glance", tone: "from-primary/20 to-info/10" },
              { title: "Admin Dashboard", subtitle: "Assign, resolve, monitor", tone: "from-primary/25 to-primary/5" },
              { title: "Analytics Dashboard", subtitle: "Trends and workload", tone: "from-info/20 to-success/10" },
              { title: "Complaint Tracking", subtitle: "Transparent timelines", tone: "from-warning/20 to-primary/10" },
            ].map((d) => (
              <div
                key={d.title}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
              >
                <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  <span className="ml-3 text-xs text-muted-foreground">campuspulse.app / {d.title.toLowerCase().replace(/ /g, "-")}</span>
                </div>
                <div className={`relative aspect-[16/9] bg-gradient-to-br ${d.tone}`}>
                  <div className="absolute inset-4 grid grid-cols-4 gap-2">
                    <div className="col-span-1 rounded-lg bg-card/80 shadow-sm backdrop-blur" />
                    <div className="col-span-3 grid grid-rows-6 gap-2">
                      <div className="row-span-1 rounded-lg bg-card/80 shadow-sm backdrop-blur" />
                      <div className="row-span-3 grid grid-cols-3 gap-2">
                        <div className="rounded-lg bg-card/80 shadow-sm backdrop-blur" />
                        <div className="rounded-lg bg-card/80 shadow-sm backdrop-blur" />
                        <div className="rounded-lg bg-card/80 shadow-sm backdrop-blur" />
                      </div>
                      <div className="row-span-2 rounded-lg bg-card/80 shadow-sm backdrop-blur" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CAMPUSPULSE */}
      <section id="about" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Why CampusPulse
            </h2>
            <p className="mt-3 text-muted-foreground">
              Purpose-built for the pace, scale, and accountability educational institutions require.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Brain, title: "AI-Powered Decision Making", text: "Every complaint gets an intelligent recommendation." },
              { icon: Zap, title: "Faster Complaint Resolution", text: "Cut resolution time with smart routing and priority." },
              { icon: ShieldCheck, title: "Transparent Tracking", text: "A clear audit trail from submission to closure." },
              { icon: GraduationCap, title: "Better Student Experience", text: "Give students a voice and real-time visibility." },
              { icon: Users, title: "Reduced Administrative Work", text: "Automation handles the busywork for your staff." },
              { icon: LineChart, title: "Smart Analytics", text: "Understand patterns and improve campus operations." },
            ].map((t) => (
              <div
                key={t.title}
                className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <t.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Loved by students and administrators
            </h2>
            <p className="mt-3 text-muted-foreground">
              Feedback from campuses using CampusPulse to modernize complaint management.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Ananya Sharma",
                role: "3rd year, Computer Science",
                text: "CampusPulse made reporting campus issues incredibly easy, and I could track every update in real time.",
              },
              {
                name: "Dr. Rajiv Menon",
                role: "Dean of Student Affairs",
                text: "Our resolution times dropped significantly. The AI routing means the right team hears about issues first.",
              },
              {
                name: "Priya Iyer",
                role: "Hostel Warden",
                text: "The priority engine is a game-changer. Urgent maintenance requests never slip through the cracks.",
              },
            ].map((t) => (
              <figure
                key={t.name}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
              >
                <Quote className="absolute -right-2 -top-2 h-16 w-16 text-primary/10" />
                <blockquote className="text-sm text-foreground/90">"{t.text}"</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70 [background:radial-gradient(circle_at_50%_50%,theme(colors.primary/20),transparent_60%)]" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            Transform Campus Complaint Management with <span className="text-gradient-primary">AI</span>
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Give your campus the tools it needs to listen, respond, and improve — every day.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]">
              <Link to="/login">
                Login <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#preview">View Demo</a>
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground shadow-[var(--shadow-glow)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">CampusPulse</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              AI-powered complaint intelligence for educational institutions.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">Version 1.0</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#how" className="hover:text-foreground">How It Works</a></li>
              <li><a href="#ai" className="hover:text-foreground">AI Intelligence</a></li>
              <li><a href="#preview" className="hover:text-foreground">Dashboards</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#about" className="hover:text-foreground">About</a></li>
              <li><a href="#contact" className="hover:text-foreground">Contact</a></li>
              <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Community</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="inline-flex items-center gap-2 hover:text-foreground">
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-foreground">Login</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-border px-6 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CampusPulse. Built for smarter campuses.
        </div>
      </footer>
    </div>
  );
}
