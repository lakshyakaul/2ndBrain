export const dynamic = 'force-dynamic';

import React from 'react';
import IsolatedEditorFrame from '@/components/app-main-window/editor-page/isolated-editor-frame';
import { getPageDetails } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';

const PageComponent = async ({ params }: { params: Promise<{ pageId: string }> }) => {
  const { pageId } = await params;
  const { data, error } = await getPageDetails(pageId);
  if (error || !data.length) redirect('/dashboard');

  return (
    <div className="relative">
      <IsolatedEditorFrame
        fileId={pageId}
        dirType="page"
        dirDetails={data[0] || {}}
      />
    </div>
  );
};

export default PageComponent;
