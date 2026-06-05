'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import * as Y from 'yjs';
import dynamic from 'next/dynamic';
const BlockNoteEditorComp = dynamic(() => import('./blocknote-editor'), { ssr: false });
import { Page, workspace } from '@/lib/supabase/supabase.types';
import { useActiveEditor } from '@/lib/providers/active-editor-provider';
import { twMerge } from 'tailwind-merge';

// Standardized Controller API for AI Agents & Collaboration
export interface EditorController {
    getDoc: () => Y.Doc | null;
    insertBlock: (afterId: string, blockType: string, content: string) => void;
    updateBlock: (blockId: string, newContent: string) => void;
    deleteBlock: (blockId: string) => void;
    moveBlock: (fromIndex: number, toIndex: number) => void;
}

const EditorControllerContext = createContext<EditorController | null>(null);

export const useActiveEditorController = () => {
    const context = useContext(EditorControllerContext);
    if (!context) {
        throw new Error('useActiveEditorController must be used within an IsolatedEditorFrame');
    }
    return context;
};

interface IsolatedEditorFrameProps {
    dirDetails: workspace | Page;
    fileId: string;
    dirType: 'workspace' | 'page';
}

const IsolatedEditorFrame: React.FC<IsolatedEditorFrameProps> = ({
    dirDetails,
    fileId,
    dirType,
}) => {
    // The Yjs Document & WebSocket Room Sync is now handled directly by blocknote-editor.tsx 
    // using SupabaseProvider.
    useEffect(() => {
        // No-op for now, until we lift the YDoc state to a global context for the sidebar AI
    }, [fileId]);

    const { isAIAgentActive, yDoc } = useActiveEditor();

    // Active Editor Controller implementation
    const controller: EditorController = {
        getDoc: () => yDoc,
        insertBlock: (afterId, blockType, content) => {
            if (!yDoc) return;
            // CRDT transactional block creation
            yDoc.transact(() => {
                const yxml = yDoc.getXmlFragment('document-blocks');
                // Insert new block operation in CRDT XML structure
                console.log(`[AI Agent Action] Insert ${blockType} block after ${afterId}`);
            });
        },
        updateBlock: (blockId, newContent) => {
            if (!yDoc) return;
            yDoc.transact(() => {
                console.log(`[AI Agent Action] Update block ${blockId} with content`);
            });
        },
        deleteBlock: (blockId) => {
            if (!yDoc) return;
            yDoc.transact(() => {
                console.log(`[AI Agent Action] Delete block ${blockId}`);
            });
        },
        moveBlock: (fromIndex, toIndex) => {
            if (!yDoc) return;
            yDoc.transact(() => {
                console.log(`[AI Agent Action] Move block from ${fromIndex} to ${toIndex}`);
            });
        },
    };



    return (
        <EditorControllerContext.Provider value={controller}>
            <div className={twMerge(
                "isolated-editor-frame-container relative w-full h-full border rounded-xl overflow-hidden shadow-inner bg-background/50 backdrop-blur-md transition-all duration-700",
                isAIAgentActive // TEMPORARY: Force animation to run always for editing
                    ? "border-none rounded-none shadow-[0_0_15px] shadow-primary/30 ring-1 ring-primary/30 animate-pulse"
                    : "border-border/10"
            )}>
                <BlockNoteEditorComp
                    dirDetails={dirDetails}
                    fileId={fileId}
                    dirType={dirType}
                />
            </div>
        </EditorControllerContext.Provider>
    );
};

export default IsolatedEditorFrame;
