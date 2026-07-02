import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, BrainCircuit } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import { navGroups, navItems, accountNavItems, isNavItemActive } from "./navItems";

export function Sidebar() {
  const location = useLocation();
  const { isSidebarCollapsed, toggleSidebar } = useLayout();

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
              CourseAI Pro
            </motion.span>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col space-y-5">
        {navGroups.map((group) => {
          const groupItems = navItems.filter((item) => item.group === group.key);
          if (groupItems.length === 0) return null;
          return (
            <div key={group.key} className="px-3 space-y-1">
              {!isSidebarCollapsed && (
                <div className="eyebrow px-3 mb-2">
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
                      "group relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-primary",
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
                        layoutId="sidebar-active"
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

      <div className="p-3 border-t border-border/30 space-y-1">
        {!isSidebarCollapsed && (
          <div className="eyebrow px-3 mb-2">
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
                "group relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-primary",
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
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-full"
                />
              )}
              <item.icon className={cn("h-5 w-5 shrink-0 transition-all duration-200", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} aria-hidden="true" />
              {!isSidebarCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full group relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground",
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
