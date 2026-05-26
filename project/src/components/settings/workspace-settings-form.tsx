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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

const WorkspaceSettingsForm = () => {
  const { user, subscription } = useSupabaseUser();
  const { open, setOpen } = useSubscriptionModal();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { state, workspaceId, dispatch } = useAppState();
  const [permissions, setPermissions] = useState('private');
  const [collaborators, setCollaborators] = useState<User[] | []>([]);
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const [workspaceDetails, setWorkspaceDetails] = useState<workspace>();
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

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

  const addCollaborator = async (profile: User) => {
    if (!workspaceId) return;
    if (subscription?.status !== 'active' && collaborators.length >= 2) {
      setOpen(true);
      return;
    }
    await addCollaborators([profile], workspaceId);
    setCollaborators([...collaborators, profile]);
  };

  const removeCollaborator = async (user: User) => {
    if (!workspaceId) return;
    if (collaborators.length === 1) {
      setPermissions('private');
    }
    await removeCollaborators([user], workspaceId);
    setCollaborators(
      collaborators.filter((collaborator) => collaborator.id !== user.id)
    );
    router.refresh();
  };

  const workspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId) return;
    dispatch({
      type: 'UPDATE_WORKSPACE',
      payload: { workspace: { title: e.target.value }, workspaceId },
    });
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      const title = e.target.value.trim() || 'Workspace';
      await updateWorkspace({ title }, workspaceId);
    }, 500);
  };


  const onClickAlertConfirm = async () => {
    if (!workspaceId) return;
    if (collaborators.length > 0) {
      await removeCollaborators(collaborators, workspaceId);
    }
    setPermissions('private');
    setOpenAlertMessage(false);
  };

  const onPermissionsChange = (val: string) => {
    if (val === 'private') {
      setOpenAlertMessage(true);
    } else setPermissions(val);
  };

  useEffect(() => {
    const showingWorkspace = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
    if (showingWorkspace) setWorkspaceDetails(showingWorkspace);
  }, [workspaceId, state]);

  useEffect(() => {
    if (!workspaceId) return;
    const fetchCollaborators = async () => {
      const response = await getCollaborators(workspaceId);
      if (response.length) {
        setPermissions('shared');
        setCollaborators(response);
      }
    };
    fetchCollaborators();
  }, [workspaceId]);

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="font-semibold leading-none tracking-tight text-lg flex items-center gap-2">
            <Briefcase size={20} /> Workspace Details
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Update your workspace name and logo.
          </p>
        </div>
        <Separator />
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="workspaceName" className="text-sm font-medium">
              Workspace Name
            </Label>
            <Input
              name="workspaceName"
              value={workspaceDetails ? workspaceDetails.title : ''}
              placeholder="Workspace Name"
              onChange={workspaceNameChange}
              className="max-w-[400px]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="font-semibold leading-none tracking-tight text-lg flex items-center gap-2">
            <Lock size={20} /> Access &amp; Security
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Manage who can view and collaborate in this workspace.
          </p>
        </div>
        <Separator />
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="permissions" className="text-sm font-medium mb-1">
              Workspace Permissions
            </Label>
            <Select onValueChange={onPermissionsChange} value={permissions}>
              <SelectTrigger className="w-full sm:max-w-[400px] h-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="private" className="py-2">
                    <div className="flex gap-3 items-center">
                      <Lock size={16} />
                      <article className="text-left flex flex-col">
                        <span className="font-medium">Private</span>
                        <p className="text-[11px] text-muted-foreground hidden sm:block">
                          Only you have access to this workspace.
                        </p>
                      </article>
                    </div>
                  </SelectItem>
                  <SelectItem value="shared" className="py-2">
                    <div className="flex gap-3 items-center">
                      <Share size={16} />
                      <article className="text-left flex flex-col">
                        <span className="font-medium">Shared</span>
                        <p className="text-[11px] text-muted-foreground hidden sm:block">
                          You can invite collaborators to join.
                        </p>
                      </article>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {permissions === 'shared' && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-medium">Collaborators</h4>
                  <p className="text-sm text-muted-foreground">
                    {collaborators.length} team member(s)
                  </p>
                </div>
                <CollaboratorSearch
                  existingCollaborators={collaborators}
                  getCollaborator={(user) => {
                    addCollaborator(user);
                  }}
                >
                  <Button type="button" size="sm" className="flex gap-2">
                    <Plus size={16} />
                    Invite
                  </Button>
                </CollaboratorSearch>
              </div>

              <ScrollArea className="h-[200px] w-full rounded-md border bg-background/50">
                {collaborators.length ? (
                  <div className="divide-y">
                    {collaborators.map((c) => (
                      <div
                        className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors"
                        key={c.id}
                      >
                        <div className="flex gap-4 items-center">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/avatars/7.png" />
                            <AvatarFallback>
                              {c.email?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm font-medium overflow-hidden overflow-ellipsis w-[140px] sm:w-[300px]">
                            {c.email}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeCollaborator(c)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center p-6 text-center text-muted-foreground text-sm">
                    No collaborators yet. Invite someone to start sharing!
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-destructive/20 bg-destructive/5 text-card-foreground shadow-sm overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="font-semibold leading-none tracking-tight text-lg text-destructive">
            Danger Zone
          </h3>
          <p className="text-sm text-destructive/80 mt-2">
            Irreversible and destructive actions.
          </p>
        </div>
        <Separator className="bg-destructive/20" />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">Delete Workspace</span>
              <span className="text-sm text-muted-foreground">
                Permanently delete this workspace and all of its contents. This action cannot be undone.
              </span>
            </div>
            <Button
              type="submit"
              variant="destructive"
              className="whitespace-nowrap bg-destructive/90 hover:bg-destructive"
              onClick={async () => {
                if (!workspaceId) return;
                await deleteWorkspace(workspaceId);
                toast.success('Successfully deleted your workspace');
                dispatch({ type: 'DELETE_WORKSPACE', payload: workspaceId });
                router.replace('/dashboard');
              }}
            >
              Delete Workspace
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={openAlertMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing a Shared workspace to a Private workspace will remove all
              collaborators permanantly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlertMessage(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onClickAlertConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkspaceSettingsForm;
