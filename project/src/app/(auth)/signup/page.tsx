'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';

import Logo from '../../../../public/cypresslogo.svg';
import Loader from '@/components/global/loader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MailCheck } from 'lucide-react';
import { FormSchema } from '@/lib/types';
import { actionSignUpUser } from '@/lib/server-actions/auth-actions';

const SignUpFormSchema = z
    .object({
        email: z.string().describe('Email').email({ message: 'Invalid Email' }),
        password: z
            .string()
            .describe('Password')
            .min(6, 'Password must be minimum 6 characters'),
        confirmPassword: z
            .string()
            .describe('Confirm Password')
            .min(6, 'Password must be minimum 6 characters'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match.",
        path: ['confirmPassword'],
    });

const Signup = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [submitError, setSubmitError] = useState('');
    const [confirmation, setConfirmation] = useState(false);

    const codeExchangeError = useMemo(() => {
        if (!searchParams) return '';
        return searchParams.get('error_description');
    }, [searchParams]);

    const confirmationAndErrorStyles = useMemo(
        () =>
            clsx('bg-primary', {
                'bg-red-500/10': codeExchangeError,
                'border-red-500/50': codeExchangeError,
                'text-red-700': codeExchangeError,
            }),
        [codeExchangeError]
    );

    const form = useForm<z.infer<typeof SignUpFormSchema>>({
        mode: 'onChange',
        resolver: zodResolver(SignUpFormSchema),
        defaultValues: { email: '', password: '', confirmPassword: '' },
    });

    const isLoading = form.formState.isSubmitting;
    const onSubmit = async ({ email, password }: z.infer<typeof SignUpFormSchema>) => {
        const { error } = await actionSignUpUser({ email, password });
        if (error) {
            setSubmitError(error.message);
            form.reset();
            return;
        }
        setConfirmation(true);
    };

    return (
        <form
            onChange={() => {
                if (submitError) setSubmitError('');
            }}
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full sm:justify-center sm:w-[400px]
    space-y-6 flex
    flex-col
    "
        >
            <Link
                href="/"
                className="
      w-full
      flex
      justify-left
      items-center"
            >
                <Image
                    src={Logo}
                    alt="cypress Logo"
                    width={50}
                    height={50}
                />
                <span
                    className="font-semibold
      dark:text-white text-4xl first-letter:ml-2"
                >
                    cypress.
                </span>
            </Link>
            <div
                className="
    text-foreground/60 text-sm"
            >
                An all-In-One Collaboration and Productivity Platform
            </div>
            {!confirmation && !codeExchangeError && (
                <>
                    <FieldGroup>
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        disabled={isLoading}
                                        aria-invalid={fieldState.invalid}
                                        {...field}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        disabled={isLoading}
                                        aria-invalid={fieldState.invalid}
                                        {...field}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="confirmPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Input
                                        type="password"
                                        placeholder="Confirm Password"
                                        disabled={isLoading}
                                        aria-invalid={fieldState.invalid}
                                        {...field}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    <Button
                        type="submit"
                        className="w-full p-6"
                        disabled={isLoading}
                    >
                        {!isLoading ? 'Create Account' : <Loader />}
                    </Button>
                </>
            )}

            {submitError && (
                <div className="text-sm font-medium text-destructive">
                    {submitError}
                </div>
            )}
            <span className="self-container">
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="text-primary"
                >
                    Login
                </Link>
            </span>
            {(confirmation || codeExchangeError) && (
                <>
                    <Alert className={confirmationAndErrorStyles}>
                        {!codeExchangeError && <MailCheck className="h-4 w-4" />}
                        <AlertTitle>
                            {codeExchangeError ? 'Invalid Link' : 'Check your email.'}
                        </AlertTitle>
                        <AlertDescription>
                            {codeExchangeError || 'An email confirmation has been sent.'}
                        </AlertDescription>
                    </Alert>
                </>
            )}
        </form>
    );
};

export default Signup;