'use client';
import { AuthUser } from '@supabase/supabase-js';
import React, { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { v4 } from 'uuid';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../../../ui/card';
import EmojiPicker from '../../../global/emoji-picker';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Subscription, Workspace } from '@/lib/supabase/supabase.types';
import { Button } from '../../../ui/button';
import Loader from '../../../global/loader';
import { createWorkspace } from '@/lib/supabase/queries';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/providers/state-provider';
import { createBrowserClient } from '@supabase/ssr';
import { CreateWorkspaceFormSchema } from '@/lib/types';
import { z } from 'zod';

interface DashboardSetupProps {
    user: AuthUser;
    subscription: Subscription | null;
}

const DashboardSetup: React.FC<DashboardSetupProps> = ({
    subscription,
    user,
}) => {
    // sonner toast
    const router = useRouter();
    const { dispatch } = useAppState();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting: isLoading, errors },
    } = useForm<z.infer<typeof CreateWorkspaceFormSchema>>({
        mode: 'onChange',
        defaultValues: {
            workspaceName: '',
        },
    });

    const onSubmit: SubmitHandler<
        z.infer<typeof CreateWorkspaceFormSchema>
    > = async (value) => {
        const workspaceUUID = v4();

        try {
            const newWorkspace: Workspace = {
                novelData: null,
                blocknoteData: null,
                quillData: null,
                createdAt: new Date().toISOString(),
                id: workspaceUUID,
                inTrash: '',
                title: value.workspaceName.trim() || 'Workspace',
                workspaceOwner: user.id,
                bannerUrl: '',
                iconId: '📁',
                logo: null,
            };
            const { data, error: createError } = await createWorkspace(newWorkspace);
            if (createError) {
                throw new Error();
            }
            dispatch({
                type: 'ADD_WORKSPACE',
                payload: { ...newWorkspace, pages: [] },
            });

            toast.success('Workspace Created', {
                description: `${newWorkspace.title} has been created successfully.`,
            });

            router.replace(`/dashboard/${newWorkspace.id}`);
        } catch (error) {
            console.log(error, 'Error');
            toast.error('Could not create your workspace', {
                description:
                    "Oops! Something went wrong, and we couldn't create your workspace. Try again or come back later.",
            });
        } finally {
            reset();
        }
    };

    return (
        <div className="flex items-center justify-center w-full h-full p-4 sm:p-8 bg-background">
            <Card className="w-full max-w-2xl border-border/50 shadow-xl bg-background/50 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-50" />
                <CardHeader className="space-y-3 pb-6 pt-8 text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <span className="text-2xl">🚀</span>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">Create a Workspace</CardTitle>
                    <CardDescription className="text-base">
                        Let's set up a private workspace to get you started. 
                        <br className="hidden sm:block" /> You can add collaborators later from the settings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-6 sm:px-10 pb-10">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="workspaceName" className="text-sm font-semibold">
                                Workspace Name
                            </Label>
                            <Input
                                id="workspaceName"
                                type="text"
                                placeholder="e.g. My Second Brain"
                                disabled={isLoading}
                                className="h-12 text-lg bg-background border-border/50 focus-visible:ring-primary/50 transition-all"
                                {...register('workspaceName')}
                            />
                            {errors?.workspaceName && (
                                <p className="text-sm text-destructive mt-2">
                                    {errors?.workspaceName?.message?.toString()}
                                </p>
                            )}
                        </div>

                        <div className="pt-2">
                            <Button
                                disabled={isLoading}
                                type="submit"
                                className="w-full h-12 text-base font-semibold shadow-md transition-all hover:shadow-lg"
                            >
                                {!isLoading ? 'Create Workspace' : (
                                    <div className="flex items-center gap-2">
                                        <Loader /> Creating...
                                    </div>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardSetup;