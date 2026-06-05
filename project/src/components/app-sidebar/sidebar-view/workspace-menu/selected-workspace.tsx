'use client';
import { Workspace } from '@/lib/supabase/supabase.types';
import Link from 'next/link';
import React from 'react';

import { Lock, Link as LinkIcon, Users } from 'lucide-react';
import { cn, sidebarNavItemClass } from '@/lib/utils';

interface SelectedWorkspaceProps {
    workspace: Workspace;
    onClick?: (option: Workspace) => void;
    type: 'private' | 'shared' | 'collaborating';
    isActive?: boolean;
}

const SelectedWorkspace: React.FC<SelectedWorkspaceProps> = ({
    workspace,
    onClick,
    type,
    isActive = false,
}) => {
    return (
        <Link
            href={`/dashboard/${workspace.id}`}
            onClick={() => {
                if (onClick) onClick(workspace);
            }}
            className={cn(
                sidebarNavItemClass,
                'w-full text-left cursor-pointer hover:no-underline',
                isActive ? 'text-foreground font-semibold bg-muted/50' : ''
            )}
        >
            {type === 'private' && <Lock size={14} className="shrink-0 opacity-70" />}
            {type === 'shared' && <LinkIcon size={14} className="shrink-0 opacity-70" />}
            {type === 'collaborating' && <Users size={14} className="shrink-0 opacity-70" />}
            <span className="truncate flex-1">{workspace.title}</span>
        </Link>
    );
};

export default SelectedWorkspace;