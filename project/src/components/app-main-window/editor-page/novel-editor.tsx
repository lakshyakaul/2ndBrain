'use client';

import { useAppState } from '@/lib/providers/state-provider';
import { useActiveEditor } from '@/lib/providers/active-editor-provider';
import { Page, workspace } from '@/lib/supabase/supabase.types';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import BannerUpload from '@/components/banner-upload/banner-upload';
import {
  MoreVertical,
  Trash2,
  FilePlus,
  Plus,
  Download,
  XCircleIcon,
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  Quote,
  Code,
  Bold,
  Italic,
  Strikethrough,
} from 'lucide-react';
import { useSocket } from '@/lib/providers/socket-provider';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import GlobalTopbar from '@/components/app-navbar/navbar';
import { createPage } from '@/lib/supabase/queries';
import { v4 } from 'uuid';
import { toast } from 'sonner';
import {
  EditorRoot,
  EditorContent,
  StarterKit,
  Placeholder,
  TiptapLink,
  TiptapImage,
  UpdatedImage,
  TaskList,
  TaskItem,
  HorizontalRule,
  HighlightExtension,
  Command,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorCommandList,
  createSuggestionItems,
  renderItems,
  handleCommandNavigation,
  EditorBubble,
  EditorBubbleItem,
} from 'novel';

const defaultExtensions = [
  StarterKit,
  Placeholder.configure({
    placeholder: 'Start typing here...',
  }),
  TiptapLink.configure({
    HTMLAttributes: {
      class: 'text-primary underline font-medium cursor-pointer',
    },
  }),
  TiptapImage.configure({
    allowBase64: true,
  }),
  UpdatedImage,
  TaskList.configure({
    HTMLAttributes: {
      class: 'not-prose pl-2',
    },
  }),
  TaskItem.configure({
    HTMLAttributes: {
      class: 'flex items-start my-4',
    },
    nested: true,
  }),
  HorizontalRule,
  HighlightExtension,
];

const suggestionItems = createSuggestionItems([
  {
    title: 'Text',
    description: 'Just start typing with plain text.',
    searchTerms: ['p', 'paragraph'],
    icon: <Type size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleNode('paragraph', 'paragraph').run();
    },
  },
  {
    title: 'Heading 1',
    description: 'Big section heading.',
    searchTerms: ['title', 'big', 'large'],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading.',
    searchTerms: ['subtitle', 'medium'],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading.',
    searchTerms: ['subtitle', 'small'],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bulleted list.',
    searchTerms: ['unordered', 'point'],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a list with numbering.',
    searchTerms: ['ordered'],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'Quote',
    description: 'Capture a quote.',
    searchTerms: ['blockquote'],
    icon: <Quote size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode('paragraph', 'paragraph')
        .toggleBlockquote()
        .run();
    },
  },
  {
    title: 'Code',
    description: 'Capture a code snippet.',
    searchTerms: ['codeblock'],
    icon: <Code size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
]);

const customRenderItems = () => {
  const render = renderItems();
  return {
    ...render,
    onStart: (props: any) => {
      document.body.style.overflow = 'hidden';
      return render.onStart(props);
    },
    onExit: () => {
      document.body.style.overflow = 'auto';
      render.onExit();
    },
  };
};

const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: customRenderItems,
  },
});

interface NovelEditorProps {
  dirDetails: workspace | Page;
  fileId: string;
  dirType: 'workspace' | 'page';
}

