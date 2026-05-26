"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const routes = [
	{ title: "Features", href: "#features" },
	{ title: "Testimonials", href: "#testimonials" },
	{ title: "Pricing", href: "#pricing" },
];

const Header = () => {
	const [scrolled, setScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 10) {
				setScrolled(true);
			} else {
				setScrolled(false);
			}
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={cn(
				"fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 flex items-center justify-between border-b",
				scrolled
					? "bg-background/80 dark:bg-background/40 backdrop-blur-xl border-border/40 shadow-sm"
					: "bg-transparent border-transparent"
			)}
		>
			{/* Logo Section */}
			<Link
				href={"/"}
				className="flex items-center gap-2.5 group relative"
			>

				<span className="relative font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-primary-blue to-brand-primary-purple w-[120px]">
					Space.
				</span>
			</Link>

			{/* Desktop Navigation */}
			<nav className="hidden md:flex items-center gap-20  border border-black/20 dark:border-border/30 px-4 py-1.5 rounded-full backdrop-blur-md">
				{routes.map((route) => (
					<Link
						key={route.title}
						href={route.href}
						className="px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
					>
						<span className="relative z-10">{route.title}</span>
						<span className="absolute inset-0 bg-black/5 dark:bg-white/10 rounded-full scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200" />
					</Link>
				))}
			</nav>

			{/* CTA Buttons */}
			<div className="hidden md:flex items-center gap-1.5">
				<Link href={"/login"}>
					<Button
						variant="outline"
						className="text-sm px-2 py-2 h-auto"
					>
						Login
					</Button>
				</Link>
				<Link href="/signup">
					<Button
						variant="outline"
						className="text-sm px-2 py-2 h-auto"
					>
						Sign Up
					</Button>
				</Link>
			</div>

			{/* Mobile Menu Toggle */}
			<button
				onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
				className="flex md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 border border-transparent hover:border-border/30 transition-all"
				aria-label="Toggle Menu"
			>
				{mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
			</button>

			{/* Mobile Navigation Dropdown */}
			{mobileMenuOpen && (
				<div className="absolute top-[73px] left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-border/50 py-6 px-6 flex flex-col gap-5 md:hidden animate-in fade-in slide-in-from-top-4 duration-200 shadow-xl">
					<div className="flex flex-col gap-3">
						{routes.map((route) => (
							<Link
								key={route.title}
								href={route.href}
								onClick={() => setMobileMenuOpen(false)}
								className="text-lg font-medium text-muted-foreground hover:text-foreground py-2 border-b border-border/10 transition-colors"
							>
								{route.title}
							</Link>
						))}
					</div>
					<div className="flex flex-col gap-3 pt-2">
						<Link href={"/login"} onClick={() => setMobileMenuOpen(false)} className="w-full">
							<Button variant="outline" className="w-full py-3 rounded-full text-base">
								Login
							</Button>
						</Link>
						<Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
							<Button variant="btn-primary" className="w-full py-3 rounded-full text-base">
								Sign Up
							</Button>
						</Link>
					</div>
				</div>
			)}
		</header>
	);
};

export default Header;
