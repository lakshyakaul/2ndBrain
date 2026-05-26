'use client';

import React, { useEffect, useState } from 'react';
import { getPages, updatePage } from '@/lib/supabase/queries';
import { Page } from '@/lib/supabase/supabase.types';
import { File, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import clsx from 'clsx';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface TreeViewProps {
  workspaceId: string;
}

const TreeNode: React.FC<{
  node: Page;
  pages: Page[];
  level: number;
  onDropNode: (draggedId: string, targetId: string | null) => void;
}> = ({ node, pages, level, onDropNode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const children = pages.filter((p) => p.parentId === node.id);
  const hasChildren = children.length > 0;

  return (
    <div className="flex flex-col w-full">
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('pageId', node.id);
          e.stopPropagation();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
          const draggedId = e.dataTransfer.getData('pageId');
          if (draggedId && draggedId !== node.id) {
            onDropNode(draggedId, node.id);
          }
        }}
        className={clsx(
          "flex items-center py-1 px-2 rounded-md transition-colors group cursor-pointer text-sm",
          isDragOver ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-muted/50"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <div 
          className="flex items-center justify-center w-5 h-5 shrink-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <span className="w-4 h-4" />
          )}
        </div>
        <Link 
          href={`/dashboard/${node.workspaceId}/${node.id}`}
          className="flex items-center gap-2 overflow-hidden flex-1"
        >
          {hasChildren ? (
            <Folder className="h-4 w-4 text-blue-500 shrink-0" />
          ) : (
            <File className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span className="truncate group-hover:text-foreground text-muted-foreground transition-colors font-medium">
            {node.title}
          </span>
        </Link>
      </div>

      {isExpanded && hasChildren && (
        <div className="flex flex-col w-full">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              pages={pages}
              level={level + 1}
              onDropNode={onDropNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView: React.FC<TreeViewProps> = ({ workspaceId }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPages = async () => {
      setIsLoading(true);
      const { data, error } = await getPages(workspaceId);
      if (!error && data) {
        setPages(data);
      }
      setIsLoading(false);
    };

    fetchPages();
  }, [workspaceId]);

  const handleDropNode = async (draggedId: string, targetId: string | null) => {
    let current = targetId;
    while (current) {
      if (current === draggedId) {
        toast.error('Cannot move a page inside its own child.');
        return; 
      }
      const parent = pages.find((p) => p.id === current)?.parentId;
      current = parent || null;
    }

    const previousPages = [...pages];
    setPages((prev) =>
      prev.map((p) => (p.id === draggedId ? { ...p, parentId: targetId } : p))
    );

    const { error } = await updatePage({ parentId: targetId }, draggedId);
    if (error) {
      toast.error('Failed to move page.');
      setPages(previousPages);
    } else {
      toast.success('Page moved successfully.');
      router.refresh();
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center text-sm text-muted-foreground">
        Loading pages...
      </div>
    );
  }

  const rootPages = pages.filter((p) => !p.parentId);

  if (pages.length === 0) {
    return (
      <div className="flex w-full h-full items-center justify-center text-sm text-muted-foreground italic bg-muted/10 rounded-md border-2 border-dashed">
        No pages in this workspace yet.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full py-2">
      <div 
        className="flex flex-col gap-1 w-full min-h-[200px] pb-4"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const draggedId = e.dataTransfer.getData('pageId');
          if (draggedId) {
            const isAlreadyRoot = pages.find((p) => p.id === draggedId)?.parentId === null;
            if (!isAlreadyRoot) {
              handleDropNode(draggedId, null);
            }
          }
        }}
      >
        {rootPages.map((page) => (
          <TreeNode key={page.id} node={page} pages={pages} level={0} onDropNode={handleDropNode} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default TreeView;
