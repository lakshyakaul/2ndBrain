import React from 'react';
import { Subscription } from '@/lib/supabase/supabase.types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import db from '@/lib/supabase/db';
import UserCardActions from './user-card-actions';

interface UserCardProps {
  subscription: Subscription | null;
}

const UserCard: React.FC<UserCardProps> = async ({ subscription }) => {
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

  if (!user) return;
  const response = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, user.id),
  });
  if (!response) return;

  const avatarUrl = response.avatarUrl
    ? supabase.storage.from('avatars').getPublicUrl(response.avatarUrl)?.data.publicUrl
    : '';

  const isPro = subscription?.status === 'active';

  return (
    <UserCardActions
      email={response.email ?? ''}
      avatarUrl={avatarUrl}
      nickname={response.nickname || 'User'}
      isPro={isPro}
    />
  );
};

export default UserCard;
