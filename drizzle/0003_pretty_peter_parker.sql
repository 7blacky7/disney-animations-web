CREATE TYPE "public"."ai_provider" AS ENUM('claude_cli', 'claude_api', 'openai');--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "ai_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "ai_provider" "ai_provider";--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "ai_api_key" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "ai_model" text;