'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  children?: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ children }) => {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const logout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (children) {
    return (
      <div onClick={logout} className="inline-block w-full sm:w-auto">
        {children}
      </div>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={logout}>
      {children}
    </Button>
  );
};

export default LogoutButton;
