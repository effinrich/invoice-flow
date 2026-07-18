import { Outlet } from "@tanstack/react-router";
import { AppSidebarShell } from "../components/AppSidebarShell";

/**
 * AppLayout — renders authenticated app pages with the collapsible sidebar.
 * Auth guard is enforced via beforeLoad on the parent route in router.tsx.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background">
      <aside className="shrink-0">
        <AppSidebarShell />
      </aside>
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
