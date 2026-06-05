'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { Workspace } from '@/lib/supabase/supabase.types';
import React, { useEffect } from 'react';
import SelectedWorkspace from './selected-workspace';
import CustomDialogTrigger from '@/components/global/custom-dialog-trigger';
import WorkspaceCreator from './workspace-creator';
import { ArrowLeftRight, Plus } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { usePathname } from 'next/navigation';
import { cn, sidebarNavItemClass } from '@/lib/utils';

interface WorkspaceDropdownProps {
    privateWorkspaces: Workspace[] | [];
    sharedWorkspaces: Workspace[] | [];
    collaboratingWorkspaces: Workspace[] | [];
}

const WorkspaceDropdown: React.FC<WorkspaceDropdownProps> = ({
    privateWorkspaces,
    collaboratingWorkspaces,
    sharedWorkspaces,
}) => {
    const { dispatch, state } = useAppState();
    const pathname = usePathname();
    const currentWorkspaceId = pathname?.split('/')[2] || '';

    useEffect(() => {
        const allWorkspaces = [
            ...privateWorkspaces,
            ...sharedWorkspaces,
            ...collaboratingWorkspaces,
        ];
        const existingIds = new Set(state.workspaces.map((w) => w.id));
        const newWorkspaces = allWorkspaces
            .filter((w) => !existingIds.has(w.id))
            .map((w) => ({ ...w, pages: [] }));
        if (newWorkspaces.length > 0) {
            dispatch({
                type: 'SET_WORKSPACES',
                payload: {
                    workspaces: [...state.workspaces, ...newWorkspaces],
                },
            });
        }
    }, [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces, dispatch, state.workspaces]);

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="workspaces" className="border-none">
                <AccordionTrigger className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors w-full text-left cursor-pointer [&[data-state=open]]:bg-muted [&[data-state=open]]:text-foreground font-normal">
                    <div className="flex items-center gap-2 flex-1">
                        <ArrowLeftRight size={16} />
                        <span>Select</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-0 px-2 [&_a]:no-underline">
                    <div className="flex flex-col gap-0 border-l border-border/50 ml-3 pl-2 py-1">
                        {privateWorkspaces.map((option) => {
                            const stateWorkspace = state.workspaces.find(w => w.id === option.id) || option;
                            return <SelectedWorkspace key={option.id} workspace={stateWorkspace} type="private" isActive={currentWorkspaceId === option.id} />;
                        })}
                        {sharedWorkspaces.map((option) => {
                            const stateWorkspace = state.workspaces.find(w => w.id === option.id) || option;
                            return <SelectedWorkspace key={option.id} workspace={stateWorkspace} type="shared" isActive={currentWorkspaceId === option.id} />;
                        })}
                        {collaboratingWorkspaces.map((option) => {
                            const stateWorkspace = state.workspaces.find(w => w.id === option.id) || option;
                            return <SelectedWorkspace key={option.id} workspace={stateWorkspace} type="collaborating" isActive={currentWorkspaceId === option.id} />;
                        })}
                        <CustomDialogTrigger
                            header="Create A Workspace"
                            content={<WorkspaceCreator />}
                            description="Workspaces give you the power to collaborate with others. You can change your workspace privacy settings after creating the workspace too."
                        >
                            <div className={cn(sidebarNavItemClass, "cursor-pointer mt-1 w-full text-left")}>
                                <Plus size={14} className="shrink-0 opacity-70" />
                                <span>Create workspace</span>
                            </div>
                        </CustomDialogTrigger>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default WorkspaceDropdown;