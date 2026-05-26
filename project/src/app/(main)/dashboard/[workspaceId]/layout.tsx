import AIChatSidebar from '@/components/app-sidebar/ai-chat-sidebar';
import { SidebarToggleProvider } from '@/lib/providers/sidebar-toggle-provider';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import LayoutClient from './layout-client';
import { ActiveEditorProvider } from '@/lib/providers/active-editor-provider';
import StateInitializer from '@/components/global/state-initializer';
import {
    getPrivateWorkspaces,
    getSharedWorkspaces,
    getCollaboratingWorkspaces,
    getPages,
} from '@/lib/supabase/queries';

interface LayoutProps {
    children: React.ReactNode;
    params: any;
}

const Layout = async ({ children, params }: LayoutProps) => {
    const resolvedParams = await params;
    
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {}
                },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect('/login');
    }

    // Fetch data for the state initializer
    const [
        privateWorkspaces,
        sharedWorkspaces,
        collaboratingWorkspaces,
        pagesData,
    ] = await Promise.all([
        getPrivateWorkspaces(user.id),
        getSharedWorkspaces(user.id),
        getCollaboratingWorkspaces(user.id),
        getPages(resolvedParams.workspaceId),
    ]);

    const allWorkspaces = [
        ...(privateWorkspaces || []),
        ...(sharedWorkspaces || []),
        ...(collaboratingWorkspaces || []),
    ];

    return (
        <SidebarToggleProvider>
            <ActiveEditorProvider>
                <StateInitializer 
                    workspaces={allWorkspaces} 
                    pages={pagesData.data || []} 
                    workspaceId={resolvedParams.workspaceId} 
                />
                <LayoutClient sidebar={<AIChatSidebar />}>
                    {children}
                </LayoutClient>
            </ActiveEditorProvider>
        </SidebarToggleProvider>
    );
};

export default Layout;