'use client';
import React, { useEffect } from 'react';
import { useAppState } from '@/lib/providers/state-provider';
import { Workspace, Page } from '@/lib/supabase/supabase.types';

interface StateInitializerProps {
  workspaces: Workspace[];
  pages: Page[];
  workspaceId: string;
}

const StateInitializer: React.FC<StateInitializerProps> = ({
  workspaces,
  pages,
  workspaceId,
}) => {
  const { dispatch, state } = useAppState();

  useEffect(() => {
    // Populate workspaces
    if (workspaces.length > 0) {
      const existingIds = new Set(state.workspaces.map((w) => w.id));
      const newWorkspaces = workspaces
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
    }

    // Populate pages for current workspace
    if (pages.length > 0) {
      dispatch({
        type: 'SET_PAGES',
        payload: {
          workspaceId,
          pages: pages,
        },
      });
    }
  }, [workspaces, pages, workspaceId, dispatch]);

  return null;
};

export default StateInitializer;
