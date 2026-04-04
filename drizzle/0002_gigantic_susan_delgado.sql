CREATE TYPE "public"."programming_language" AS ENUM('javascript', 'typescript', 'python', 'html', 'css', 'sql', 'json', 'markdown');--> statement-breakpoint
ALTER TYPE "public"."question_type" ADD VALUE 'code_input';--> statement-breakpoint
CREATE TABLE "learning_path_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learning_path_id" uuid NOT NULL,
	"quiz_id" uuid NOT NULL,
	"level_number" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"min_score" integer DEFAULT 70 NOT NULL,
	"reference_urls" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_paths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"department_id" uuid,
	"created_by" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"language" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quiz_assignments" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "quiz_assignments" ALTER COLUMN "assigned_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "code_template" text;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "code_solution" text;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "programming_language" "programming_language";--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "reference_urls" jsonb;--> statement-breakpoint
ALTER TABLE "learning_path_levels" ADD CONSTRAINT "learning_path_levels_learning_path_id_learning_paths_id_fk" FOREIGN KEY ("learning_path_id") REFERENCES "public"."learning_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_levels" ADD CONSTRAINT "learning_path_levels_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;