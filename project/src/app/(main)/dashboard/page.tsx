import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import db from '@/lib/supabase/db';
import { redirect } from 'next/navigation';
import DashboardSetup from '@/components/app-main-window/overview/dashboard/dashboard-setup';
import { getUserSubscriptionStatus, findUser } from '@/lib/supabase/queries';
import Link from 'next/link';
import { LayoutGrid, Sparkles, FolderKanban, LogOut, Settings, Plus } from 'lucide-react';
import ModeToggle from '@/components/app-navbar/theme/mode-toggle';
import GlobalTopbar from '@/components/app-navbar/navbar';

const DashboardPage = async () => {
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

    if (!user) {
        redirect('/login');
    }

    // Fetch all user workspaces
    const userWorkspaces = await db.query.workspaces.findMany({
        where: (workspace, { eq }) => eq(workspace.workspaceOwner, user.id),
    });

    const { data: subscription, error: subscriptionError } =
        await getUserSubscriptionStatus(user.id);

    const dbUser = await findUser(user.id);

    // If no workspaces exist, prompt setup
    if (!userWorkspaces || userWorkspaces.length === 0) {
        return (
            <div className="bg-background h-screen w-screen flex justify-center items-center">
                <DashboardSetup
                    user={user}
                    subscription={subscription}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col bg-background text-foreground font-sans">
            {/* Top Fixed Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <GlobalTopbar hideSidebarButton />
            </div>

            {/* Container A: Main layout area under fixed navbar */}
            <main className="flex-1 pt-14 flex flex-col min-h-[calc(100vh-3.5rem)]">
                <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col justify-start">

                    {/* Welcome Header */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">
                                Welcome back, {dbUser?.nickname || user.email?.split('@')[0]}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Select a workspace to resume collaborating with your AI agents.
                            </p>
                        </div>

                        <Link href="/dashboard/setup">
                            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md">
                                <Plus className="size-4" />
                                <span>New Workspace</span>
                            </button>
                        </Link>
                    </div>

                    {/* Workspaces Grid list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {userWorkspaces.map((workspace) => (
                            <Link
                                href={`/dashboard/${workspace.id}`}
                                key={workspace.id}
                                className="group relative rounded-2xl border border-border/50 bg-background/50 hover:bg-muted/10 hover:border-brand-primary-blue/30 p-6 flex flex-col justify-between h-48 transition-all duration-300 shadow-sm overflow-hidden"
                            >
                                {/* Hover background glow */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary-blue/5 via-transparent to-brand-primary-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="flex items-start justify-between">
                                    <div className="h-12 w-12 rounded-xl bg-muted/40 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-brand-primary-blue/10 transition-all duration-300">
                                        {workspace.iconId || '📁'}
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                        Workspace
                                    </span>
                                </div>

                                <div className="mt-4">
                                    <h3 className="font-bold text-lg group-hover:text-brand-primary-blue transition-colors truncate">
                                        {workspace.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                        Created {new Date(workspace.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </Link>
                        ))}

                        {/* Interactive setup/create card stub */}
                        <Link
                            href="/dashboard/setup"
                            className="group rounded-2xl border border-dashed border-border/80 hover:border-brand-primary-purple/50 bg-transparent hover:bg-muted/5 p-6 flex flex-col items-center justify-center text-center h-48 transition-all duration-300"
                        >
                            <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:scale-110 group-hover:bg-brand-primary-purple/10 group-hover:text-brand-primary-purple transition-all duration-300">
                                <Plus className="size-5" />
                            </div>
                            <span className="font-bold text-sm text-muted-foreground mt-3 group-hover:text-foreground transition-colors">
                                Add Workspace
                            </span>
                            <span className="text-xs text-muted-foreground/60 mt-1 max-w-[180px]">
                                Create a blank collaborative space.
                            </span>
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default DashboardPage;