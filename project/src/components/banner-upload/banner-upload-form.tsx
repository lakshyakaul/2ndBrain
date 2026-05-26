'use client';
import {
  appWorkspacesType,
  useAppState,
} from '@/lib/providers/state-provider';
import { UploadBannerFormSchema } from '@/lib/types';
import { createBrowserClient } from '@supabase/ssr';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Loader from '../global/loader';
import {
  updatePage,
  updateWorkspace,
} from '@/lib/supabase/queries';
import { toast } from 'sonner';

interface BannerUploadFormProps {
  dirType: 'workspace' | 'page';
  id: string;
}

const BannerUploadForm: React.FC<BannerUploadFormProps> = ({ dirType, id }) => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { state, workspaceId, dispatch } = useAppState();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isUploading, errors },
  } = useForm<z.infer<typeof UploadBannerFormSchema>>({
    mode: 'onChange',
    defaultValues: {
      banner: '',
    },
  });
  const onSubmitHandler: SubmitHandler<
    z.infer<typeof UploadBannerFormSchema>
  > = async (values) => {
    const file = values.banner?.[0];
    if (!file || !id) return;
    try {
      let filePath = null;

      const uploadBanner = async () => {
        const details = dirType === 'page'
          ? state.workspaces.find(w => w.id === workspaceId)?.pages.find(p => p.id === id)
          : state.workspaces.find(w => w.id === id);
        
        if (details?.bannerUrl) {
          await supabase.storage.from('file-banners').remove([details.bannerUrl]);
        }

        const uniqueId = Date.now();
        const { data, error } = await supabase.storage
          .from('file-banners')
          .upload(`banner-${id}-${uniqueId}`, file, { cacheControl: '5', upsert: true });
        if (error) throw new Error();
        filePath = data.path;
      };
      if (dirType === 'page') {
        if (!workspaceId) return;
        await uploadBanner();
        dispatch({
          type: 'UPDATE_PAGE',
          payload: {
            page: { bannerUrl: filePath },
            pageId: id,
            workspaceId,
          },
        });
        await updatePage({ bannerUrl: filePath }, id);
      } else if (dirType === 'workspace') {
        if (!workspaceId) return;
        await uploadBanner();
        dispatch({
          type: 'UPDATE_WORKSPACE',
          payload: {
            workspace: { bannerUrl: filePath },
            workspaceId,
          },
        });
        await updateWorkspace({ bannerUrl: filePath }, id);
      }
      toast.success('Banner uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload banner');
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="flex flex-col gap-4 items-center w-full max-w-[350px] mx-auto overflow-hidden"
    >
      <div className="w-full text-center">
        <Label
          className="text-sm text-muted-foreground block mb-2"
          htmlFor="bannerImage"
        >
          Select a Banner Image
        </Label>
        <Input
          id="bannerImage"
          type="file"
          accept="image/*"
          disabled={isUploading}
          className="w-full cursor-pointer"
          {...register('banner', { required: 'Banner Image is required' })}
        />
      </div>
      {errors.banner && (
        <small className="text-red-600">
          {errors.banner?.message?.toString()}
        </small>
      )}
      <Button
        disabled={isUploading}
        type="submit"
        className="w-full mt-2"
      >
        {!isUploading ? 'Upload Banner' : <Loader />}
      </Button>
    </form>
  );
};

export default BannerUploadForm;
