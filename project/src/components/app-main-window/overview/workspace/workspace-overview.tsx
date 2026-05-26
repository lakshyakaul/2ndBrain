'use client';

import React from 'react';
import { Workspace } from '@/lib/supabase/supabase.types';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, FileText, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TreeView from './tree-view';
import WorkspaceSettingsForm from '../../../settings/workspace-settings-form';
import { Settings } from 'lucide-react';

interface WorkspaceOverviewProps {
  workspace: Workspace;
}

const WorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({ workspace }) => {
  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background text-foreground">
      <div className="flex items-center justify-between border-b border-border/40 px-8 py-4 shrink-0">
        <span className="font-medium text-sm text-muted-foreground">{workspace.title}</span>
      </div>
      <div className="flex flex-col w-full h-full p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-serif">
            {workspace.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            Workspace Dashboard Overview
          </p>
        </div>

        <Tabs defaultValue="metadata" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full sm:max-w-[500px] grid-cols-5 mb-6">
            <TabsTrigger value="metadata">Info</TabsTrigger>
            <TabsTrigger value="organize">Organize</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="metadata" className="flex-1 mt-0">
            <Card className="shadow-sm border border-border w-full max-w-4xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Metadata</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Owner ID</span>
                      <span className="text-xs text-muted-foreground truncate w-[200px] sm:w-[300px]">
                        {workspace.workspaceOwner}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Created At</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(workspace.createdAt), 'PPpp')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organize" className="flex-1 mt-0 flex flex-col">
            <Card className="shadow-sm border border-border w-full max-w-4xl flex-1 flex flex-col min-h-[400px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
                <CardTitle className="text-sm font-medium">Organize</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0 px-6 pb-6">
                <TreeView workspaceId={workspace.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 mt-0">
            <Card className="shadow-sm border border-border w-full max-w-4xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Workspace Settings</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-4">
                <WorkspaceSettingsForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="flex-1 mt-0">
            <Card className="shadow-sm border border-border w-full max-w-4xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Logs</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground/50 border-2 border-dashed rounded-md bg-muted/20">
                  Coming Soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="flex-1 mt-0">
            <Card className="shadow-sm border border-border w-full max-w-4xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Insights</CardTitle>
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
