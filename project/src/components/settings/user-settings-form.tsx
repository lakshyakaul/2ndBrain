'use client';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAppState } from '@/lib/providers/state-provider';
import { User, workspace } from '@/lib/supabase/supabase.types';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  Briefcase,
  CreditCard,
  ExternalLink,
  Lock,
  LogOut,
  Plus,
  Share,
  User as UserIcon,
} from 'lucide-react';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  addCollaborators,
  deleteWorkspace,
  getCollaborators,
  removeCollaborators,
  updateWorkspace,
} from '@/lib/supabase/queries';
import { v4 } from 'uuid';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


import CollaboratorSearch from '@/components/app-sidebar/sidebar-view/collaborators-menu/collaborator-search';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Alert, AlertDescription } from '../ui/alert';
import CypressProfileIcon from '../icons/cypressProfileIcon';
import LogoutButton from '@/components/app-navbar/profile/logout-button';
import Link from 'next/link';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import { postData } from '@/lib/utils';

const UserSettingsForm = () => {
  const { user, subscription } = useSupabaseUser();
  const { open, setOpen } = useSubscriptionModal();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [nickname, setNickname] = useState('User');
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const nicknameTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!user?.id) return;
    const fetchUser = async () => {
      const { data } = await supabase.from('users').select('nickname').eq('id', user.id).single();
      if (data?.nickname) setNickname(data.nickname);
    };
    fetchUser();
  }, [user]);

  const redirectToCustomerPortal = async () => {
    setLoadingPortal(true);
    try {
      const { url, error } = await postData({
        url: '/api/create-portal-link',
      });
      window.location.assign(url);
    } catch (error) {
      console.log(error);
      setLoadingPortal(false);
    }
    setLoadingPortal(false);
  };

  const nicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNickname = e.target.value.slice(0, 10);
    setNickname(newNickname);
    if (nicknameTimerRef.current) clearTimeout(nicknameTimerRef.current);
    nicknameTimerRef.current = setTimeout(async () => {
      if (!user?.id) return;
      await supabase.from('users').update({ nickname: newNickname }).eq('id', user.id);
      toast.success('Nickname updated');
      router.refresh();
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="font-semibold leading-none tracking-tight text-lg flex items-center gap-2">
            <UserIcon size={20} /> Profile Details
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Update your personal information and how others see you.
          </p>
        </div>
        <Separator />
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nickname" className="text-sm font-medium">
              Nickname <span className="text-muted-foreground font-normal">(Max 10 letters)</span>
            </Label>
            <Input
              name="nickname"
              value={nickname}
              placeholder="Nickname"
              onChange={nicknameChange}
              className="max-w-[300px]"
            />
          </div>

          <div className="flex items-start gap-6">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={''} />
              <AvatarFallback>
                <CypressProfileIcon />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Email Address</Label>
              <small className="text-muted-foreground cursor-not-allowed bg-muted/50 px-3 py-1.5 rounded-md border inline-flex items-center w-max">
                {user ? user.email : ''}
              </small>
              <div className="mt-2 flex flex-col gap-2">
                <Label
                  htmlFor="profilePicture"
                  className="text-sm font-medium"
                >
                  Profile Picture
                </Label>
                <Input
                  name="profilePicture"
                  type="file"
                  accept="image/*"
                  className="max-w-[300px]"
                  disabled={uploadingProfilePic}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="font-semibold leading-none tracking-tight text-lg flex items-center gap-2">
            <CreditCard size={20} /> Subscription
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your billing and plan details.
          </p>
        </div>
        <Separator />
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Current Plan</span>
            <p className="text-muted-foreground text-sm">
              You are currently on the{' '}
              <span className="inline-flex items-center rounded-full border px-2.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20 whitespace-nowrap align-middle">
                {subscription?.status === 'active' ? 'Pro' : 'Free'} Plan
              </span>
            </p>
            <Link
              href="/"
              target="_blank"
              className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
            >
              View pricing plans <ExternalLink size={14} />
            </Link>
          </div>
          <div className="shrink-0 mt-2 sm:mt-0">
            {subscription?.status === 'active' ? (
              <Button
                type="button"
                variant={'outline'}
                disabled={loadingPortal}
                onClick={redirectToCustomerPortal}
              >
                Manage Subscription
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setOpen(true)}
              >
                Start Pro Plan
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold leading-none tracking-tight text-lg text-destructive">
              Danger Zone
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Sign out of your account on this device.
            </p>
          </div>
          <div className="shrink-0 mt-2 sm:mt-0">
            <LogoutButton>
              <Button variant="destructive" className="flex items-center gap-2">
                <LogOut size={16} />
              </Button>
            </LogoutButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsForm;
