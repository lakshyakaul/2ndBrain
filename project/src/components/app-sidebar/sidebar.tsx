import { createServerClient } from '@supabase/ssr';
import React from 'react';
import { cookies } from 'next/headers';
import {
    getCollaboratingWorkspaces,
    getPages,
    getPrivateWorkspaces,
    getSharedWorkspaces,
    getUserSubscriptionStatus,
} from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import WorkspaceDropdown from './sidebar-view/workspace-menu/workspace-dropdown';
import { ScrollArea } from '../ui/scroll-area';
import { Home, Trash2, Box, Bot } from 'lucide-react';
import Link from 'next/link';
import Trash from '../trash/trash';
import PagesDropdownList from './sidebar-view/page-menu/pages-dropdown-list';
// import UserCard from './user-card';

interface SidebarProps {
    params: { workspaceId: string };
    className?: string;
}

const Sidebar: React.FC<SidebarProps> = async ({ params, className }) => {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // ignore
                    }
                },
            },
        }
    );
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: subscriptionData, error: subscriptionError } =
        await getUserSubscriptionStatus(user.id);

    const { data: workspacePagesData, error: pagesError } = await getPages(
        params.workspaceId
    );
    const rootPages = workspacePagesData?.filter(page => page.parentId === null) || [];

    if (subscriptionError || pagesError) redirect('/dashboard');

    const [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces] =
        await Promise.all([
            getPrivateWorkspaces(user.id),
            getCollaboratingWorkspaces(user.id),
            getSharedWorkspaces(user.id),
        ]);

    return (
        <aside
            className={twMerge(
                'flex flex-col w-[280px] shrink-0 !justify-between border-r border-border/50 bg-background/50 backdrop-blur-md h-full',
                className
            )}
        >
            <div className="flex-1 flex flex-col min-h-0 gap-2 p-4"> {/* Removed pt-16 since topbar is above it */}
                <ScrollArea className="overflow-y-auto relative flex-1 w-full">
                    {/* Configurable Menus */}
                    <div className="flex flex-col gap-1 mt-2 mb-4">
                        <span className="text-[10px] text-muted-foreground font-bold px-2 mb-1 uppercase tracking-wider">
                            Menu Name
                        </span>
                        <WorkspaceDropdown
                            privateWorkspaces={privateWorkspaces}
                            sharedWorkspaces={sharedWorkspaces}
                            collaboratingWorkspaces={collaboratingWorkspaces}
                        />
                        <Link
                            href={`/dashboard`}
                            className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Home size={16} />
                            <span>Home</span>
                        </Link>
                        <Trash>
                            <div className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors w-full text-left cursor-pointer">
                                <Trash2 size={16} />
                                <span>Trash</span>
                            </div>
                        </Trash>
                    </div>

                    {/* Pages section */}
                    <div className="flex flex-col gap-1 mb-6">
                        <span className="text-[10px] text-muted-foreground font-bold px-2 mb-1 uppercase tracking-wider">
                            Pages
                        </span>
                        <PagesDropdownList
                            workspacePages={workspacePagesData || []}
                            workspaceId={params.workspaceId}
                        />
                    </div>
                </ScrollArea>
            </div>
            {/* Bottom Profile and Usage details
            <div className="flex flex-col gap-2 px-4 pb-4 border-t border-border/40 pt-4">
                <PlanUsage
                    foldersLength={rootPages.length}
                    subscription={subscriptionData}
                />
                <UserCard subscription={subscriptionData} />
            </div> */}
        </aside>
    );
};

export default Sidebar;
