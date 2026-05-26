'use client';

import React from 'react';
import { useAppStore, appWorkspacesType } from '../store/use-app-store';
export type { appWorkspacesType };
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export const useAppState = () => {
    const workspaces = useAppStore((s) => s.workspaces);
    const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);
    const activePageId = useAppStore((s) => s.activePageId);
    
    const setWorkspaces = useAppStore((s) => s.setWorkspaces);
    const addWorkspace = useAppStore((s) => s.addWorkspace);
    const deleteWorkspace = useAppStore((s) => s.deleteWorkspace);
    const updateWorkspace = useAppStore((s) => s.updateWorkspace);
    
    const setPages = useAppStore((s) => s.setPages);
    const addPage = useAppStore((s) => s.addPage);
    const updatePage = useAppStore((s) => s.updatePage);
    const deletePage = useAppStore((s) => s.deletePage);

    const state = useMemo(() => ({ workspaces }), [workspaces]);

    const dispatch = React.useCallback((action: any) => {
        switch (action.type) {
            case 'ADD_WORKSPACE':
                addWorkspace(action.payload);
                break;
            case 'DELETE_WORKSPACE':
                deleteWorkspace(action.payload);
                break;
            case 'UPDATE_WORKSPACE':
                updateWorkspace(action.payload.workspaceId, action.payload.workspace);
                break;
            case 'SET_WORKSPACES':
                setWorkspaces(action.payload.workspaces);
                break;
            case 'SET_PAGES':
                setPages(action.payload.workspaceId, action.payload.pages);
                break;
            case 'ADD_PAGE':
                addPage(action.payload.workspaceId, action.payload.page);
                break;
            case 'UPDATE_PAGE':
                updatePage(action.payload.workspaceId, action.payload.pageId, action.payload.page);
                break;
            case 'DELETE_PAGE':
                deletePage(action.payload.workspaceId, action.payload.pageId);
                break;
        }
    }, [
        addWorkspace,
        deleteWorkspace,
        updateWorkspace,
        setWorkspaces,
        setPages,
        addPage,
        updatePage,
        deletePage
    ]);

    return {
        state,
        dispatch,
        workspaceId: activeWorkspaceId,
        pageId: activePageId,
    };
};

interface AppStateProviderProps {
    children: React.ReactNode;
}

const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
    const pathname = usePathname();
    const setActiveWorkspaceId = useAppStore((s) => s.setActiveWorkspaceId);
    const setActivePageId = useAppStore((s) => s.setActivePageId);

    // Sync path segments with Zustand active states
    const workspaceId = useMemo(() => {
        const urlSegments = pathname?.split('/').filter(Boolean);
        if (urlSegments && urlSegments.length > 1) {
            return urlSegments[1];
        }
        return undefined;
    }, [pathname]);

    const pageId = useMemo(() => {
        const urlSegments = pathname?.split('/').filter(Boolean);
        if (urlSegments && urlSegments.length > 2) {
            return urlSegments[2];
        }
        return undefined;
    }, [pathname]);

    useEffect(() => {
        setActiveWorkspaceId(workspaceId);
    }, [workspaceId, setActiveWorkspaceId]);

    useEffect(() => {
        setActivePageId(pageId);
    }, [pageId, setActivePageId]);

    return <>{children}</>;
};

export default AppStateProvider;