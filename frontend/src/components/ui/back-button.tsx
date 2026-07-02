import * as React from "react";
import { Link, type To } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface BackButtonProps {
  /** Route to navigate to. Mutually exclusive with onClick -- provide one or the other. */
  to?: To;
  onClick?: () => void;
  label?: string;
  /** Renders just the arrow icon with an accessible name, no visible text -- for tight spaces (e.g. a mobile toolbar). */
  iconOnly?: boolean;
  className?: string;
}

/**
 * Shared "go back" affordance: ArrowLeft icon + label, ghost-button styling,
 * visible at every breakpoint. Use `to` for a route target or `onClick` for
 * in-page navigation (e.g. switching a local view state).
 */
export function BackButton({ to, onClick, label = "Back", iconOnly = false, className }: BackButtonProps) {
  const content = (
    <>
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
      {!iconOnly && <span>{label}</span>}
    </>
  );

  const sharedClassName = cn(
    "gap-2 text-muted-foreground hover:text-foreground",
    className
  );

  if (to !== undefined) {
    return (
      <Button asChild variant="ghost" size={iconOnly ? "icon" : "sm"} className={sharedClassName}>
        <Link to={to} aria-label={iconOnly ? label : undefined}>
          {content}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={iconOnly ? "icon" : "sm"}
      onClick={onClick}
      className={sharedClassName}
      aria-label={iconOnly ? label : undefined}
    >
      {content}
    </Button>
  );
}
