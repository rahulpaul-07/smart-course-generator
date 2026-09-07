import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, BrainCircuit } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import { navGroups, navItems, accountNavItems, isNavItemActive } from "./navItems";

/**
 * The grouped nav is taller than a short laptop viewport once every group is
 * rendered, and the account block below it is pinned. Without an affordance the
 * scroll cuts off mid-group and the last group header ("Community") reads as an
 * empty heading. Spacing is tight enough that the full list fits most laptop
 * heights, and when it genuinely doesn't, `hasMoreBelow` fades the bottom edge
 * so there's a visible signal that the list continues.
 */
function useScrollAffordance<T extends HTMLElement>(resetKey?: unknown) {
  const ref = useRef<T | null>(null);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setHasMoreBelow(el.scrollHeight - el.scrollTop - el.clientHeight > 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer?.disconnect();
    };
  }, [measure, resetKey]);

  return { ref, hasMoreBelow };
}

export function Sidebar() {
  const location = useLocation();
  const { isSidebarCollapsed, toggleSidebar } = useLayout();
  const { ref: navRef, hasMoreBelow } = useScrollAffordance<HTMLDivElement>(isSidebarCollapsed);

  return (
    <motion.aside
      id="global-sidebar"
      initial={false}
      animate={{
        width: isSidebarCollapsed ? 80 : 256,
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="hidden flex-col border-r border-border bg-card/80 backdrop-blur-xl h-screen md:flex relative shrink-0 z-50"
    >
      <div className={cn("flex h-16 shrink-0 items-center border-b border-border transition-all duration-300", isSidebarCollapsed ? "px-0 justify-center" : "px-6")}>
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-foreground tracking-tight overflow-hidden whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20 shrink-0">
            <BrainCircuit className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isSidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              CourseAI
            </motion.span>
          )}
        </Link>
      </div>

      <div className="relative flex-1 min-h-0">
        <div ref={navRef} className="h-full overflow-y-auto py-4 flex flex-col gap-4">
          {navGroups.map((group) => {
            const groupItems = navItems.filter((item) => item.group === group.key);
            if (groupItems.length === 0) return null;
            return (
              <div key={group.key} className="px-3 space-y-1 shrink-0">
                {!isSidebarCollapsed && (
                  <div className="eyebrow px-3 mb-1.5">
                    {group.label}
                  </div>
                )}
                {groupItems.map((item) => {
                  const isActive = isNavItemActive(location.pathname, item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "group relative flex items-center rounded-xl py-2 text-sm font-medium transition-all duration-200 overflow-hidden focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-primary",
                        isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      title={isSidebarCollapsed ? item.name : undefined}
                      aria-label={isSidebarCollapsed ? item.name : undefined}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-main"
                          className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-full"
                        />
                      )}
                      <item.icon className={cn("h-5 w-5 shrink-0 transition-all duration-200", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} aria-hidden="true" />
                      {!isSidebarCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {hasMoreBelow && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card/95 to-transparent"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="shrink-0 p-3 border-t border-border/30 space-y-1">
        {!isSidebarCollapsed && (
          <div className="eyebrow px-3 mb-1.5">
            Account
          </div>
        )}
        {accountNavItems.map((item) => {
          const isActive = isNavItemActive(location.pathname, item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group relative flex items-center rounded-xl py-2 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-primary",
                isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={isSidebarCollapsed ? item.name : undefined}
              aria-label={isSidebarCollapsed ? item.name : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-account"
                  className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-full"
                />
              )}
              <item.icon className={cn("h-5 w-5 shrink-0 transition-all duration-200", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} aria-hidden="true" />
              {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}

        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full group relative flex items-center rounded-xl py-2 text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground",
            isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3"
          )}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-5 w-5 shrink-0 transition-transform" />
          ) : (
            <ChevronLeft className="h-5 w-5 shrink-0 transition-transform" />
          )}
          {!isSidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
