import { Outlet } from "@tanstack/react-router";

/**
 * PublicLayout — renders public pages (landing, portal).
 * No sidebar. The landing page provides its own top nav.
 */
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}
