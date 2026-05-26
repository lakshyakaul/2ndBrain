'use client';
import React, { createContext, useContext, useState } from 'react';

interface RightSidebarToggleContextType {
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean) => void;
}

const RightSidebarToggleContext = createContext<RightSidebarToggleContextType>({
  rightSidebarOpen: false,
  setRightSidebarOpen: () => {},
});

export const RightSidebarToggleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  return (
    <RightSidebarToggleContext.Provider value={{ rightSidebarOpen, setRightSidebarOpen }}>
      {children}
    </RightSidebarToggleContext.Provider>
  );
};

export const useRightSidebarToggle = () => useContext(RightSidebarToggleContext);
