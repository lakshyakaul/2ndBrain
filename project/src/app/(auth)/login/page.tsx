"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormSchema } from "@/lib/types";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/global/loader";
import { Separator } from "@/components/ui/separator";
import { actionLoginUser } from "@/lib/server-actions/auth-actions";

const LoginPage = () => {
	const router = useRouter();
	const [submitError, setSubmitError] = useState("");

	const form = useForm<z.infer<typeof FormSchema>>({
		mode: "onChange",
		resolver: zodResolver(FormSchema),
		defaultValues: { email: "", password: "" },
	});

	const isLoading = form.formState.isSubmitting;

	const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (
		formData,
	) => {
		const { error } = await actionLoginUser(formData);
		if (error) {
			form.reset();
			setSubmitError(error.message);
            return;
		}
		router.replace("/dashboard");
	};

	return (
		<form
			onChange={() => {
				if (submitError) setSubmitError("");
			}}
			onSubmit={form.handleSubmit(onSubmit)}
			className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
		>
			<Link
				href="/"
				className="
          w-full
          flex
          justify-left
          items-center"
			>
				<Sparkles className="w-12 h-12 text-primary" />
				<span
					className="font-semibold
                            dark:text-white 
                            text-4xl 
                            first-letter:ml-3"
				>
					Space.
				</span>
			</Link>
			<div
				className="
        text-foreground/60 text-sm"
			>
				An all-In-One Collaboration and Productivity Platform
			</div>

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
			</FieldGroup>

			{submitError && (
				<div className="text-sm font-medium text-destructive">
					{submitError}
				</div>
			)}

			<Button
				type="submit"
				className="w-full p-6"
				size="lg"
				disabled={isLoading}
			>
				{!isLoading ? "Login" : <Loader />}
			</Button>
			<span className="self-container">
				Dont have an account?{" "}
				<Link href="/signup" className="text-primary">
					Sign Up
				</Link>
			</span>
		</form>
	);
};

export default LoginPage;
