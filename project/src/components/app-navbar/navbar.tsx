'use client';
import React, { useEffect, useState } from 'react';
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
import Link from "next/link";
import TrashRestore from "@/components/trash/trash-restore";
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createBrowserClient } from '@supabase/ssr';

interface GlobalTopbarProps {
  breadCrumbs?: React.ReactNode;
  children?: React.ReactNode;
  hideSidebarButton?: boolean;
}

const GlobalTopbar: React.FC<GlobalTopbarProps> = ({ breadCrumbs, children, hideSidebarButton }) => {
  const { sidebarOpen, setSidebarOpen } = useSidebarToggle();
  const { user } = useSupabaseUser();
  const [avatarUrl, setAvatarUrl] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!user?.id) return;
    const fetchAvatar = async () => {
      const { data } = await supabase.from('users').select('avatar_url').eq('id', user.id).single();
      if (data?.avatar_url) {
        setAvatarUrl(supabase.storage.from('avatars').getPublicUrl(data.avatar_url).data.publicUrl);
      }
    };
    fetchAvatar();
  }, [user]);

  return (
    <div className="w-full shrink-0 h-14 border-b border-border/50 dark:border-border bg-background flex items-center justify-between px-6">
      {/* Left side */}
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
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all">
            <Home size={16} />
            Home
          </Link>
          <CustomDialogTrigger header="Trash" content={<TrashRestore />}>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all">
              <Trash2 size={16} />
              Trash
            </button>
          </CustomDialogTrigger>
        </div>

        {/* Breadcrumbs */}
        {breadCrumbs && (
          <div className="flex items-center text-sm font-medium text-muted-foreground border-l border-border/50 pl-4 ml-2">
            {breadCrumbs}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {children}
        <ModeToggle />

        {/* User Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="outline-none rounded-full hover:ring-2 hover:ring-primary/30 transition-all"
              title="User Profile"
            >
              <Avatar className="h-8 w-8 border border-border/50">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-muted">
                  <User size={16} className="text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <CustomDialogTrigger header="Account Settings" content={<UserSettingsForm />}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="w-full cursor-pointer">
                Account Settings
              </DropdownMenuItem>
            </CustomDialogTrigger>
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
