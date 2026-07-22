import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { BlinkUIProvider, Toaster } from "@blinkdotnew/ui";
import { router } from "./router";
import { useAuth } from "./hooks/useAuth";
import "./index.css";

const queryClient = new QueryClient();

function AppRouterProvider() {
  const auth = useAuth();

  // Re-run route beforeLoad guards when auth settles (magic-link sign-in → /invoices,
  // logout → leave protected shell). Context updates alone are not always enough.
  useEffect(() => {
    if (!auth.isLoading) {
      void router.invalidate();
    }
  }, [auth.isLoading, auth.user?.id]);

  return <RouterProvider router={router} context={{ auth }} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BlinkUIProvider theme="minimal" darkMode="light">
        <Toaster position="top-right" />
        <AppRouterProvider />
      </BlinkUIProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
