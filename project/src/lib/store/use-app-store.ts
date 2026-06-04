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
            workspaces: state.workspaces.map((w) => {
                if (w.id !== workspaceId) return w;

                const pages = w.pages || [];
                const updatedPages = [...pages];

                const applyUpdateRecursively = (id: string, updates: Partial<Page>) => {
                    const idx = updatedPages.findIndex(p => p.id === id);
                    if (idx !== -1) {
                        updatedPages[idx] = { ...updatedPages[idx], ...updates };
                    }
                    if ('inTrash' in updates) {
                        const children = pages.filter(p => p.parentId === id);
                        children.forEach(child => {
                            applyUpdateRecursively(child.id, { inTrash: updates.inTrash });
                        });
                    }
                };

                applyUpdateRecursively(pageId, updatedPage);

                return {
                    ...w,
                    pages: updatedPages,
                };
            }),
        })),

    deletePage: (workspaceId, pageId) =>
        set((state) => {
            const findDescendants = (pages: Page[], parentId: string): string[] => {
                const childIds = pages.filter(p => p.parentId === parentId).map(p => p.id);
                return [parentId, ...childIds.flatMap(id => findDescendants(pages, id))];
            };
            return {
                workspaces: state.workspaces.map((w) => {
                    if (w.id !== workspaceId) return w;
                    const idsToRemove = findDescendants(w.pages || [], pageId);
                    return {
                        ...w,
                        pages: (w.pages || []).filter((p) => !idsToRemove.includes(p.id)),
                    };
                }),
            };
        }),

    setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
    setActivePageId: (id) => set({ activePageId: id }),
}));
