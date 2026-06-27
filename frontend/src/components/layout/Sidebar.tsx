import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Compass, Award, Settings, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Courses", href: "/courses", icon: BookOpen },
  { name: "Explore", href: "/community", icon: Compass },
  { name: "Certificates", href: "/certificates", icon: Award },
  { name: "Roadmaps", href: "/roadmaps", icon: Layers },
];

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
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden flex-col border-r border-border bg-card/80 backdrop-blur-xl h-screen md:flex relative shrink-0 z-50"
    >
      <div className={cn("flex h-16 shrink-0 items-center border-b border-border transition-all duration-300", isSidebarCollapsed ? "px-0 justify-center" : "px-6")}>
        <div className="flex items-center gap-2 font-bold text-lg text-foreground tracking-tight overflow-hidden whitespace-nowrap">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-primary" />
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
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 flex flex-col space-y-1">
        {!isSidebarCollapsed && (
          <div className="text-xs font-semibold text-muted-foreground/50 tracking-wider uppercase mb-3 px-6">
            Menu
          </div>
        )}
        
        <div className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
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
                <item.icon className={cn("h-5 w-5 shrink-0 transition-all duration-200", isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110")} aria-hidden="true" />
                {!isSidebarCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="p-3 border-t border-border/50 space-y-2">
        <Link
          to="/settings"
          className={cn(
            "group relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-primary",
            isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3",
            location.pathname.startsWith("/settings")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          title={isSidebarCollapsed ? "Settings" : undefined}
          aria-label={isSidebarCollapsed ? "Settings" : undefined}
        >
          {location.pathname.startsWith("/settings") && (
            <motion.div 
              layoutId="sidebar-active" 
              className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-full" 
            />
          )}
          <Settings className={cn("h-5 w-5 shrink-0 transition-all duration-200", location.pathname.startsWith("/settings") ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110")} aria-hidden="true" />
          {!isSidebarCollapsed && <span>Settings</span>}
        </Link>
        
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full group relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground",
            isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3"
          )}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
          ) : (
            <ChevronLeft className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
          )}
          {!isSidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
