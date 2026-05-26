'use server';

import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { FormSchema } from '../types';
import { cookies } from 'next/headers';

export async function actionLoginUser({
  email,
  password,
}: z.infer<typeof FormSchema>) {
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (response.error) {
    return { error: { message: response.error.message } };
  }
  return JSON.parse(JSON.stringify(response));
}

export async function actionSignUpUser({
  email,
  password,
}: z.infer<typeof FormSchema>) {
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

  const response = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}api/auth/callback`,
    },
  });

  if (response.error) {
    return { error: { message: response.error.message } };
  }

  // Auto-confirm user for local development if SERVICE_ROLE_KEY is present
  if (process.env.SERVICE_ROLE_KEY && response.data.user?.id) {
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SERVICE_ROLE_KEY,
      {
        cookies: {
          getAll() { return []; },
          setAll() {}
        }
      }
    );
    await adminSupabase.auth.admin.updateUserById(response.data.user.id, { email_confirm: true });
  }

  return JSON.parse(JSON.stringify(response));
}