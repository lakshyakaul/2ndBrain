'use client';
import React from 'react';
import { useSidebarToggle } from '@/lib/providers/sidebar-toggle-provider';
import GlobalTopbar from '@/components/app-navbar/navbar';

interface LayoutClientProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

const LayoutClient: React.FC<LayoutClientProps> = ({ sidebar, children }) => {
  const { sidebarOpen } = useSidebarToggle();
  return (
    <main className="flex flex-col h-screen w-screen bg-background overflow-hidden">
      <GlobalTopbar />
      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && sidebar}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </main>
  );
};

export default LayoutClient;
