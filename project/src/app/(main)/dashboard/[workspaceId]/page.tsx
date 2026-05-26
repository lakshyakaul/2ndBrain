export const dynamic = 'force-dynamic';

import { getWorkspaceDetails } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';
import WorkspaceOverview from '@/components/app-main-window/overview/workspace/workspace-overview';

const Workspace = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
    const { workspaceId } = await params;
    const { data, error } = await getWorkspaceDetails(workspaceId);
    if (error || !data.length) redirect('/dashboard');
    return (
        <div className="relative h-full w-full">
            <WorkspaceOverview workspace={data[0]} />
        </div>
    );
};

export default Workspace;