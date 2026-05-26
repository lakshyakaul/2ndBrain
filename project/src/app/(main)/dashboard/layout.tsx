import { SubscriptionModalProvider } from '@/lib/providers/subscription-modal-provider';
import { getActiveProductsWithPrice } from '@/lib/supabase/queries';
import React from 'react';
import { SidebarToggleProvider } from '@/lib/providers/sidebar-toggle-provider';

interface LayoutProps {
    children: React.ReactNode;
    params: any;
}

const Layout: React.FC<LayoutProps> = async ({ children, params }) => {
    const { data: products, error } = await getActiveProductsWithPrice();
    if (error) throw new Error();
    return (
        <main className="flex over-hidden h-screen">
            <SidebarToggleProvider>
                <SubscriptionModalProvider products={products}>
                    {children}
                </SubscriptionModalProvider>
            </SidebarToggleProvider>
        </main>
    );
};

export default Layout;