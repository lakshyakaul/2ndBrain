'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import EmojiPicker from '../global/emoji-picker';
import { updatePage } from '@/lib/supabase/queries';
import { toast } from 'sonner';


interface DropdownProps {
  title: string;
  id: string;
  iconId: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  title,
  id,
  iconId,
}) => {
  const { state, dispatch, workspaceId, pageId } = useAppState();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const pageTitle: string | undefined = useMemo(() => {
    const stateTitle = state.workspaces
      .find((workspace) => workspace.id === workspaceId)
      ?.pages?.find((page) => page.id === id)?.title;
    if (title === stateTitle || !stateTitle) return title;
    return stateTitle;
  }, [state, workspaceId, id, title]);

  const navigatePage = () => {
    router.push(`/dashboard/${workspaceId}/${id}`);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    if (!isEditing) return;
    setIsEditing(false);
    if (!pageTitle) return;
    
    toast.success('Success', {
      description: 'Page title changed.',
    });
    await updatePage({ title: pageTitle }, id);
  };

  const onChangeEmoji = async (selectedEmoji: string) => {
    if (!workspaceId) return;
    dispatch({
      type: 'UPDATE_PAGE',
      payload: {
        workspaceId,
        pageId: id,
        page: { iconId: selectedEmoji },
      },
    });
    const { error } = await updatePage({ iconId: selectedEmoji }, id);
    if (error) {
      toast.error('Error', {
        description: 'Could not update the emoji for this page',
      });
    } else {
      toast.success('Success', {
        description: 'Updated emoji for the page',
      });
    }
  };

  const titleChange = (e: any) => {
    if (!workspaceId) return;
    dispatch({
      type: 'UPDATE_PAGE',
      payload: {
        page: { title: e.target.value },
        pageId: id,
        workspaceId,
      },
    });
  };

  return (
    <div
      onClick={navigatePage}
      className={clsx(
        'group flex justify-between items-center w-full relative px-2 py-1.5 text-sm cursor-pointer rounded-sm hover:bg-muted/50 transition-colors',
        {
          'bg-muted/50': pageId === id,
        }
      )}
    >
      <div
        className="flex 
        gap-2 
        items-center 
        justify-center 
        overflow-hidden"
      >
        <div className="relative">
          <EmojiPicker getValue={onChangeEmoji}>{iconId}</EmojiPicker>
        </div>
        <input
          type="text"
          value={pageTitle}
          className={clsx(
            'outline-none overflow-hidden w-[140px] text-Neutrals/neutrals-7',
            {
              'bg-muted cursor-text': isEditing,
              'bg-transparent cursor-pointer': !isEditing,
            }
          )}
          readOnly={!isEditing}
          onDoubleClick={handleDoubleClick}
          onBlur={handleBlur}
          onChange={titleChange}
        />
      </div>
      <div className="h-full hidden rounded-sm absolute right-2 items-center justify-center gap-2 group-hover:flex">
      </div>
    </div>
  );
};

export default Dropdown;
