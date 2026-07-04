import React, { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Menu, Search, User, X, Settings, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { navGroups, navItems, accountNavItems, isNavItemActive } from "./navItems";
import { cn } from "@/lib/utils";
import { useLayout } from "@/contexts/LayoutContext";

export function TopNavigation() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleSidebar } = useLayout();
  const isDashboard = location.pathname === '/dashboard';
  const searchQuery = searchParams.get('search') || '';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ search: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div id="top-navigation" className="shrink-0">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 md:px-6 gap-4">
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle mobile menu</span>
          </Button>

          {/* Desktop Toggle Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex text-muted-foreground hover:text-foreground"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          {/* Search Bar */}
          {isDashboard ? (
            <div className="flex-1 max-w-md hidden sm:flex items-center relative">
              <Input 
                type="search" 
                placeholder="Search your courses..." 
                value={searchQuery}
                onChange={handleSearchChange}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full bg-muted/30 border-transparent focus-visible:bg-background focus-visible:border-primary"
              />
            </div>
          ) : (
            <div className="flex-1 max-w-md hidden sm:flex" />
          )}

          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium leading-none">{user?.name || "Guest"}</span>
                <span className="text-xs text-muted-foreground mt-1">Pro Member</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full border border-border bg-card" aria-label="User Profile Menu">
                    <User className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none min-w-0 flex-1">
                      {user?.name && <p className="font-medium truncate">{user.name}</p>}
                      {user?.email && (
                        <p className="w-full truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/settings" className="w-full flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <div className="h-px bg-border my-1" />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => logout && logout()}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm border-r border-border bg-sidebar p-6 shadow-lg md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 font-bold text-lg text-foreground tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20 shrink-0">
                    <BrainCircuit className="h-5 w-5 text-primary-foreground" />
                  </div>
                  CourseAI Pro
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto space-y-5">
                {navGroups.map((group) => {
                  const groupItems = navItems.filter((item) => item.group === group.key);
                  if (groupItems.length === 0) return null;
                  return (
                    <div key={group.key} className="space-y-2">
                      <div className="eyebrow px-2">
                        {group.label}
                      </div>
                      {groupItems.map((item) => {
                        const isActive = isNavItemActive(location.pathname, item.href);
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                            )}
                          >
                            <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto pt-6 border-t border-border/30 space-y-2">
                <div className="eyebrow px-2">
                  Account
                </div>
                {accountNavItems.map((item) => {
                  const isActive = isNavItemActive(location.pathname, item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
