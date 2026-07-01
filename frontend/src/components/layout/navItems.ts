import type { ElementType } from "react";
import { Home, BookOpen, Compass, Award, Layers } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: ElementType;
}

export const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Courses", href: "/courses", icon: BookOpen },
  { name: "Explore", href: "/community", icon: Compass },
  { name: "Certificates", href: "/certificates", icon: Award },
  { name: "Roadmaps", href: "/roadmaps", icon: Layers },
];
