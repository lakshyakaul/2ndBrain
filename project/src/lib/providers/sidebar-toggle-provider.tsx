'use client';
import React, { createContext, useContext, useState } from 'react';

interface SidebarToggleContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const SidebarToggleContext = createContext<SidebarToggleContextType>({
  sidebarOpen: true,
  setSidebarOpen: () => {},
});

export const SidebarToggleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <SidebarToggleContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </SidebarToggleContext.Provider>
  );
};

export const useSidebarToggle = () => useContext(SidebarToggleContext);
