import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * The single page-width primitive for the app.
 *
 * Every routed page renders inside one of these so the content column and the
 * left gutter stay put when you navigate. Previously this component wrapped
 * Tailwind's `container` utility, which carries its own `padding: 2rem` from
 * tailwind.config.js and a 1400px cap at 2xl. Stacking `px-4 md:px-8` on top of
 * that gave PageContainer pages a 4rem gutter and a 1400px cap, while pages
 * using the `.page-shell` CSS class got a 2rem gutter and a 1280px cap — so the
 * content edge visibly jumped between routes. The geometry below is now the one
 * source of truth and `.page-shell` in index.css mirrors it exactly.
 */
export type PageWidth = "narrow" | "default" | "wide" | "full";

const WIDTHS: Record<PageWidth, string> = {
  narrow: "max-w-3xl",
  default: "max-w-7xl",
  wide: "max-w-[90rem]",
  full: "max-w-none",
};

/** Gutter scale shared with `.page-shell`. Keep the two in sync. */
const GUTTERS = "px-4 sm:px-6 lg:px-8";
const VERTICAL = "pt-8 pb-16 lg:pt-10 lg:pb-20";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  width?: PageWidth;
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

export function PageContainer({
  children,
  className,
  animate = true,
  width = "default",
}: PageContainerProps) {
  const base = cn("w-full mx-auto", WIDTHS[width], GUTTERS, VERTICAL, className);

  if (!animate) {
    return <div className={base}>{children}</div>;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className={base}
    >
      {children}
    </motion.div>
  );
}
