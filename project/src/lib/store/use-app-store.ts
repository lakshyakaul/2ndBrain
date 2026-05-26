'use client';

import { create } from 'zustand';
import { Page, Workspace } from '../supabase/supabase.types';

export type appWorkspacesType = Workspace & {
    pages: Page[] | [];
};

interface AppState {
    workspaces: appWorkspacesType[];
    activeWorkspaceId: string | undefined;
    activePageId: string | undefined;
    
    // Actions
    setWorkspaces: (workspaces: appWorkspacesType[]) => void;
    addWorkspace: (workspace: appWorkspacesType) => void;
    deleteWorkspace: (workspaceId: string) => void;
    updateWorkspace: (workspaceId: string, workspace: Partial<appWorkspacesType>) => void;
    
    setPages: (workspaceId: string, pages: Page[]) => void;
    addPage: (workspaceId: string, page: Page) => void;
    updatePage: (workspaceId: string, pageId: string, page: Partial<Page>) => void;
    deletePage: (workspaceId: string, pageId: string) => void;
    
    setActiveWorkspaceId: (id: string | undefined) => void;
    setActivePageId: (id: string | undefined) => void;
}

export const useAppStore = create<AppState>((set) => ({
    workspaces: [],
    activeWorkspaceId: undefined,
    activePageId: undefined,

    setWorkspaces: (workspaces) => set({ workspaces }),

    addWorkspace: (workspace) =>
        set((state) => ({
            workspaces: [...state.workspaces, workspace],
        })),

    deleteWorkspace: (workspaceId) =>
        set((state) => ({
            workspaces: state.workspaces.filter((w) => w.id !== workspaceId),
        })),

    updateWorkspace: (workspaceId, updatedWorkspace) =>
        set((state) => ({
            workspaces: state.workspaces.map((w) =>
                w.id === workspaceId ? { ...w, ...updatedWorkspace } : w
            ),
        })),

    setPages: (workspaceId, pages) =>
        set((state) => ({
            workspaces: state.workspaces.map((w) =>
                w.id === workspaceId
                    ? {
                          ...w,
                          pages: [...pages].sort(
                              (a, b) =>
                                  new Date(a.createdAt).getTime() -
                                  new Date(b.createdAt).getTime()
                          ),
                      }
                    : w
            ),
        })),

    addPage: (workspaceId, page) =>
        set((state) => ({
            workspaces: state.workspaces.map((w) =>
                w.id === workspaceId
                    ? {
                          ...w,
                          pages: [...(w.pages || []), page].sort(
                              (a, b) =>
                                  new Date(a.createdAt).getTime() -
                                  new Date(b.createdAt).getTime()
                          ),
                      }
                    : w
            ),
        })),

    updatePage: (workspaceId, pageId, updatedPage) =>
        set((state) => ({
            workspaces: state.workspaces.map((w) =>
                w.id === workspaceId
                    ? {
                          ...w,
                          pages: (w.pages || []).map((p) =>
                              p.id === pageId ? { ...p, ...updatedPage } : p
                          ),
                      }
                    : w
            ),
        })),

    deletePage: (workspaceId, pageId) =>
        set((state) => ({
            workspaces: state.workspaces.map((w) =>
                w.id === workspaceId
                    ? {
                          ...w,
                          pages: (w.pages || []).filter((p) => p.id !== pageId),
                      }
                    : w
            ),
        })),

    setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
    setActivePageId: (id) => set({ activePageId: id }),
}));
