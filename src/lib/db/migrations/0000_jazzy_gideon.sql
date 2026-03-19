CREATE TYPE "public"."challenge_status" AS ENUM('waiting', 'active', 'grading', 'complete', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."leaderboard_period" AS ENUM('weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('learner', 'educator', 'admin');--> statement-breakpoint
CREATE TABLE "attempt_objectives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"objective_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"demonstrated" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"response_text" text,
	"score" integer,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" uuid NOT NULL,
	"status" "challenge_status" DEFAULT 'waiting' NOT NULL,
	"time_limit_seconds" integer DEFAULT 300 NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"winner_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"level_number" integer NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"prerequisite_level" integer,
	"mastery_threshold" integer DEFAULT 80 NOT NULL,
	"min_attempts_required" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "curriculum_levels_level_number_unique" UNIQUE("level_number")
);
--> statement-breakpoint
CREATE TABLE "document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_name" text NOT NULL,
	"document_type" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboard_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"period_type" "leaderboard_period" NOT NULL,
	"period_start" date NOT NULL,
	"xp_earned" integer NOT NULL,
	"rank" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mtss_classifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"objective_id" uuid NOT NULL,
	"tier" integer NOT NULL,
	"avg_score" real NOT NULL,
	"attempt_count" integer NOT NULL,
	"classified_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "peer_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"attempt_id" uuid NOT NULL,
	"correctness_score" integer NOT NULL,
	"reasoning_score" integer NOT NULL,
	"risk_awareness_score" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"scenario_id" uuid NOT NULL,
	"response_text" text DEFAULT '' NOT NULL,
	"score" integer,
	"ai_feedback" jsonb,
	"probing_questions" jsonb,
	"probing_response" text,
	"probing_score" integer,
	"final_score" integer,
	"time_spent_seconds" integer,
	"challenge_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curriculum_level_id" integer NOT NULL,
	"scenario_text" text NOT NULL,
	"market_data" jsonb NOT NULL,
	"question_prompt" text NOT NULL,
	"target_objectives" jsonb NOT NULL,
	"rubric" jsonb NOT NULL,
	"difficulty" integer NOT NULL,
	"market_regime" text NOT NULL,
	"quality_score" real,
	"is_active" boolean DEFAULT true NOT NULL,
	"generated_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_objectives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"curriculum_level_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "skill_objectives_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_streaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_activity_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_streaks_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'learner' NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"avatar_url" text,
	"current_curriculum_level" integer DEFAULT 1 NOT NULL,
	"last_active_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "xp_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"reference_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attempt_objectives" ADD CONSTRAINT "attempt_objectives_attempt_id_scenario_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."scenario_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_objectives" ADD CONSTRAINT "attempt_objectives_objective_id_skill_objectives_id_fk" FOREIGN KEY ("objective_id") REFERENCES "public"."skill_objectives"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_scenario_id_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mtss_classifications" ADD CONSTRAINT "mtss_classifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mtss_classifications" ADD CONSTRAINT "mtss_classifications_objective_id_skill_objectives_id_fk" FOREIGN KEY ("objective_id") REFERENCES "public"."skill_objectives"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peer_reviews" ADD CONSTRAINT "peer_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peer_reviews" ADD CONSTRAINT "peer_reviews_attempt_id_scenario_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."scenario_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenario_attempts" ADD CONSTRAINT "scenario_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenario_attempts" ADD CONSTRAINT "scenario_attempts_scenario_id_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_curriculum_level_id_curriculum_levels_id_fk" FOREIGN KEY ("curriculum_level_id") REFERENCES "public"."curriculum_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_objectives" ADD CONSTRAINT "skill_objectives_curriculum_level_id_curriculum_levels_id_fk" FOREIGN KEY ("curriculum_level_id") REFERENCES "public"."curriculum_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempt_obj_score_idx" ON "attempt_objectives" USING btree ("objective_id","score");--> statement-breakpoint
CREATE UNIQUE INDEX "challenge_user_unique_idx" ON "challenge_participants" USING btree ("challenge_id","user_id");--> statement-breakpoint
CREATE INDEX "leaderboard_period_rank_idx" ON "leaderboard_snapshots" USING btree ("period_type","period_start","rank");--> statement-breakpoint
CREATE INDEX "mtss_user_obj_classified_idx" ON "mtss_classifications" USING btree ("user_id","objective_id","classified_at");--> statement-breakpoint
CREATE INDEX "mtss_tier_classified_idx" ON "mtss_classifications" USING btree ("tier","classified_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reviewer_attempt_unique_idx" ON "peer_reviews" USING btree ("reviewer_id","attempt_id");--> statement-breakpoint
CREATE INDEX "attempts_user_created_idx" ON "scenario_attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "scenarios_level_active_quality_idx" ON "scenarios" USING btree ("curriculum_level_id","is_active","quality_score");--> statement-breakpoint
CREATE INDEX "xp_events_user_created_idx" ON "xp_events" USING btree ("user_id","created_at");