'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect } from 'react';
import { useAppState } from '../providers/state-provider';
import { Page } from '../supabase/supabase.types';
import { useRouter } from 'next/navigation';

const useSupabaseRealtime = () => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { dispatch, state, workspaceId: selectedWorkspace } = useAppState();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pages' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            console.log('🟢 RECEIVED REAL TIME EVENT (PAGE)');
            const {
              workspace_id: workspaceId,
              id: pageId,
            } = payload.new;
            if (
              !state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.pages?.find((page) => page.id === pageId)
            ) {
              const newPage: Page = {
                id: payload.new.id,
                workspaceId: payload.new.workspace_id,
                parentId: payload.new.parent_id,
                createdAt: payload.new.created_at,
                title: payload.new.title,
                iconId: payload.new.icon_id,
                novelData: payload.new.novel_data,
                blocknoteData: payload.new.blocknote_data,
                quillData: payload.new.quill_data,
                inTrash: payload.new.in_trash,
                bannerUrl: payload.new.banner_url,
                type: payload.new.type || 'novel',
              };
              dispatch({
                type: 'ADD_PAGE',
                payload: { page: newPage, workspaceId },
              });
            }
          } else if (payload.eventType === 'DELETE') {
            let workspaceId = '';
            const pageExists = state.workspaces.some((workspace) =>
              workspace.pages?.some((page) => {
                if (page.id === payload.old.id) {
                  workspaceId = workspace.id;
                  return true;
                }
              })
            );
            if (pageExists && workspaceId) {
              router.replace(`/dashboard/${workspaceId}`);
              dispatch({
                type: 'DELETE_PAGE',
                payload: { pageId: payload.old.id, workspaceId },
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const { workspace_id: workspaceId } = payload.new;
            state.workspaces.some((workspace) =>
              workspace.pages?.some((page) => {
                if (page.id === payload.new.id) {
                  dispatch({
                    type: 'UPDATE_PAGE',
                    payload: {
                      workspaceId,
                      pageId: payload.new.id,
                      page: {
                        title: payload.new.title,
                        iconId: payload.new.icon_id,
                        inTrash: payload.new.in_trash,
                      },
                    },
                  });
                  return true;
                }
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, state, selectedWorkspace, dispatch, router]);

  return null;
};

export default useSupabaseRealtime;
