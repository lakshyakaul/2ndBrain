"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CLIENTS, PRICING_CARDS, PRICING_PLANS, USERS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CustomCard from "@/components/landing-page/custom-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Check,
  Layers,
  Users2,
  CalendarDays,
  History,
  MousePointer2,
  Lock,
  CheckCircle2
} from "lucide-react";
import Cal from "../../../public/cal.png";
import Diamond from "../../../public/icons/diamond.svg";
import CheckIcon from "../../../public/icons/check.svg";

const badgeColors = {
  purple: "border-brand-primary-purple/30 bg-brand-primary-purple/5 text-brand-primary-purple",
  blue: "border-brand-primary-blue/30 bg-brand-primary-blue/5 text-brand-primary-blue",
};

const SectionHeader = ({ badgeText, title, description, badgeColor = "purple" }: { badgeText: string, title: React.ReactNode, description: React.ReactNode, badgeColor?: keyof typeof badgeColors }) => (
  <div className="text-center flex flex-col items-center mb-16">
    <div className={cn("px-3.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider mb-4", badgeColors[badgeColor])}>
      {badgeText}
    </div>
    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 max-w-2xl leading-tight">
      {title}
    </h2>
    <p className="text-muted-foreground max-w-lg">
      {description}
    </p>
  </div>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-24 font-dm-sans">
      {/* Decorative Top Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[60%] rounded-full bg-brand-primary-blue/45 blur-[60px] dark:bg-brand-primary-blue/60" />
        <div className="absolute top-[-10%] right-[20%] w-[50%] h-[60%] rounded-full bg-brand-primary-purple/35 blur-[60px] dark:bg-brand-primary-purple/60" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] rounded-full bg-primary/60 blur-[70px]" />
      </div>

      {/* HERO SECTION */}
      <section className="relative px-6 max-w-6xl mx-auto text-center flex flex-col items-center pb-16">
        {/* Modern Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-primary-blue/30 bg-brand-primary-blue/5 backdrop-blur-md text-sm font-medium text-brand-primary-blue dark:text-washed-blue-300 mb-6 hover:scale-102 transition-transform duration-300">
          <Sparkles className="size-4 animate-pulse text-brand-primary-purple" />
          <span>Your Workspace, Perfected</span>
        </div>

        {/* High-Impact Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1] mb-6">
          All-In-One Collaboration &amp;{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary-blue via-primary to-brand-primary-purple">
            Productivity Platform
          </span>
        </h1>

        {/* Styled Subheading */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
          Capture your ideas, organize your workflows, and collaborate in real-time. Experience a stunningly fast workspace built for modern product builders.
        </p>

        {/* Beautiful CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button
              variant="btn-primary"
              className="w-full sm:w-auto text-base font-medium border-2 rounded-full px-4 py-3 h-auto shadow-lg hover:shadow-brand-primary-blue/20 transition-all group flex items-center justify-center gap-2"
            >
              <span className="text-white">Get Started for Free</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a href="#features" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-base font-medium rounded-full px-4 py-3 h-auto border-2 border-border/60 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              Explore Features
            </Button>
          </a>
        </div>

        {/* Interactive Glassmorphic Workspace Sandbox Preview Dashboard */}
        <div className="w-full relative rounded-2xl border border-border/60 bg-card/90 dark:bg-black/30 p-2.5 backdrop-blur-md shadow-2xl overflow-hidden group/dashboard">
          {/* Inner Glow Border */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary-blue/10 via-transparent to-brand-primary-purple/10 opacity-0 group-hover/dashboard:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Workspace Dashboard Container */}
          <div className="rounded-xl border border-border/40 bg-background/95 dark:bg-neutrals-12/90 overflow-hidden shadow-inner flex flex-col md:flex-row text-left h-[420px] md:h-[480px]">

            {/* Sidebar Mock */}
            <div className="w-full md:w-56 border-r border-border/40 bg-muted/35 dark:bg-black/40 p-4 flex flex-col gap-5 shrink-0 hidden md:flex">
              <div className="flex items-center gap-2 px-1">
                <div className="size-3.5 rounded-full bg-destructive/80" />
                <div className="size-3.5 rounded-full bg-brand-primary-blue/80" />
                <div className="size-3.5 rounded-full bg-brand-primary-purple/80" />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase px-2 mb-1">
                  Workspace
                </span>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-brand-primary-blue/10 text-brand-primary-blue text-sm font-medium">
                  <Layers className="size-4" />
                  <span>Dashboard</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground text-sm transition-colors">
                  <Users2 className="size-4" />
                  <span>Shared Space</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground text-sm transition-colors">
                  <CalendarDays className="size-4" />
                  <span>Calendar</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-auto">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase px-2 mb-1">
                  Pages
                </span>
                <div className="px-2 py-1 text-xs text-muted-foreground/80 hover:text-foreground cursor-pointer transition-colors">
                  📄 Product Roadmap
                </div>
                <div className="px-2 py-1 text-xs text-muted-foreground/80 hover:text-foreground cursor-pointer transition-colors">
                  📄 Q3 Brainstorming
                </div>
                <div className="px-2 py-1 text-xs text-muted-foreground/80 hover:text-foreground cursor-pointer transition-colors">
                  📄 Meeting Sync - May
                </div>
              </div>
            </div>

            {/* Main Editor Preview Content */}
            <div className="flex-1 p-6 flex flex-col relative overflow-hidden">

              {/* Collaboration Indicator Overlay */}
              <div className="flex items-center gap-1.5 absolute top-4 right-4 bg-background/95 dark:bg-neutrals-13 border border-border/40 px-2.5 py-1 rounded-full text-[11px] font-medium shadow-sm z-20">
                <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="size-2 rounded-full bg-emerald-500 absolute left-2.5" />
                <span className="ml-1 text-muted-foreground">3 Editors Active</span>
              </div>

              {/* Breadcrumbs */}
              <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5 font-medium">
                <span>Space</span>
                <span>/</span>
                <span>Workspace</span>
                <span>/</span>
                <span className="text-foreground">Product Roadmap</span>
              </div>

              {/* Document Title */}
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                🚀 Next-Gen Space Collaboration Page
              </h2>

              {/* Editor Content Area */}
              <div className="flex-1 flex flex-col gap-4 text-sm text-muted-foreground leading-relaxed max-w-xl">
                <p>
                  This is your collaborative space. Here, teams can easily brainstorm features, share comprehensive product outlines, and document roadmap highlights.
                </p>

                {/* Features Checklist inside Document */}
                <div className="flex flex-col gap-2 bg-muted/35 dark:bg-white/5 border border-border/30 rounded-xl p-4 mt-2">
                  <div className="flex items-center gap-2 text-foreground font-medium text-xs mb-1">
                    <span>TASKS CHECKLIST</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-4 text-brand-primary-blue" />
                    <span className="line-through">Design glassmorphism landing layout</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-foreground font-medium relative">
                    <div className="size-4 rounded-md border border-brand-primary-purple bg-brand-primary-purple/10 flex items-center justify-center shrink-0">
                      <div className="size-1.5 rounded-full bg-brand-primary-purple" />
                    </div>
                    <span>Build interactive collaborative cursors simulation</span>
                    {/* Mock editing badge */}
                    <span className="absolute left-[310px] top-[-8px] text-[9px] bg-brand-primary-purple text-white px-1.5 py-0.5 rounded-full font-semibold">
                      Claude editing...
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <div className="size-4 rounded-md border border-border shrink-0" />
                    <span>Configure multi-column testimonial infinite slider</span>
                  </div>
                </div>

                {/* Mock Live Cursor Claude */}
                <div className="absolute top-[230px] left-[260px] flex flex-col items-start pointer-events-none">
                  <MousePointer2 className="size-4 text-brand-primary-purple fill-brand-primary-purple" />
                  <div className="bg-brand-primary-purple text-white text-[10px] px-2 py-0.5 rounded-md font-semibold shadow-md whitespace-nowrap mt-1">
                    Claude
                  </div>
                </div>

                {/* Mock Live Cursor You */}
                <div className="absolute top-[120px] left-[150px] flex flex-col items-start pointer-events-none">
                  <MousePointer2 className="size-4 text-brand-primary-blue fill-brand-primary-blue" />
                  <div className="bg-brand-primary-blue text-white text-[10px] px-2 py-0.5 rounded-md font-semibold shadow-md whitespace-nowrap mt-1">
                    You
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES BENTO GRID SECTION */}
      <section id="features" className="px-6 py-24 max-w-6xl mx-auto relative">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[50%] h-[30%] bg-brand-primary-purple/5 blur-[120px] -z-10 pointer-events-none" />

        {/* Header */}
        <SectionHeader
          badgeText="Features"
          title="Keep track of your projects & workflows all in one place"
          description="Bring ideas to life inside high-fidelity shared spaces. Collaborate in real-time, schedule tasks, and check granular history effortlessly."
          badgeColor="purple"
        />

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

          {/* Bento 1: Real-time Collaboration (Span 2 columns) */}
          <div className="md:col-span-2 rounded-2xl border border-border/60 bg-card/90 dark:bg-white/5 backdrop-blur-md p-8 flex flex-col justify-between overflow-hidden relative group/bento">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-primary-blue/10 rounded-full blur-[80px] group-hover/bento:bg-brand-primary-blue/15 transition-colors pointer-events-none" />

            <div>
              <div className="size-10 rounded-xl bg-brand-primary-blue/10 border border-brand-primary-blue/20 flex items-center justify-center text-brand-primary-blue mb-6">
                <Users2 className="size-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Infinite Collaboration Workspace</h3>
              <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                Teamwork made simple. View real-time active cursors, share instantly updated workspace structures, invite guests, and edit docs together simultaneously.
              </p>
            </div>

            {/* Small live action mock layout inside card */}
            <div className="mt-8 flex gap-3 overflow-hidden border border-border/30 bg-muted/35 dark:bg-neutrals-12/40 p-4 rounded-xl items-center relative shadow-sm">
              <div className="flex -space-x-2.5">
                <div className="size-7 rounded-full border-2 border-background bg-brand-primary-blue flex items-center justify-center text-[10px] font-bold text-white">LI</div>
                <div className="size-7 rounded-full border-2 border-background bg-brand-primary-purple flex items-center justify-center text-[10px] font-bold text-white">OL</div>
                <div className="size-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">AV</div>
              </div>
              <span className="text-xs text-muted-foreground font-medium">Olivia, Liam and 2 others are formatting roadmap...</span>
              <div className="absolute right-4 size-2.5 rounded-full bg-emerald-500" />
            </div>
          </div>

          {/* Bento 2: Version History */}
          <div className="rounded-2xl border border-border/60 bg-card/90 dark:bg-white/5 backdrop-blur-md p-8 flex flex-col justify-between overflow-hidden relative group/bento">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-brand-primary-purple/10 rounded-full blur-[65px] group-hover/bento:bg-brand-primary-purple/15 transition-colors pointer-events-none" />

            <div>
              <div className="size-10 rounded-xl bg-brand-primary-purple/10 border border-brand-primary-purple/20 flex items-center justify-center text-brand-primary-purple mb-6">
                <History className="size-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Page History</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Rest easy knowing every keystroke is backed up. Access comprehensive version history checkpoints, rollback accidental changes, and retrieve pages up to 1 year back.
              </p>
            </div>

            <div className="mt-8 bg-muted/35 dark:bg-neutrals-12/40 border border-border/30 rounded-xl p-3.5 flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>📝 Edited by Liam</span>
                <span className="text-[10px] text-muted-foreground/75">10 mins ago</span>
              </div>
              <div className="h-[1px] bg-border/40" />
              <div className="flex justify-between items-center text-brand-primary-purple font-medium">
                <span>✨ Automated Sync</span>
                <span className="text-[10px]">Just now</span>
              </div>
            </div>
          </div>

          {/* Bento 3: Meetings / Cal integration */}
          <div className="rounded-2xl border border-border/60 bg-card/90 dark:bg-white/5 backdrop-blur-md p-8 flex flex-col justify-between overflow-hidden relative group/bento md:col-span-1">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/10 rounded-full blur-[65px] group-hover/bento:bg-primary/15 transition-colors pointer-events-none" />

            <div>
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
                <CalendarDays className="size-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Calendar Scheduler</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Coordinate effortlessly. Plan projects, schedule team meetings, link session notes directly, and view timelines on an immersive drag-and-drop shared calendar layout.
              </p>
            </div>

            <div className="mt-8 border-4 border-washed-purple-300/10 rounded-xl overflow-hidden shadow-md">
              <Image src={Cal} alt="Calendar scheduler" className="w-full object-cover rounded-lg" />
            </div>
          </div>

          {/* Bento 4: Safety & Cloud Lock (Span 2 columns) */}
          <div className="md:col-span-2 rounded-2xl border border-border/60 bg-card/90 dark:bg-white/5 backdrop-blur-md p-8 flex flex-col justify-between overflow-hidden relative group/bento">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-primary-blue/10 rounded-full blur-[80px] group-hover/bento:bg-brand-primary-blue/15 transition-colors pointer-events-none" />

            <div>
              <div className="size-10 rounded-xl bg-brand-primary-blue/10 border border-brand-primary-blue/20 flex items-center justify-center text-brand-primary-blue mb-6">
                <Lock className="size-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">SaaS Enterprise Security</h3>
              <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                Your security is our absolute priority. Leverage end-to-end socket channels, secure collaborative authentication, and instant database encryption checkpoints to protect company assets.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl px-4 py-3 text-xs font-semibold self-start">
              <Check className="size-4" />
              <span>Protected by space-grade socket channels &amp; database encryption</span>
            </div>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="relative py-24 border-t border-border/10 bg-muted/25 dark:bg-black/5">
        {/* Ambient Glows */}
        <div className="absolute top-[40%] left-0 w-80 h-80 rounded-full bg-brand-primary-blue/5 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-0 w-80 h-80 rounded-full bg-brand-primary-purple/5 blur-[90px] pointer-events-none" />

        <SectionHeader
          badgeText="Testimonials"
          title="Trusted by thousands of modern builders"
          description="See how fast-growing product teams and creators use Space to keep their workspaces in perfect alignment."
          badgeColor="blue"
        />

        {/* Stationary High-Fidelity Responsive Grid */}
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {USERS.map((item, idx) => (
            <CustomCard
              key={item.name}
              className="w-full border border-border/60 bg-background/90 dark:bg-neutrals-12/70 backdrop-blur-md rounded-xl p-5 shadow-sm hover:border-brand-primary-blue hover:shadow-[0_0_20px_rgba(86,143,248,0.05)] hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
              cardHeader={
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 border border-border">
                    <AvatarImage src={item.avatar} />
                    <AvatarFallback className="font-semibold text-xs">AV</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground leading-none mb-1">
                      {item.name}
                    </CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground leading-none font-medium">
                      {item.role}
                    </CardDescription>
                  </div>
                </div>
              }
              cardContent={
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                  &ldquo;{item.message}&rdquo;
                </p>
              }
            />
          ))}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="px-6 py-24 max-w-5xl mx-auto relative">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-brand-primary-blue/5 blur-[120px] -z-10 pointer-events-none" />

        <SectionHeader
          badgeText="Pricing"
          title="The Perfect Plan For You"
          description="Select a plan that suits your team size and productivity speed. Upgrade, downgrade, or cancel anytime."
          badgeColor="blue"
        />

        {/* Pricing card comparison list */}
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 mt-12 max-w-3xl mx-auto">

          {PRICING_CARDS.map((card) => {
            const isPro = card.planType === PRICING_PLANS.proplan;
            return (
              <CustomCard
                key={card.planType}
                className={cn(
                  "w-full md:w-[360px] rounded-2xl border bg-background/90 dark:bg-black/30 backdrop-blur-xl relative p-6 flex flex-col justify-between overflow-hidden group/pricing transition-all duration-300",
                  isPro
                    ? "border-brand-primary-purple/60 shadow-xl hover:border-brand-primary-purple/90"
                    : "border-border/60 dark:border-border shadow-sm"
                )}
                cardHeader={
                  <div className="flex flex-col gap-1">
                    {isPro && (
                      <>
                        {/* Purple Radial Glow for Pro Card */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary-purple/10 rounded-full blur-[40px] pointer-events-none" />
                        <Image
                          src={Diamond}
                          alt="Pro Plan Icon"
                          className="absolute top-6 right-6 w-5 h-5 animate-pulse"
                        />
                      </>
                    )}
                    <Badge variant="secondary" className={cn(
                      "self-start text-[10px] font-bold uppercase tracking-wider mb-2",
                      isPro
                        ? "bg-brand-primary-purple/10 text-brand-primary-purple border-brand-primary-purple/20"
                        : "bg-muted/50 dark:bg-white/10 text-muted-foreground"
                    )}>
                      {card.planType}
                    </Badge>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-bold tracking-tight text-foreground">
                        ₹{card.price}
                      </span>
                      {+card.price > 0 && (
                        <span className="text-muted-foreground text-xs font-medium ml-1">
                          / month
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                }
                cardContent={
                  <div className="mt-6 flex-1 flex flex-col justify-between">
                    {/* Highlight Feature Badge inside Content */}
                    {card.highlightFeature && (
                      <span className="text-[10px] font-bold tracking-wide text-brand-primary-purple uppercase mb-4 block">
                        {card.highlightFeature}
                      </span>
                    )}

                    {/* Dynamic checkmark list */}
                    <ul className="flex flex-col gap-3.5 mb-8">
                      {card.freatures.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-xs text-muted-foreground leading-none">
                          <Image
                            src={CheckIcon}
                            alt="Check Icon"
                            className="w-4 h-4 shrink-0"
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Call-to-action button */}
                    <Link href={isPro ? "/signup" : "/signup"} className="w-full">
                      <Button
                        variant={isPro ? "default" : "outline"}
                        className={cn(
                          "w-full rounded-full py-5 text-xs font-bold transition-all relative overflow-hidden group/btn",
                          isPro
                            ? "bg-brand-primary-purple hover:bg-brand-primary-purple/95 text-white dark:text-foreground cursor-pointer shadow-md hover:shadow-brand-primary-purple/20 border-none"
                            : "border-border/60 hover:bg-muted/60 dark:hover:bg-white/10"
                        )}
                      >
                        {isPro ? "Go Pro" : "Continue"}
                      </Button>
                    </Link>
                  </div>
                }
              />
            );
          })}

        </div>
      </section>

      {/* BOTTOM RADIAL GLOW */}
      <div className="relative w-full h-[300px] pointer-events-none overflow-hidden mt-[-250px]">
        <div className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 w-[180%] h-[220px] rounded-full opacity-90 bg-gradient-to-t from-brand-primary-blue/90 via-brand-primary-purple/60 to-transparent blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}
