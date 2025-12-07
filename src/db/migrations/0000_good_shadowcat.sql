CREATE TYPE "public"."game_phase" AS ENUM('lobby', 'in_round', 'judging', 'finished');--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(12) NOT NULL,
	"host_id" varchar(64) NOT NULL,
	"phase" "game_phase" DEFAULT 'lobby' NOT NULL,
	"round" integer DEFAULT 0 NOT NULL,
	"state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"expires_at" timestamp,
	CONSTRAINT "games_code_unique" UNIQUE("code")
);
