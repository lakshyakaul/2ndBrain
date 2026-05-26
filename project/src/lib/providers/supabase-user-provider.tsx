'use client';

import { AuthUser } from '@supabase/supabase-js';
import { Subscription } from '../supabase/supabase.types';
import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getUserSubscriptionStatus } from '../supabase/queries';
import { toast } from 'sonner';

type SupabaseUserContextType = {
    user: AuthUser | null;
    subscription: Subscription | null;
};

const SupabaseUserContext = createContext<SupabaseUserContextType>({
    user: null,
    subscription: null,
});

export const useSupabaseUser = () => {
    return useContext(SupabaseUserContext);
};

interface SupabaseUserProviderProps {
    children: React.ReactNode;
}

export const SupabaseUserProvider: React.FC<SupabaseUserProviderProps> = ({
    children,
}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    // sonner toast

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    //Fetch the user details
    //subscrip
    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                console.log(user);
                setUser(user);
                const { data, error } = await getUserSubscriptionStatus(user.id);
                if (data) setSubscription(data);
                if (error) {
                    toast.error('Unexpected Error', {
                        description:
                            'Oppse! An unexpected error happened. Try again later.',
                    });
                }
            }
        };
        getUser();
    }, [supabase, toast]);
    return (
        <SupabaseUserContext.Provider value={{ user, subscription }}>
            {children}
        </SupabaseUserContext.Provider>
    );
};