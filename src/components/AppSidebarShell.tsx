import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@blinkdotnew/ui";
import { LayoutDashboard, FileText, Settings, LogOut, PanelLeft, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "../layouts/RootLayout";

const SIDEBAR_KEY = "sidebar_collapsed";

interface NavItemDef {
  to: string;
  icon: ReactNode;
  label: string;
}

const NAV_ITEMS: NavItemDef[] = [
  { to: "/invoices", icon: <LayoutDashboard className="h-4 w-4" />, label: "Invoices" },
  { to: "/create", icon: <FileText className="h-4 w-4" />, label: "New Invoice" },
  { to: "/recurring", icon: <RefreshCcw className="h-4 w-4" />, label: "Recurring" },
  { to: "/settings", icon: <Settings className="h-4 w-4" />, label: "Settings" },
];

function NavItem({ item, collapsed }: { item: NavItemDef; collapsed: boolean }) {
  const { pathname } = useLocation();

  const isActive =
    item.to === "/invoices"
      ? pathname === "/invoices" || pathname === "/"
      : pathname === item.to || pathname.startsWith(`${item.to}/`);

  const link = (
    <Link
      to={item.to as never}
      className={cn(
        "flex items-center gap-2.5 rounded-md text-sm transition-colors cursor-pointer",
        collapsed ? "justify-center w-8 h-8 mx-auto" : "px-3 py-2 w-full",
        isActive
          ? "bg-accent text-foreground font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent
        side="right"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

export function AppSidebarShell() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_KEY) === "true";
  });

  const toggle = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  }, []);

  const { user, onLogout } = useAppContext();
  const userEmail = user?.email ?? "";
  const userInitials = userEmail.slice(0, 2).toUpperCase() || "U";

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex flex-col h-screen bg-background border-r border-border overflow-hidden sticky top-0",
          "transition-[width] duration-200 ease-linear shrink-0",
          collapsed ? "w-[3rem]" : "w-[15rem]",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center gap-2 shrink-0 border-b border-border h-[52px] px-3",
            collapsed && "justify-center px-2",
          )}
        >
          {!collapsed && (
            <>
              <div className="flex items-center justify-center h-7 w-7 rounded-md bg-primary text-primary-foreground text-xs font-bold shrink-0">
                I
              </div>
              <span className="flex-1 font-semibold text-sm truncate">InvoiceFlow</span>
            </>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={toggle}
              >
                <PanelLeft
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    collapsed && "rotate-180",
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Nav */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-0.5">
          {!collapsed && (
            <p className="px-3 pt-1 pb-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Main
            </p>
          )}
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </div>

        {/* Footer */}
        <div
          className={cn(
            "shrink-0 border-t border-border",
            collapsed ? "flex flex-col items-center gap-1 p-2" : "p-3 space-y-1",
          )}
        >
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors">
                    <Avatar
                      className="h-6 w-6 shrink-0"
                      placeholder={undefined}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                    >
                      <AvatarFallback
                        className="text-[10px] bg-muted"
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                      >
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                >
                  {userEmail || "Account"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                >
                  Sign out
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <div className="flex items-center gap-2 rounded-md px-1 py-1.5">
              <Avatar
                className="h-8 w-8 shrink-0"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                <AvatarFallback
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                >
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight">{userEmail}</p>
                <p className="truncate text-xs leading-tight text-muted-foreground">Signed in</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-foreground"
                onClick={onLogout}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
