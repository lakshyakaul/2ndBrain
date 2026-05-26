'use client';

import { useAppState } from '@/lib/providers/state-provider';
import { Page, workspace } from '@/lib/supabase/supabase.types';
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { Button } from '@/components/ui/button';
import {
  getPageDetails,
  getWorkspaceDetails,
  updatePage,
  updateWorkspace,
  findUser,
} from '@/lib/supabase/queries';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import BannerUpload from '@/components/banner-upload/banner-upload';
import {
  MoreVertical,
  Trash2,
  Plus,
  FilePlus,
  Download,
  Upload,
  XCircleIcon
} from 'lucide-react';
import { useSocket } from '@/lib/providers/socket-provider';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { useActiveEditor } from '@/lib/providers/active-editor-provider';
import GlobalTopbar from '@/components/app-navbar/navbar';
import { createPage } from '@/lib/supabase/queries';
import { v4 } from 'uuid';
import { toast } from 'sonner';

// BlockNote imports
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { en } from "@blocknote/core/locales";
import { 
  useCreateBlockNote, 
  FormattingToolbarController, 
  SuggestionMenuController, 
  getDefaultReactSlashMenuItems,
  getFormattingToolbarItems
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { FormattingToolbar } from "@blocknote/react";

// BlockNote AI imports
import { 
  AIExtension,
  AIMenuController, 
  AIToolbarButton,
  getAISlashMenuItems 
} from "@blocknote/xl-ai";
import { en as aiEn } from "@blocknote/xl-ai/locales";
import { DefaultChatTransport } from "ai";
import { useTheme } from 'next-themes';
import * as Y from 'yjs';
import { SupabaseProvider } from '@supabase-labs/y-supabase';

interface BlockNoteEditorProps {
  dirDetails: workspace | Page;
  fileId: string;
  dirType: 'workspace' | 'page';
}

const BlockNoteEditorComp: React.FC<BlockNoteEditorProps> = ({
  dirDetails,
  dirType,
  fileId,
}) => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { state, workspaceId, dispatch } = useAppState();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { user } = useSupabaseUser();
  const router = useRouter();
  const { socket } = useSocket();
  const pathname = usePathname();
  const { theme } = useTheme();

  const [initialContent, setInitialContent] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<
    { id: string; email: string; avatarUrl: string }[]
  >([]);
  const [deletingBanner, setDeletingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hideTrashBanner, setHideTrashBanner] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const subscription = false;

  // Close options dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setOptionsOpen(false);
      }
    };
    if (optionsOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [optionsOpen]);

  const details =
    dirType === 'workspace'
      ? state.workspaces.find((w) => w.id === fileId) || dirDetails
      : state.workspaces
          .find((w) => w.id === workspaceId)
          ?.pages?.find((p) => p.id === fileId) || dirDetails;

  const breadCrumbs = React.useMemo(() => {
    if (!pathname || !state.workspaces || !workspaceId) return;
    const workspaceDetails = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
    if (!workspaceDetails) return;

    const workspaceBreadCrumb = (
      <Link href={`/dashboard/${workspaceId}`} className="hover:underline flex items-center gap-2">
        <span className="text-muted-foreground">{workspaceDetails.iconId}</span>
        <span className="truncate max-w-[150px]">{workspaceDetails.title}</span>
      </Link>
    );

    if (dirType === 'workspace') {
      return (
        <div className="flex items-center text-sm font-medium">
          {workspaceBreadCrumb}
        </div>
      );
    }

    let currentPage = workspaceDetails.pages?.find(
      (page) => page.id === fileId
    );
    const ancestors = [];
    while (currentPage) {
      ancestors.unshift(currentPage);
      if (currentPage.parentId) {
        currentPage = workspaceDetails?.pages?.find(
          (page) => page.id === currentPage!.parentId
        );
      } else {
        currentPage = undefined;
      }
    }

    const pageBreadCrumbs = [];
    if (ancestors.length > 2) {
      pageBreadCrumbs.push(
        <span key="ellipsis" className="text-muted-foreground mx-1">
          / ...
        </span>
      );
      const lastTwo = ancestors.slice(-2);
      lastTwo.forEach((page) => {
        pageBreadCrumbs.push(
          <React.Fragment key={page.id}>
            <span className="mx-1">/</span>
            <Link href={`/dashboard/${workspaceId}/${page.id}`} className="hover:underline truncate max-w-[150px]">
              {(page as any).iconId} {page.title}
            </Link>
          </React.Fragment>
        );
      });
    } else {
      ancestors.forEach((page) => {
        pageBreadCrumbs.push(
          <React.Fragment key={page.id}>
            <span className="mx-1">/</span>
            <Link href={`/dashboard/${workspaceId}/${page.id}`} className="hover:underline truncate max-w-[150px]">
              {(page as any).iconId} {page.title}
            </Link>
          </React.Fragment>
        );
      });
    }

    return (
      <div className="flex items-center text-sm font-medium">
        {workspaceBreadCrumb}
        {pageBreadCrumbs}
      </div>
    );
  }, [state, pathname, workspaceId, dirType, fileId]);

  const restoreFileHandler = async () => {
    if (dirType === 'page') {
      if (!workspaceId) return;
      dispatch({
        type: 'UPDATE_PAGE',
        payload: { page: { inTrash: '' }, pageId: fileId, workspaceId },
      });
      await updatePage({ inTrash: '' }, fileId);
    }
    if (dirType === 'workspace') {
      if (!workspaceId) return;
      dispatch({
        type: 'UPDATE_WORKSPACE',
        payload: { workspace: { inTrash: '' }, workspaceId },
      });
      await updateWorkspace({ inTrash: '' }, workspaceId);
    }
  };

  const deleteFileHandler = async () => {
    setOptionsOpen(false);
    if (dirType === 'page') {
      if (!workspaceId || !user?.email) return;
      dispatch({
        type: 'UPDATE_PAGE',
        payload: {
          page: { inTrash: `Deleted by ${user.email}` },
          pageId: fileId,
          workspaceId,
        },
      });
      await updatePage({ inTrash: `Deleted by ${user.email}` }, fileId);
    }
  };

  const deleteBanner = async () => {
    if (!fileId) return;
    setDeletingBanner(true);
    const response = await supabase.storage
      .from('file-banners')
      .remove([`banner-${fileId}`]);
    if (!response.error) {
      await updatePage({ bannerUrl: '' }, fileId);
    }
    setDeletingBanner(false);
  };

  const addPageHandler = async () => {
    if (!workspaceId) return;
    const pages = state.workspaces.find((w) => w.id === workspaceId)?.pages || [];
    if (pages.length >= 3 && !subscription) {
      toast.error('Subscription Required', { description: 'You have reached the limit of free pages.' });
      return;
    }
    const newPage: Page = {
      novelData: null,
      blocknoteData: null,
      quillData: null,
      id: v4(),
      createdAt: new Date().toISOString(),
      title: 'Untitled',
      iconId: '📄',
      inTrash: null,
      workspaceId,
      bannerUrl: '',
      type: 'blocknote',
      parentId: fileId || null,
    };
    const { error } = await createPage(newPage);
    if (error) {
      toast.error('Error', { description: 'Could not create the sub-page' });
    } else {
      dispatch({ type: 'ADD_PAGE', payload: { workspaceId, page: newPage } });
      toast.success('Success', { description: 'Created sub-page.' });
      router.push(`/dashboard/${workspaceId}/${newPage.id}`);
    }
    setOptionsOpen(false);
  };

  const exportMarkdown = async () => {
    if (!editor) return;
    const markdown = await editor.blocksToMarkdownLossy(editor.document);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${details.title || 'document'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setOptionsOpen(false);
  };

  const exportHTML = async () => {
    if (!editor) return;
    const html = await editor.blocksToHTMLLossy(editor.document);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${details.title || 'document'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setOptionsOpen(false);
  };

  const importMarkdown = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (text) {
        let blocks = [];
        if (file.name.endsWith('.html')) {
          blocks = await editor.tryParseHTMLToBlocks(text);
        } else {
          blocks = await editor.tryParseMarkdownToBlocks(text);
        }
        editor.replaceBlocks(editor.document, blocks);
        toast.success('Success', { description: 'Imported document.' });
      }
    };
    reader.readAsText(file);
    setOptionsOpen(false);
  };

  const titleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!fileId) return;
    if (dirType === 'workspace') {
      dispatch({
        type: 'UPDATE_WORKSPACE',
        payload: { workspace: { title: e.target.value }, workspaceId: fileId },
      });
    }
    if (dirType === 'page') {
      if (!workspaceId) return;
      dispatch({
        type: 'UPDATE_PAGE',
        payload: {
          page: { title: e.target.value },
          workspaceId,
          pageId: fileId,
        },
      });
    }
  };

  const titleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (!fileId) return;
    if (dirType === 'workspace') {
      await updateWorkspace({ title }, fileId);
    }
    if (dirType === 'page') {
      await updatePage({ title }, fileId);
    }
  };

  // Fetch initial document details
  useEffect(() => {
    if (!fileId) return;
    let isMounted = true;
    const fetchInformation = async () => {
      setLoading(true);
      try {
        if (dirType === 'page') {
          const { data: selectedDir, error } = await getPageDetails(fileId);
          if (error || !selectedDir || !selectedDir[0]) {
            if (isMounted) router.replace('/dashboard');
            return;
          }
          if (selectedDir[0].blocknoteData) {
            try {
              setInitialContent(JSON.parse(selectedDir[0].blocknoteData));
            } catch (e) {
              setInitialContent(undefined);
            }
          }
        }
        if (dirType === 'workspace') {
          const { data: selectedDir, error } = await getWorkspaceDetails(fileId);
          if (error || !selectedDir || !selectedDir[0]) {
            if (isMounted) router.replace('/dashboard');
            return;
          }
          if (selectedDir[0].blocknoteData) {
            try {
              setInitialContent(JSON.parse(selectedDir[0].blocknoteData));
            } catch (e) {
              setInitialContent(undefined);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchInformation();
    return () => {
      isMounted = false;
    };
  }, [fileId, dirType, router]);

  // Setup live presence channel (currently using Supabase channel for avatars)
  useEffect(() => {
    if (!fileId) return;
    const room = supabase.channel(`presence-${fileId}`);
    const subscription = room
      .on('presence', { event: 'sync' }, () => {
        const newState = room.presenceState();
        const newCollaborators = Object.values(newState).flat() as any;
        setCollaborators(newCollaborators);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED' || !user) return;
        const response = await findUser(user.id);
        if (!response) return;

        room.track({
          id: user.id,
          email: user.email?.split('@')[0],
          avatarUrl: response.avatarUrl
            ? supabase.storage.from('avatars').getPublicUrl(response.avatarUrl)
                .data.publicUrl
            : '',
        });
      });
    return () => {
      supabase.removeChannel(room);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [fileId, supabase, user]);

  // Yjs Collaboration State (Synchronous initialization)
  const { doc, provider } = useMemo(() => {
    if (typeof window === 'undefined') return { doc: undefined, provider: undefined };
    const yDoc = new Y.Doc();
    const yProvider = new SupabaseProvider(`blocknote-${fileId}`, yDoc, supabase, {
      awareness: true,
    });
    
    // BlockNote expects the provider to have a public `awareness` property.
    // SupabaseProvider uses a private property and a getter, so we explicitly expose it.
    (yProvider as any).awareness = yProvider.getAwareness();

    return { doc: yDoc, provider: yProvider as any };
  }, [fileId, supabase]);

  useEffect(() => {
    return () => {
      doc?.destroy();
      provider?.destroy();
    };
  }, [doc, provider]);

  // Initialize BlockNote
  const editor = useCreateBlockNote({
    initialContent,
    dictionary: {
      ...en,
      ai: aiEn,
    },
    collaboration: doc && provider ? {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: user?.email?.split('@')[0] || 'Anonymous',
        color: '#3b82f6',
      },
    } : undefined,
    extensions: [
      AIExtension({
        transport: new DefaultChatTransport({
          api: '/api/ai/chat', // Call Vercel AI route
        }),
      }),
    ],
  });

  const { setYDoc, setYProvider, setEditor } = useActiveEditor();

  useEffect(() => {
    setYDoc(doc || null);
    setYProvider(provider || null);
    setEditor(editor || null);
    return () => {
      setYDoc(null);
      setYProvider(null);
      setEditor(null);
    };
  }, [doc, provider, editor, setYDoc, setYProvider, setEditor]);

  useEffect(() => {
    if (!editor || !initialContent || typeof initialContent !== 'string') return;
    try {
      const parsed = JSON.parse(initialContent);
      if (parsed && parsed.length > 0 && editor.document.length === 1 && !editor.document[0].content) {
        editor.replaceBlocks(editor.document, parsed);
      }
    } catch (e) {
      console.error("Failed to parse initial content", e);
    }
  }, [editor, initialContent]);

  useEffect(() => {
    if (!doc || !editor) return;
    
    const handleDocUpdate = () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);
      
      saveTimerRef.current = setTimeout(async () => {
        try {
          const jsonBlocks = editor.document;
          const contentString = JSON.stringify(jsonBlocks);
          
          if (dirType === 'workspace') {
            dispatch({
              type: 'UPDATE_WORKSPACE',
              payload: {
                workspace: { blocknoteData: contentString },
                workspaceId: fileId,
              },
            });
            await updateWorkspace({ blocknoteData: contentString }, fileId);
          }
          if (dirType === 'page') {
            if (!workspaceId) return;
            dispatch({
              type: 'UPDATE_PAGE',
              payload: {
                page: { blocknoteData: contentString },
                workspaceId,
                pageId: fileId,
              },
            });
            await updatePage({ blocknoteData: contentString }, fileId);
          }
        } catch (error) {
          console.error("Failed to save doc", error);
        }
        setSaving(false);
      }, 1000);
    };

    doc.on('update', handleDocUpdate);
    return () => doc.off('update', handleDocUpdate);
  }, [doc, editor, fileId, dirType, workspaceId, dispatch]);

  return (
    <div className="flex flex-col w-full min-h-full bg-background">
      {/* Main Container Area */}
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-8 py-6">
        
        {/* Main Container Header: Breadcrumbs & Options Menu */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-8">
          <div className="flex items-center text-sm font-medium text-muted-foreground">
            {breadCrumbs}
          </div>

          <div className="flex items-center gap-4">
            {/* Saved Indicator */}
            {saving ? (
              <Badge
                variant="secondary"
                className="bg-orange-700 text-white animate-pulse text-[10px]"
              >
                Saving...
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-emerald-700 text-white text-[10px]"
              >
                Saved
              </Badge>
            )}

            {/* Collaborator Avatars */}
            <div className="flex items-center -space-x-2">
              {collaborators.map((collaborator, idx) => (
                <TooltipProvider key={collaborator.id + idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 border-2 border-background shadow-sm transition-transform hover:scale-110 hover:z-10 cursor-pointer">
                        <AvatarImage src={collaborator.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {collaborator.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {collaborator.email}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* 3-dot Options Menu on the right */}
            <div className="relative" ref={optionsRef}>
              <button
                onClick={() => setOptionsOpen((v) => !v)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Options"
              >
                <MoreVertical size={18} />
              </button>
              {optionsOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-popover border border-border rounded-md shadow-lg z-50 py-1 overflow-hidden">
                  <button
                    onClick={deleteFileHandler}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete page
                  </button>
                  <button
                    onClick={addPageHandler}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <FilePlus size={14} />
                    Add sub-page
                  </button>
                  <button
                    onClick={exportMarkdown}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Download size={14} />
                    Export Markdown
                  </button>
                  <button
                    onClick={exportHTML}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Download size={14} />
                    Export HTML
                  </button>
                  <label className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer">
                    <Upload size={14} />
                    Import (.md / .html)
                    <input type="file" accept=".md,.html" className="hidden" onChange={importMarkdown} />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trash banner */}
        {details.inTrash && !hideTrashBanner && (
          <article className="py-2 mb-6 bg-red-600/90 text-white flex items-center justify-center gap-4 rounded-lg relative px-4 text-sm font-medium">
            <span>This {dirType} is in the trash.</span>
            <Button size="sm" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-red-600" onClick={restoreFileHandler}>
              Restore
            </Button>
            <Button size="sm" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-red-600" onClick={deleteFileHandler}>
              Delete
            </Button>
          </article>
        )}

        {/* Banner image if present */}
        {details.bannerUrl && (
          <div className="relative w-full h-[200px] rounded-xl overflow-hidden mb-6">
            <Image
              src={supabase.storage.from('file-banners').getPublicUrl(details.bannerUrl).data.publicUrl}
              fill
              className="object-cover"
              alt="Banner Image"
            />
          </div>
        )}

        {/* Dynamic Title and Editor Canvas centered */}
        <div className="flex flex-col w-full mx-auto">
          <input
            type="text"
            value={details.title || ''}
            onChange={titleChange}
            onBlur={titleBlur}
            className="text-foreground text-4xl font-extrabold outline-none bg-transparent mb-4 tracking-tight"
            placeholder="Untitled"
          />
          <div className="flex items-center gap-3 mb-8">
            <BannerUpload
              id={fileId}
              dirType={dirType}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted border border-border/50 transition-all"
            >
              {details.bannerUrl ? 'Change Banner' : '+ Add Banner'}
            </BannerUpload>
            {details.bannerUrl && (
              <Button
                disabled={deletingBanner}
                onClick={deleteBanner}
                variant="ghost"
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-all h-auto gap-1"
              >
                <XCircleIcon size={12} />
                Remove
              </Button>
            )}
          </div>

          {/* Universal Editor Canvas centered */}
          <div id="container" className="w-full min-h-[500px]" style={{ overflow: 'visible' }}>
            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <BlockNoteView 
                editor={editor} 
                theme={theme === 'dark' ? 'dark' : 'light'}
                formattingToolbar={false}
                slashMenu={false}
                className="w-full h-full min-h-[400px]"
              >
                <AIMenuController />
                <FormattingToolbarController 
                  formattingToolbar={() => (
                    <FormattingToolbar>
                      {getFormattingToolbarItems()}
                      <AIToolbarButton key={"aiToolbarButton"} />
                    </FormattingToolbar>
                  )} 
                />
                <SuggestionMenuController 
                  triggerCharacter="/" 
                  getItems={async (query) => 
                    [
                      ...getDefaultReactSlashMenuItems(editor),
                      ...getAISlashMenuItems(editor)
                    ].filter(i => i.title.toLowerCase().includes(query.toLowerCase()))
                  } 
                />
              </BlockNoteView>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BlockNoteEditorComp;
