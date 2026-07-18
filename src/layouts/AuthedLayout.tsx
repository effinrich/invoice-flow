import { useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import { blink } from "../blink/client";
import { useAppContext } from "./RootLayout";

export function AuthedLayout() {
  const { user, subLoading } = useAppContext();

  useEffect(() => {
    if (!subLoading && !user) {
      blink.auth.login(window.location.href);
    }
  }, [user, subLoading]);

  if (subLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  return <Outlet />;
}