const NovelEditor: React.FC<NovelEditorProps> = ({
  dirDetails,
  dirType,
  fileId,
}) => {
  const { setEditor } = useActiveEditor();
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

  const [editorContent, setEditorContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<
    { id: string; email: string; avatarUrl: string }[]
  >([]);
  const [deletingBanner, setDeletingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hideTrashBanner, setHideTrashBanner] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

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

  const details = useMemo(() => {
    let selectedDir;
    if (dirType === 'page') {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.pages?.find((page) => page.id === fileId);
    }
    if (dirType === 'workspace') {
      selectedDir = state.workspaces.find(
        (workspace) => workspace.id === fileId
      );
    }

    if (selectedDir) {
      return selectedDir;
    }

    return {
      title: dirDetails.title,
      iconId: (dirDetails as any).iconId,
      createdAt: dirDetails.createdAt,
      novelData: dirDetails.novelData,
      blocknoteData: dirDetails.blocknoteData,
      quillData: dirDetails.quillData,
      inTrash: dirDetails.inTrash,
      bannerUrl: dirDetails.bannerUrl,
    } as workspace | Page;
  }, [state, workspaceId, fileId, dirType, dirDetails]);

  const breadCrumbs = useMemo(() => {
    if (!pathname || !state.workspaces || !workspaceId) return null;
    const segments = pathname
      .split('/')
      .filter((val) => val !== 'dashboard' && val);
    const workspaceDetails = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
    const workspaceBreadCrumb = workspaceDetails ? (
      <Link href={`/dashboard/${workspaceId}`} className="hover:underline">
        {(workspaceDetails as any).iconId} {workspaceDetails.title}
      </Link>
    ) : null;
    if (segments.length === 1) {
      return workspaceBreadCrumb;
    }

    const pageSegment = segments[1];
    let currentPage = workspaceDetails?.pages?.find(
      (page) => page.id === pageSegment
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
  }, [state, pathname, workspaceId]);

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
    const subscription = false; // Placeholder as actual subscription state needs definition
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
      type: 'novel',
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
    const fetchInformation = async () => {
      setLoading(true);
      try {
        if (dirType === 'page') {
          const { data: selectedDir, error } = await getPageDetails(fileId);
          if (error || !selectedDir) {
            return router.replace('/dashboard');
          }

          if (!selectedDir[0]) {
            if (!workspaceId) return;
            return router.replace(`/dashboard/${workspaceId}`);
          }
          
          if (selectedDir[0].novelData) {
            try {
              console.log('DEBUG Raw page data from DB:', selectedDir[0].novelData);
              console.log('DEBUG Parsed editorContent:', JSON.parse(selectedDir[0].novelData));
              setEditorContent(JSON.parse(selectedDir[0].novelData));
            } catch (e) {
              console.log('DEBUG Parser error for page data:', e);
              setEditorContent(undefined);
            }
          }
        }
        if (dirType === 'workspace') {
          const { data: selectedDir, error } = await getWorkspaceDetails(fileId);
          if (error || !selectedDir) {
            return router.replace('/dashboard');
          }
          if (!selectedDir[0]) return;
          if (selectedDir[0].novelData) {
            try {
              console.log('DEBUG Raw workspace data from DB:', selectedDir[0].novelData);
              console.log('DEBUG Parsed editorContent:', JSON.parse(selectedDir[0].novelData));
              setEditorContent(JSON.parse(selectedDir[0].novelData));
            } catch (e) {
              console.log('DEBUG Parser error for workspace data:', e);
              setEditorContent(undefined);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInformation();
  }, [fileId, workspaceId, dirType, router]);

  // Handle document saving
  const handleUpdate = (editor: any) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaving(true);
    
    saveTimerRef.current = setTimeout(async () => {
      try {
        const json = editor.getJSON();
        const contentString = JSON.stringify(json);
        
        if (dirType === 'workspace') {
          dispatch({
            type: 'UPDATE_WORKSPACE',
            payload: {
              workspace: { novelData: contentString },
              workspaceId: fileId,
            },
          });
          await updateWorkspace({ novelData: contentString }, fileId);
        }
        if (dirType === 'page') {
          if (!workspaceId) return;
          dispatch({
            type: 'UPDATE_PAGE',
            payload: {
              page: { novelData: contentString },
              workspaceId,
              pageId: fileId,
            },
          });
          await updatePage({ novelData: contentString }, fileId);
        }
      } catch (err) {
        console.error('Error saving document:', err);
      } finally {
        setSaving(false);
      }
    }, 850);
  };

  // Setup live presence channel
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
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors cursor-not-allowed opacity-60"
                    title="Coming soon"
                    disabled
                  >
                    <Download size={14} />
                    Export
                  </button>
                  <button
                    onClick={addPageHandler}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <FilePlus size={14} />
                    Add sub-page
                  </button>
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
        <div className="flex flex-col w-full max-w-[800px] mx-auto">
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
          <div id="container" className="w-full min-h-[500px] bg-muted/40 dark:bg-muted/10 rounded-2xl px-6 sm:px-8 py-6" style={{ overflow: 'visible' }}>
            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <EditorRoot>
                <EditorContent
                  extensions={[...defaultExtensions, slashCommand]}
                  editorProps={{
                    handleDOMEvents: {
                      keydown: (_view, event) => handleCommandNavigation(event),
                    },
                  }}
                  initialContent={
                    editorContent &&
                    typeof editorContent === 'object' &&
                    'type' in editorContent &&
                    editorContent.type === 'doc'
                      ? editorContent
                      : {
                          type: 'doc',
                          content: [
                            {
                              type: 'paragraph',
                              content: [{ type: 'text', text: 'Start typing here...' }],
                            },
                          ],
                        }
                  }
                    onCreate={({ editor }) => {
                        console.log('[AI Workflow Step 0] Novel Editor onCreate - Binding to active-editor-provider');
                        setEditor(editor);
                    }}
                    onUpdate={({ editor }) => {
                        setEditor(editor);
                        handleUpdate(editor);
                    }}
                  className="border-none bg-transparent outline-none focus:outline-none prosemirror-editor"
                >
                  <EditorBubble
                    tippyOptions={{ placement: 'top' }}
                    className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-border/50 bg-background shadow-xl"
                  >
                    <EditorBubbleItem
                      className="p-2 hover:bg-muted cursor-pointer transition-colors"
                      onSelect={(editor) => editor.chain().focus().toggleBold().run()}
                    >
                      <Bold size={16} />
                    </EditorBubbleItem>
                    <EditorBubbleItem
                      className="p-2 hover:bg-muted cursor-pointer transition-colors"
                      onSelect={(editor) => editor.chain().focus().toggleItalic().run()}
                    >
                      <Italic size={16} />
                    </EditorBubbleItem>
                    <EditorBubbleItem
                      className="p-2 hover:bg-muted cursor-pointer transition-colors"
                      onSelect={(editor) => editor.chain().focus().toggleStrike().run()}
                    >
                      <Strikethrough size={16} />
                    </EditorBubbleItem>
                    <EditorBubbleItem
                      className="p-2 hover:bg-muted cursor-pointer transition-colors"
                      onSelect={(editor) => editor.chain().focus().toggleCode().run()}
                    >
                      <Code size={16} />
                    </EditorBubbleItem>
                  </EditorBubble>
                  <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-border/50 bg-background px-1 py-2 shadow-md transition-all overscroll-contain">
                    <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
                    <EditorCommandList>
                      {suggestionItems.map((item) => (
                        <EditorCommandItem
                          value={item.title}
                          onCommand={(val) => item.command?.(val)}
                          className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent cursor-pointer"
                          key={item.title}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </EditorCommandItem>
                      ))}
                    </EditorCommandList>
                  </EditorCommand>
                </EditorContent>
              </EditorRoot>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NovelEditor;
