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

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate({
        to: "/login",
        replace: true,
      });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}