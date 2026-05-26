'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { Page, workspace } from '@/lib/supabase/supabase.types';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import 'quill/dist/quill.bubble.css';
import { Button } from '@/components/ui/button';
import {
  deletePage,
  findUser,
  getPageDetails,
  getWorkspaceDetails,
  updatePage,
  updateWorkspace,
} from '@/lib/supabase/queries';
import { usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  PanelLeft,
  PanelRight,
  Trash2,
  Download,
  XCircleIcon,
} from 'lucide-react';
import { useSocket } from '@/lib/providers/socket-provider';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { useSidebarToggle } from '@/lib/providers/sidebar-toggle-provider';
import { useRightSidebarToggle } from '@/lib/providers/right-sidebar-toggle-provider';
import ModeToggle from '@/components/app-navbar/theme/mode-toggle';
import GlobalTopbar from '@/components/app-navbar/navbar';

interface QuillEditorProps {
  dirDetails: workspace | Page;
  fileId: string;
  dirType: 'workspace' | 'page';
}
var TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ['clean'],
];

const QuillEditor: React.FC<QuillEditorProps> = ({
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
  const { socket, isConnected } = useSocket();
  const pathname = usePathname();
  const [quill, setQuill] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<
    { id: string; email: string; avatarUrl: string }[]
  >([]);
  const [deletingBanner, setDeletingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localCursors, setLocalCursors] = useState<any>([]);
  const [hideTrashBanner, setHideTrashBanner] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  const { sidebarOpen, setSidebarOpen } = useSidebarToggle();
  const { rightSidebarOpen, setRightSidebarOpen } = useRightSidebarToggle();

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

  const wrapperRef = useCallback((wrapper: HTMLDivElement | null) => {
    if (typeof window === 'undefined' || wrapper === null) return;
    wrapper.innerHTML = '';
    const editor = document.createElement('div');
    wrapper.append(editor);
    void (async () => {
      const Quill = (await import('quill')).default;
      const QuillCursors = (await import('quill-cursors')).default;
      Quill.register('modules/cursors', QuillCursors);
      const q = new Quill(editor, {
        theme: 'bubble',
        bounds: '#container',
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          cursors: {
            transformOnTextChange: true,
          },
        },
      });
      setQuill(q);
    })();
  }, []);

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
    if (dirType === 'page') {
      if (!workspaceId) return;
      dispatch({
        type: 'UPDATE_PAGE',
        payload: { page: { bannerUrl: '' }, pageId: fileId, workspaceId },
      });
      if (details.bannerUrl) {
        await supabase.storage.from('file-banners').remove([details.bannerUrl]);
      }
      await updatePage({ bannerUrl: '' }, fileId);
    }
    if (dirType === 'workspace') {
      dispatch({
        type: 'UPDATE_WORKSPACE',
        payload: {
          workspace: { bannerUrl: '' },
          workspaceId: fileId,
        },
      });
      if (details.bannerUrl) {
        await supabase.storage.from('file-banners').remove([details.bannerUrl]);
      }
      await updateWorkspace({ bannerUrl: '' }, fileId);
    }
    setDeletingBanner(false);
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

  useEffect(() => {
    if (!fileId) return;
    let selectedDir;
    const fetchInformation = async () => {
      if (dirType === 'page') {
        const { data: selectedDir, error } = await getPageDetails(fileId);
        if (error || !selectedDir) {
          return router.replace('/dashboard');
        }

        if (!selectedDir[0]) {
          if (!workspaceId) return;
          return router.replace(`/dashboard/${workspaceId}`);
        }
        if (quill === null) return;
        if (!selectedDir[0].quillData) return;
        quill.setContents(JSON.parse(selectedDir[0].quillData || ''));
        dispatch({
          type: 'UPDATE_PAGE',
          payload: {
            pageId: fileId,
            page: { quillData: selectedDir[0].quillData },
            workspaceId: selectedDir[0].workspaceId,
          },
        });
      }
      if (dirType === 'workspace') {
        const { data: selectedDir, error } = await getWorkspaceDetails(fileId);
        if (error || !selectedDir) {
          return router.replace('/dashboard');
        }
        if (!selectedDir[0] || quill === null) return;
        if (!selectedDir[0].quillData) return;
        quill.setContents(JSON.parse(selectedDir[0].quillData || ''));
        dispatch({
          type: 'UPDATE_WORKSPACE',
          payload: {
            workspace: { quillData: selectedDir[0].quillData },
            workspaceId: fileId,
          },
        });
      }
    };
    fetchInformation();
  }, [fileId, workspaceId, quill, dirType]);

  useEffect(() => {
    if (quill === null || socket === null || !fileId || !localCursors.length)
      return;
    const socketHandler = (range: any, roomId: string, cursorId: string) => {
      if (roomId === fileId) {
        const cursorToMove = localCursors.find(
          (c: any) => c.cursors()?.[0].id === cursorId
        );
        if (cursorToMove) {
          cursorToMove.moveCursor(cursorId, range);
        }
      }
    };
    socket.on('receive-cursor-move', socketHandler);
    return () => {
      socket.off('receive-cursor-move', socketHandler);
    };
  }, [quill, socket, fileId, localCursors]);

  // rooms
  useEffect(() => {
    if (socket === null || quill === null || !fileId) return;
    socket.emit('create-room', fileId);
  }, [socket, quill, fileId]);

  // Send quill changes to all clients
  useEffect(() => {
    if (quill === null || socket === null || !fileId || !user) return;

    const selectionChangeHandler = (cursorId: string) => {
      return (range: any, oldRange: any, source: any) => {
        if (source === 'user' && cursorId) {
          socket.emit('send-cursor-move', range, fileId, cursorId);
        }
      };
    };
    const quillHandler = (delta: any, oldDelta: any, source: any) => {
      if (source !== 'user') return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);
      const contents = quill.getContents();
      const quillLength = quill.getLength();
      saveTimerRef.current = setTimeout(async () => {
        try {
          if (fileId && quill) {
            const contents = quill.getContents();
            if (dirType == 'workspace') {
              dispatch({
                type: 'UPDATE_WORKSPACE',
                payload: {
                  workspace: { quillData: JSON.stringify(contents) },
                  workspaceId: fileId,
                },
              });
              await updateWorkspace({ quillData: JSON.stringify(contents) }, fileId);
            }
            if (dirType == 'page') {
              if (!workspaceId) return;
              dispatch({
                type: 'UPDATE_PAGE',
                payload: {
                  page: { quillData: JSON.stringify(contents) },
                  workspaceId,
                  pageId: fileId,
                },
              });
              await updatePage({ quillData: JSON.stringify(contents) }, fileId);
            }
          }
        } finally {
          setSaving(false);
        }
      }, 850);
      socket.emit('send-changes', delta, fileId);
    };
    quill.on('text-change', quillHandler);
    quill.on('selection-change', selectionChangeHandler(user.id));

    return () => {
      quill.off('text-change', quillHandler);
      quill.off('selection-change', selectionChangeHandler);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [quill, socket, fileId, user, details, workspaceId, dispatch]);

  useEffect(() => {
    if (quill === null || socket === null) return;
    const socketHandler = (deltas: any, id: string) => {
      if (id === fileId) {
        quill.updateContents(deltas);
      }
    };
    socket.on('receive-changes', socketHandler);
    return () => {
      socket.off('receive-changes', socketHandler);
    };
  }, [quill, socket, fileId]);

  useEffect(() => {
    if (!fileId || quill === null) return;
    const room = supabase.channel(fileId);
    const subscription = room
      .on('presence', { event: 'sync' }, () => {
        const newState = room.presenceState();
        const newCollaborators = Object.values(newState).flat() as any;
        setCollaborators(newCollaborators);
        if (user) {
          const allCursors: any = [];
          newCollaborators.forEach(
            (collaborator: { id: string; email: string; avatar: string }) => {
              if (collaborator.id !== user.id) {
                const userCursor = quill.getModule('cursors');
                userCursor.createCursor(
                  collaborator.id,
                  collaborator.email.split('@')[0],
                  `#${Math.random().toString(16).slice(2, 8)}`
                );
                allCursors.push(userCursor);
              }
            }
          );
          setLocalCursors(allCursors);
        }
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
    };
  }, [fileId, quill, supabase, user]);

  return (
    <>
      {/* Trash banner */}
      <div className="relative">
        {details.inTrash && !hideTrashBanner && (
          <article
            className="py-2 
          z-40 
          bg-[#EB5757] 
          flex  
          md:flex-row 
          flex-col 
          justify-center 
          items-center 
          gap-4 
          relative
          flex-wrap"
          >
            <button
              onClick={() => setHideTrashBanner(true)}
              className="absolute top-2 right-4 text-white hover:opacity-70 transition-opacity"
            >
              <XCircleIcon size={20} />
            </button>
            <div
              className="flex 
            flex-col 
            md:flex-row 
            gap-2 
            justify-center 
            items-center"
            >
              <span className="text-white">
                This {dirType} is in the trash.
              </span>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent
                border-white
                text-white
                hover:bg-white
                hover:text-[#EB5757]
                "
                onClick={restoreFileHandler}
              >
                Restore
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="bg-transparent
                border-white
                text-white
                hover:bg-white
                hover:text-[#EB5757]
                "
                onClick={deleteFileHandler}
              >
                Delete
              </Button>
            </div>
            <span className="text-sm text-white">{details.inTrash}</span>
          </article>
        )}

        {/* Main Container Header: Breadcrumbs & Options Menu */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-8">
          <div className="flex items-center text-sm font-medium text-muted-foreground">
            {breadCrumbs}
          </div>

          <div className="flex items-center gap-4">
            {/* Collaborator avatars */}
            <div className="flex items-center justify-center h-10 -space-x-3">
              {collaborators?.map((collaborator) => (
                <TooltipProvider key={collaborator.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar
                        className="
                  bg-background 
                  border-2 
                  flex 
                  items-center 
                  justify-center 
                  border-white 
                  h-8 
                  w-8 
                  rounded-full
                  "
                      >
                        <AvatarImage
                          src={
                            collaborator.avatarUrl ? collaborator.avatarUrl : ''
                          }
                          className="rounded-full"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {collaborator.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{collaborator.email}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* Saved indicator */}
            {saving ? (
              <Badge variant="secondary" className="bg-orange-700 text-white z-50">
                Saving...
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-emerald-700 text-white z-50">
                Saved
              </Badge>
            )}

            {/* 3-dot Options Menu on the right */}
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Options"
                  >
                    <MoreVertical size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 bg-popover border border-border shadow-lg"
                >
                  <DropdownMenuItem asChild>
                    <button
                      onClick={deleteFileHandler}
                      className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-destructive hover:bg-muted transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete page
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button
                      className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors cursor-not-allowed opacity-60"
                      title="Coming soon"
                      disabled
                    >
                      <Download size={14} />
                      Export
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Banner — fades to transparent at the bottom via CSS mask (opacity approach) */}
      {details.bannerUrl && (
        <div
          className="relative w-full h-[200px] z-0"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
          }}
        >
          <Image
            src={
              supabase.storage
                .from('file-banners')
                .getPublicUrl(details.bannerUrl).data.publicUrl
            }
            fill
            className="w-full object-cover"
            alt="Banner Image"
          />
        </div>
      )}

      {/* Page content area
           - With banner: title straddles the banner bottom edge (~half-height of title inside banner)
             title is ~36px, so we pull up by (banner_action_row_removed + ~18px) = push content up significantly.
             The banner upload buttons are now overlaid on the banner itself.
             We pull up by 26px — puts ~half of the 36px title inside the banner gradient zone.
           - Without banner: small top padding 
      */}
      <div
        className="flex 
        justify-center
        items-center
        flex-col
        relative
        z-10
      "
        style={{ marginTop: details.bannerUrl ? '-26px' : '8px' }}
      >
        <div
          className="w-full 
        self-center 
        max-w-[800px] 
        flex 
        flex-col
         px-7 
         lg:my-8"
        >
          <input
            type="text"
            value={details.title || ''}
            onChange={titleChange}
            onBlur={titleBlur}
            className="text-foreground text-3xl font-bold h-9 outline-none bg-transparent mb-3"
          />
          {/* Add Banner / icon buttons — always after the title */}
          <div className="flex items-center gap-3 mt-1">
            <BannerUpload
              id={fileId}
              dirType={dirType}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-all"
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
        </div>
        {/* Quill editor container — overflow-visible so bubble tooltip isn't clipped */}
        <div
          id="container"
          className="max-w-[800px] w-full min-h-[500px] flex-grow"
          style={{ overflow: 'visible' }}
          ref={wrapperRef}
        ></div>
      </div>
    </>
  );
};

export default QuillEditor;
