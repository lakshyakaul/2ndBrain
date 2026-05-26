'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { Page } from '@/lib/supabase/supabase.types';
import { FileIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

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
    <section>
      {!!pages.length && (
        <>
          <h3>Pages</h3>
          {pages.map((page) => (
            <Link
              key={page.id}
              className=" hover:bg-muted rounded-md p-2 flex items-center justify-between"
              href={`/dashboard/${page.workspaceId}/${page.id}`}
            >
              <article>
                <aside className="flex items-center gap-2">
                  <FileIcon />
                  {page.title}
                </aside>
              </article>
            </Link>
          ))}
        </>
      )}
      {!pages.length && (
        <div
          className="
          text-muted-foreground
          absolute
          top-[50%]
          left-[50%]
          transform
          -translate-x-1/2
          -translate-y-1/2
      "
        >
          No Items in trash
        </div>
      )}
    </section>
  );
};

export default TrashRestore;
