'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { Page } from '@/lib/supabase/supabase.types';
import { FileIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

const TrashRestore = () => {
  const { state, workspaceId } = useAppState();
  const [pages, setPages] = useState<Page[] | []>([]);

  useEffect(() => {
    const statePages =
      state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.pages?.filter((page) => page.inTrash) || [];
    setPages(statePages);
  }, [state, workspaceId]);

  return (
    <section className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
          <Trash2 size={18} className="text-muted-foreground" />
          Deleted Pages
        </h3>
        <Badge variant="secondary" className="px-2 py-0.5 text-xs">{pages.length} items</Badge>
      </div>
      
      {!!pages.length ? (
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="flex flex-col gap-2">
            {pages.map((page) => (
              <Link
                key={page.id}
                className="group flex items-center justify-between bg-muted/30 hover:bg-muted/80 rounded-lg p-3 transition-colors border border-transparent hover:border-border/50"
                href={`/dashboard/${page.workspaceId}/${page.id}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-background rounded-md shadow-sm group-hover:scale-105 transition-transform">
                    <FileIcon size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-medium text-foreground truncate">{page.title || 'Untitled'}</span>
                    <span className="text-xs text-muted-foreground truncate">Click to view or restore</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground space-y-4">
          <div className="p-4 bg-muted/50 rounded-full">
            <Trash2 size={32} className="opacity-50" />
          </div>
          <p className="text-sm font-medium">No pages in trash</p>
        </div>
      )}
    </section>
  );
};

export default TrashRestore;
