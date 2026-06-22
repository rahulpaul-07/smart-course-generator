import React from "react";
import { Sidebar } from "./Sidebar";
import { TopNavigation } from "./TopNavigation";
import { LayoutProvider } from "@/contexts/LayoutContext";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <LayoutProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary/30">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <TopNavigation />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </LayoutProvider>
  );
}
