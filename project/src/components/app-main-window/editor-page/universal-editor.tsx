'use client';

import React from 'react';
import NovelEditor from './novel-editor';
import dynamic from 'next/dynamic';
const BlockNoteEditorComp = dynamic(() => import('./blocknote-editor'), { ssr: false });
import { Page, workspace } from '@/lib/supabase/supabase.types';

interface UniversalEditorProps {
    dirDetails: workspace | Page;
    fileId: string;
    dirType: 'workspace' | 'page';
}

const UniversalEditor: React.FC<UniversalEditorProps> = ({
    dirDetails,
    fileId,
    dirType,
}) => {
    // Force default to BlockNoteEditorComp everywhere
    return (
        <BlockNoteEditorComp
            dirDetails={dirDetails}
            fileId={fileId}
            dirType={dirType}
        />
    );
};

export default UniversalEditor;
