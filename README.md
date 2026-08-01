# 2ndBrain

A real-time collaborative workspace for notes, docs, and knowledge management — think Notion, built with a block-based editor, live multiplayer editing, and an AI assistant baked directly into the page.

Organize your thoughts into **workspaces → nested pages**, write with a rich block editor, collaborate with others in real time, and let AI help you draft, edit, and restructure content as you go.

## Features

- **Block-based editor** — rich-text editing powered by [BlockNote](https://www.blocknote.js.org/), supporting headings, lists, images, and more
- **Real-time collaboration** — live multiplayer editing and cursor presence via Yjs, Supabase Realtime, and Socket.IO
- **AI assistant** — an in-editor AI chat (Google Gemini via the Vercel AI SDK) that can insert, update, and delete blocks directly in your document, plus a sidebar chat for Q&A over your workspace content
- **Workspaces and pages** — a flexible hierarchy for organizing everything, with emoji icons and custom banners
- **Trash & recovery** — soft-delete for nested pages instead of permanent loss
- **Authentication** — email/password auth via Supabase
- **Billing** — subscription plans (Free / Pro) powered by Stripe, including checkout, customer portal, and webhook handling
- **Modern UI** — Tailwind CSS v4, shadcn/ui, and Radix primitives, with light/dark theme support

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript |
| Editor | [BlockNote](https://www.blocknote.js.org/) (`@blocknote/core`, `react`, `mantine`, `xl-ai`) |
| Realtime collab | [Yjs](https://yjs.dev/), `y-websocket`, `@supabase-labs/y-supabase`, Socket.IO |
| Database / ORM | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/) |
| Auth & backend | [Supabase](https://supabase.com/) |
| AI | [Vercel AI SDK](https://sdk.vercel.ai/) + Google Gemini (`@ai-sdk/google`) |
| Payments | [Stripe](https://stripe.com/) |
| UI | Tailwind CSS v4, shadcn/ui, Radix UI, Lucide icons |
| State | Zustand, React Hook Form + Zod |

## Project Structure

```
2ndBrain/
├── figma_theme.css        # Design tokens exported from Figma
└── project/                # The Next.js application
    ├── migrations/          # Drizzle migrations + generated schema
    ├── public/               # Static assets
    └── src/
        ├── app/
        │   ├── (auth)/         # Login / signup routes
        │   ├── (main)/         # Dashboard, workspace, and page routes
        │   ├── (site)/         # Marketing / landing pages
        │   └── api/              # AI chat, Stripe checkout/portal, webhooks
        ├── components/         # UI, sidebar, navbar, editor, settings, etc.
        ├── lib/
        │   ├── supabase/         # DB client, queries, server actions
        │   ├── stripe/            # Stripe helpers
        │   ├── store/              # Zustand stores
        │   └── providers/          # React context providers
        └── pages/api/socket/   # Socket.IO server for realtime cursors
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project (for auth, database, and file storage)
- A [Stripe](https://stripe.com/) account (for billing features)
- A [Google AI (Gemini)](https://ai.google.dev/) API key (for AI features)

### 1. Clone and install

```bash
git clone https://github.com/lakshyakaul/2ndBrain.git
cd 2ndBrain/project
npm install
```

### 2. Configure environment variables

Create a `.env` file inside `project/` with the following:

```bash
# Database (Postgres connection string, e.g. from Supabase)
DATABASE_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SERVICE_ROLE_KEY=

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google AI (Gemini) for AI chat features
GOOGLE_GENERATIVE_AI_API_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_WEBHOOK_SECRET_LIVE=
```

### 3. Set up the database

Push the Drizzle schema to your Postgres database:

```bash
npm run push
```

Other useful Drizzle scripts:

```bash
npm run generate   # generate a new migration from schema changes
npm run pull       # introspect an existing database
npm run check      # validate migrations
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run push` | Push Drizzle schema to the database |
| `npm run pull` | Introspect the database into a schema |
| `npm run generate` | Generate migrations from schema changes |
| `npm run drop` | Drop a migration |
