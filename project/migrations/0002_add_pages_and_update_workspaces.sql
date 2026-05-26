ALTER TABLE "workspaces" ADD COLUMN "icon_id" text DEFAULT '📁' NOT NULL;
ALTER TABLE "workspaces" ADD COLUMN "logo" text;

CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"icon_id" text NOT NULL,
	"data" text,
	"in_trash" text,
	"banner_url" text,
	"type" text DEFAULT 'novel' NOT NULL,
	"workspace_id" uuid NOT NULL,
	"parent_id" uuid
);

ALTER TABLE "pages" ADD CONSTRAINT "pages_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
