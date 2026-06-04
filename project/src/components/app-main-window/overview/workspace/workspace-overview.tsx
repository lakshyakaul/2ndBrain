'use client';

import React, { useState } from 'react';
import { Workspace } from '@/lib/supabase/supabase.types';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, FileText, Settings as SettingsIcon, User, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TreeView from './tree-view';
import WorkspaceSettingsForm from '../../../settings/workspace-settings-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/providers/state-provider';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import { createPage } from '@/lib/supabase/queries';
import { v4 } from 'uuid';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface WorkspaceOverviewProps {
  workspace: Workspace;
}

const WorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({ workspace }) => {
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const { subscription } = useSupabaseUser();
  const { setOpen: setSubscriptionModalOpen } = useSubscriptionModal();
  const [creatingPage, setCreatingPage] = useState(false);

  const workspacePages = state.workspaces.find((w) => w.id === workspace.id)?.pages || [];

  const handleAddPage = async () => {
    if (workspacePages.length >= 3 && !subscription) {
      setSubscriptionModalOpen(true);
      return;
    }
    setCreatingPage(true);
    const newPageId = v4();
    const newPage = {
      novelData: null,
      blocknoteData: null,
      quillData: null,
      id: newPageId,
      createdAt: new Date().toISOString(),
      title: 'Untitled',
      iconId: '📄',
      inTrash: null,
      workspaceId: workspace.id,
      bannerUrl: '',
      type: 'blocknote',
      parentId: null,
    };

    const { data, error } = await createPage(newPage);
    if (error) {
      toast.error('Error', {
        description: 'Could not create the page',
      });
    } else {
      dispatch({
        type: 'ADD_PAGE',
        payload: { workspaceId: workspace.id, page: newPage },
      });
      toast.success('Success', {
        description: 'Created page.',
      });
      router.push(`/dashboard/${workspace.id}/${newPageId}`);
    }
    setCreatingPage(false);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-background text-foreground">
      {/* Content area — no page scroll, only internal scroll */}
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-8 py-6 overflow-hidden">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm font-medium text-muted-foreground border-b border-border/40 pb-4 mb-4 shrink-0">
          <Link
            href={`/dashboard/${workspace.id}`}
            className="hover:underline flex items-center gap-2"
          >
            <span>{workspace.iconId || '📁'}</span>
            <span className="truncate max-w-[200px] text-foreground font-medium">{workspace.title}</span>
          </Link>
        </div>
        <Tabs defaultValue="pages" className="w-full flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 shrink-0">
            <TabsList className="grid w-full sm:max-w-[420px] grid-cols-4 shrink-0">
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            <Button
              onClick={handleAddPage}
              disabled={creatingPage}
              size="sm"
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Page
            </Button>
          </div>

          {/* Pages tab — TreeView fills remaining height */}
          <TabsContent value="pages" className="flex-1 mt-0 overflow-hidden flex flex-col min-h-0">
            <Card className="shadow-sm border border-border flex-1 flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
                <CardTitle className="text-sm font-medium">Pages</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0 px-6 pb-6 min-h-0">
                <TreeView workspaceId={workspace.id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* About tab */}
          <TabsContent value="about" className="mt-0 overflow-y-auto">
            <Card className="shadow-sm border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">About</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium">Owner ID</span>
                      <span className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">
                        {workspace.workspaceOwner}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Created</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(workspace.createdAt), 'PPpp')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings tab */}
          <TabsContent value="settings" className="mt-0 overflow-y-auto">
            <Card className="shadow-sm border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Workspace Settings</CardTitle>
                <SettingsIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-4">
                <WorkspaceSettingsForm />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs tab */}
          <TabsContent value="logs" className="mt-0 overflow-y-auto">
            <Card className="shadow-sm border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Logs</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground/50 border-2 border-dashed rounded-md bg-muted/20">
                  Coming Soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkspaceOverview;
