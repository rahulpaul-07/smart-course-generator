import React from 'react';
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from './button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an error while loading this content. Please try again.",
  onRetry,
  icon,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in duration-200",
        className
      )}
      {...props}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-sm">
        {icon ? icon : <AlertCircle className="h-5 w-5" />}
      </div>
      <h3 className="mb-2 font-display text-lg font-bold text-foreground tracking-tight">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
          <RefreshCcw className="mr-2 h-4 w-4" /> Retry
        </Button>
      )}
    </div>
  );
}
