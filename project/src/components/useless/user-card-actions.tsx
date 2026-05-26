'use client';
import React from 'react';
import clsx from 'clsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import CypressProfileIcon from '../icons/cypressProfileIcon';
import { LogOut, Settings } from 'lucide-react';
import LogoutButton from '@/components/app-navbar/profile/logout-button';
import CustomDialogTrigger from '../global/custom-dialog-trigger';
import UserSettingsForm from '../settings/user-settings-form';

interface UserCardActionsProps {
  email: string;
  avatarUrl: string;
  nickname: string;
  isPro?: boolean;
}

const UserCardActions: React.FC<UserCardActionsProps> = ({
  email,
  avatarUrl,
  nickname,
  isPro,
}) => {
  return (
    <article
      className={clsx(
        "flex justify-between items-center px-4 py-2 dark:bg-Neutrals/neutrals-12 rounded-3xl transition-all",
        isPro ? "border border-primary/30" : ""
      )}
      style={isPro ? { boxShadow: '0 0 20px hsla(var(--primary), 0.8)' } : undefined}
    >
      <aside className="flex justify-center items-center gap-2">
        <Avatar>
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>
            <CypressProfileIcon />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-foreground font-semibold text-sm">{nickname}</span>
        </div>
      </aside>
      <div className="flex items-center justify-center gap-1">
        <CustomDialogTrigger header="Account Settings" content={<UserSettingsForm />}>
          <button
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </CustomDialogTrigger>
      </div>
    </article>
  );
};

export default UserCardActions;
