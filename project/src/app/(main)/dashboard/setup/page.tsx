import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardSetup from '@/components/app-main-window/overview/dashboard/dashboard-setup';
import { getUserSubscriptionStatus } from '@/lib/supabase/queries';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const SetupPage = async () => {
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

    const { data: subscription } = await getUserSubscriptionStatus(user.id);

    return (
        <div className="bg-background min-h-screen w-screen flex flex-col justify-center items-center p-6 relative">
            <div className="absolute top-6 left-6">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft size={16} />
                    <span>Back to Dashboard</span>
                </Link>
            </div>
            <DashboardSetup user={user} subscription={subscription} />
        </div>
    );
};

export default SetupPage;
