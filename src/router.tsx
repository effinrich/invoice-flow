import {
  createRouter,
  createRoute,
  createRootRouteWithContext,
  createHashHistory,
  redirect,
  notFound,
} from "@tanstack/react-router";
import { lazy } from "react";
import { RootLayout } from "./layouts/RootLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { AppLayout } from "./layouts/AppLayout";
import LandingPage from "./pages/LandingPage";
import InvoiceCreator from "./pages/InvoiceCreator";
import RecurringInvoices from "./pages/RecurringInvoices";
import InvoiceDashboard from "./pages/InvoiceDashboard";
import Settings from "./pages/Settings";
import { PublicNotFound, ProtectedNotFound, InvoiceNotFound } from "./pages/RouteNotFound";
import { fetchPublicInvoice } from "./hooks/useGeneratedInvoices";
import type { AuthState } from "./hooks/useAuth";

const ClientPortal = lazy(() => import("./pages/ClientPortal"));

type RouterContext = {
  auth: AuthState;
};

// Root: provides AppContext (upgrade modal, user/plan) — wraps all routes
const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: PublicNotFound,
});

// Public routes — no sidebar, no auth required
const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public",
  component: PublicLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/",
  component: LandingPage,
});

const portalRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/portal/$invoiceId",
  component: ClientPortal,
  loader: async ({ params }) => {
    const invoice = await fetchPublicInvoice(params.invoiceId);
    if (!invoice) throw notFound();
    return { invoice };
  },
  notFoundComponent: InvoiceNotFound,
});

// App routes — sidebar chrome, auth required
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: AppLayout,
  notFoundComponent: ProtectedNotFound,
  beforeLoad: ({ context }) => {
    if (context.auth.isLoading) return;
    if (!context.auth.user) {
      throw redirect({ to: "/", search: { upgrade: "1" } });
    }
  },
});

const invoicesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/invoices",
  component: InvoiceDashboard,
});

const createRoute_ = createRoute({
  getParentRoute: () => appRoute,
  path: "/create",
  component: InvoiceCreator,
});

const recurringRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/recurring",
  component: RecurringInvoices,
});

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/settings",
  component: Settings,
});

// Catch-all
const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: PublicNotFound,
});

const routeTree = rootRoute.addChildren([
  publicRoute.addChildren([indexRoute, portalRoute]),
  appRoute.addChildren([invoicesRoute, createRoute_, recurringRoute, settingsRoute]),
  catchAllRoute,
]);

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
  defaultPreload: "intent",
  // Placeholder until RouterProvider injects live auth from useAuth()
  context: {
    auth: {
      user: null,
      isLoading: true,
      isAuthenticated: false,
    },
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
