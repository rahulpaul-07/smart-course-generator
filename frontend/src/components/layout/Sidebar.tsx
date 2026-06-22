import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Compass, Award, Settings, Layers } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Courses", href: "/courses", icon: BookOpen },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "Certificates", href: "/certificates", icon: Award },
  { name: "Roadmaps", href: "/roadmaps", icon: Layers },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="hidden w-64 flex-col border-r border-border bg-sidebar h-screen md:flex"
    >
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/50">
        <div className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          CourseAI Pro
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground/50 tracking-wider uppercase mb-3 px-2">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active" 
                  className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-full" 
                />
              )}
              <item.icon className={cn("h-4 w-4 shrink-0 transition-colors duration-200", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-border/50">
        <Link
          to="/settings"
          className={cn(
            "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
            location.pathname.startsWith("/settings")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )}
        >
          {location.pathname.startsWith("/settings") && (
            <motion.div 
              layoutId="sidebar-active" 
              className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-full" 
            />
          )}
          <Settings className={cn("h-4 w-4 shrink-0 transition-colors duration-200", location.pathname.startsWith("/settings") ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
          Settings
        </Link>
      </div>
    </motion.aside>
  );
}
