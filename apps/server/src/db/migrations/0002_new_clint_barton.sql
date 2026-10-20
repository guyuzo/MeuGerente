ALTER TABLE "produtos" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "produtos" ALTER COLUMN "status" SET DEFAULT 'radar'::text;--> statement-breakpoint
DROP TYPE "public"."produto_status";--> statement-breakpoint
CREATE TYPE "public"."produto_status" AS ENUM('radar', 'ativo', 'pausado', 'descartado');--> statement-breakpoint
ALTER TABLE "produtos" ALTER COLUMN "status" SET DEFAULT 'radar'::"public"."produto_status";--> statement-breakpoint
ALTER TABLE "produtos" ALTER COLUMN "status" SET DATA TYPE "public"."produto_status" USING "status"::"public"."produto_status";--> statement-breakpoint
ALTER TABLE "produtos" ADD COLUMN "emoji" text;