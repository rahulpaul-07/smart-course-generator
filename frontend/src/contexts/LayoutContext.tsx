import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useStorage';
import { STORAGE_KEYS } from '../utils/constants';

interface LayoutContextType {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage<boolean>(STORAGE_KEYS.SIDEBAR_COLLAPSED, false);

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
  const setSidebarCollapsed = (collapsed: boolean) => setIsSidebarCollapsed(collapsed);

  return (
    <LayoutContext.Provider value={{ isSidebarCollapsed, toggleSidebar, setSidebarCollapsed }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
