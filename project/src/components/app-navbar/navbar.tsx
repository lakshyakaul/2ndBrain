'use client';
import React from 'react';
import { Sparkles, User, Home, Trash2 } from 'lucide-react';
import { useSidebarToggle } from '@/lib/providers/sidebar-toggle-provider';
import ModeToggle from './theme/mode-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoutButton from "./profile/logout-button";
import CustomDialogTrigger from "@/components/global/custom-dialog-trigger";
import UserSettingsForm from "@/components/settings/user-settings-form";


interface GlobalTopbarProps {
  breadCrumbs?: React.ReactNode;
  children?: React.ReactNode;
  hideSidebarButton?: boolean;
}

const GlobalTopbar: React.FC<GlobalTopbarProps> = ({ breadCrumbs, children, hideSidebarButton }) => {
  const { sidebarOpen, setSidebarOpen } = useSidebarToggle();

  return (
    <div className="w-full shrink-0 h-14 border-b border-border/50 dark:border-border bg-background flex items-center justify-between px-6">
      {/* Left side: Toggle button and app branding "Space" */}
      <div className="flex items-center gap-4">
        {!hideSidebarButton && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-primary hover:text-primary/80 shrink-0"
            title={sidebarOpen ? 'Close AI Agent' : 'Open AI Agent'}
          >
            <Sparkles size={20} />
          </button>
        )}
        <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 mr-4">
          Space.
        </span>

        {/* Global Navigation Shortcuts */}
        <div className="flex items-center gap-1 border-l border-border/50 pl-4">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all">
            <Home size={16} />
            Home
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all">
            <Trash2 size={16} />
            Trash
          </button>
        </div>
        
        {/* Breadcrumbs */}
        {breadCrumbs && (
          <div className="flex items-center text-sm font-medium text-muted-foreground border-l border-border/50 pl-4 ml-2">
            {breadCrumbs}
          </div>
        )}
      </div>

      {/* Right side: Children, Dark Mode (Moon), AI agents (Robot), User profile (Avatar) */}
      <div className="flex items-center gap-4">
        {children}
        <ModeToggle />



        {/* User Profile (Avatar/User) dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 outline-none rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/50"
              title="User Profile"
            >
              <User size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Profile</DropdownMenuItem>

            <CustomDialogTrigger header="Account Settings" content={<UserSettingsForm />}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="w-full cursor-pointer">
                Account Settings
              </DropdownMenuItem>
            </CustomDialogTrigger>

            <DropdownMenuItem>Switch Accounts</DropdownMenuItem>
            <DropdownMenuSeparator />
            <LogoutButton>
              <DropdownMenuItem className="w-full cursor-pointer text-destructive">
                Log Out
              </DropdownMenuItem>
            </LogoutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default GlobalTopbar;
