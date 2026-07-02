import type { ElementType } from "react";
import { Home, BookOpen, Compass, Award, Layers, Brain, Bot, BarChart3, Trophy, User, Settings } from "lucide-react";

export type NavGroup = "learn" | "progress" | "community";

export interface NavItem {
  name: string;
  href: string;
  icon: ElementType;
  /** Section this item belongs to in the primary (scrollable) nav list. Omit for account-area items. */
  group?: NavGroup;
}

export const navGroups: { key: NavGroup; label: string }[] = [
  { key: "learn", label: "Learn" },
  { key: "progress", label: "Progress" },
  { key: "community", label: "Community" },
];

export const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home, group: "learn" },
  { name: "My Courses", href: "/courses", icon: BookOpen, group: "learn" },
  { name: "Roadmaps", href: "/roadmaps", icon: Layers, group: "learn" },
  { name: "Interview Prep", href: "/interview-prep", icon: Brain, group: "learn" },
  { name: "AI Insights", href: "/agents", icon: Bot, group: "learn" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, group: "progress" },
  { name: "Certificates", href: "/certificates", icon: Award, group: "progress" },
  { name: "Community", href: "/community", icon: Compass, group: "community" },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy, group: "community" },
];

/** Rendered separately at the bottom of the nav (own profile + settings), not part of the grouped scroll list. */
export const accountNavItems: NavItem[] = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

/**
 * "/profile" (the current user's own profile) needs an exact match so it doesn't
 * light up while viewing someone else's profile at "/profile/:userId" -- every
 * other item keeps the original prefix-match behavior.
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/profile") return pathname === "/profile";
  return pathname.startsWith(href);
}
