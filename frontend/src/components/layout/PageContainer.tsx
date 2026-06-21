import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

export function PageContainer({ children, className, animate = true }: PageContainerProps) {
  if (!animate) {
    return (
      <div className={cn("container mx-auto px-4 py-8 md:px-8", className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn("container mx-auto px-4 py-8 md:px-8", className)}
    >
      {children}
    </motion.div>
  );
}
