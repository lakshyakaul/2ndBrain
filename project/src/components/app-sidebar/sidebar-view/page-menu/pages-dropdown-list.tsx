'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { Page } from '@/lib/supabase/supabase.types';
import React, { useEffect, useState } from 'react';
import TooltipComponent from '@/components/global/tooltip-component';
import { PlusIcon } from 'lucide-react';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { v4 } from 'uuid';
import { createPage } from '@/lib/supabase/queries';
import { toast } from 'sonner';
import Dropdown from '../../dropdown';
import useSupabaseRealtime from '@/lib/hooks/useSupabaseRealtime';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import { usePathname } from 'next/navigation';

interface PagesDropdownListProps {
  workspacePages: Page[];
  workspaceId: string;
}

const PagesDropdownList: React.FC<PagesDropdownListProps> = ({
  workspacePages,
  workspaceId,
}) => {
  useSupabaseRealtime();
  const { state, dispatch } = useAppState();
  const { open, setOpen } = useSubscriptionModal();
  const [pages, setPages] = useState(workspacePages);
  const { subscription } = useSupabaseUser();
  const pathname = usePathname();
  
  const activePageId = pathname?.split('/').pop() !== workspaceId ? pathname?.split('/').pop() : null;

  // Initialize state — always set pages for this workspace (even empty)
  // so ADD_PAGE has a valid workspace entry in state.
  useEffect(() => {
    const existingWorkspace = state.workspaces.find((w) => w.id === workspaceId);
    if (!existingWorkspace || !existingWorkspace.pages || existingWorkspace.pages.length === 0) {
      if (workspacePages.length > 0) {
        dispatch({
          type: 'SET_PAGES',
          payload: {
            workspaceId,
            pages: workspacePages,
          },
        });
      }
    }
  }, [workspaceId, workspacePages, dispatch, state.workspaces]);

  useEffect(() => {
    setPages(
      state.workspaces.find((workspace) => workspace.id === workspaceId)
        ?.pages || []
    );
  }, [state, workspaceId]);

  const addPageHandler = async () => {
    if (pages.length >= 3 && !subscription) {
      setOpen(true);
      return;
    }
    const newPage: Page = {
      blocknoteData: null,
      id: v4(),
      createdAt: new Date().toISOString(),
      title: 'Untitled',
      iconId: '📄',
      inTrash: null,
      workspaceId,
      bannerUrl: '',
      type: 'blocknote',
      parentId: activePageId || null,
    };
    const { data, error } = await createPage(newPage);
    if (error) {
      toast.error('Error', {
        description: 'Could not create the page',
      });
    } else {
      dispatch({
        type: 'ADD_PAGE',
        payload: { workspaceId, page: newPage },
      });
      toast.success('Success', {
        description: 'Created page.',
      });
    }
  };

  return (
    <>
      <div className="flex sticky z-20 top-0 bg-background w-full h-10 group/title justify-between items-center pr-4 text-Neutrals/neutrals-8">
        <span className="text-muted-foreground font-bold text-xs uppercase tracking-wider px-2">
          SUB-PAGES
        </span>
        <TooltipComponent message="Create Page">
          <PlusIcon
            onClick={addPageHandler}
            size={16}
            className="group-hover/title:inline-block hidden cursor-pointer hover:dark:text-white"
          />
        </TooltipComponent>
      </div>
      <div className="pb-20 flex flex-col gap-1">
        {pages
          .filter((page) => !page.inTrash && page.parentId === (activePageId || null))
          .map((page) => (
            <Dropdown
              key={page.id}
              title={page.title}
              id={page.id}
              iconId={page.iconId}
            />
          ))}
      </div>
    </>
  );
};

export default PagesDropdownList;
