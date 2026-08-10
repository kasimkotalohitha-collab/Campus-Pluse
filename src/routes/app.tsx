
import {
  Outlet,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  const navigate = useNavigate();

  /*
   * IMPORTANT:
   *
   * During a page refresh, Supabase needs a moment
   * to restore the existing session.
   *
   * Do NOT redirect to /login while auth is loading.
   */
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate({
        to: "/login",
        replace: true,
      });
    }
  }, [
    isAuthenticated,
    isLoading,
    navigate,
  ]);

  /*
   * Wait for Supabase to restore the session.
   *
   * Without this, isAuthenticated is temporarily
   * false during refresh and the user gets kicked
   * to the login page.
   */
  if (isLoading) {
    return null;
  }

  /*
   * Auth finished loading and there is no user.
   */
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AppSidebar />

        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

