CREATE TYPE "public"."amostra_coluna_cor" AS ENUM('neutral', 'success', 'warning', 'error', 'accent');--> statement-breakpoint
ALTER TYPE "public"."amostra_status" ADD VALUE 'publicada' BEFORE 'recusada';--> statement-breakpoint
CREATE TABLE "amostra_colunas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cor" "amostra_coluna_cor" DEFAULT 'neutral' NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "amostras" ADD COLUMN "coluna_customizada_id" uuid;--> statement-breakpoint
ALTER TABLE "amostras" ADD CONSTRAINT "amostras_coluna_customizada_id_amostra_colunas_id_fk" FOREIGN KEY ("coluna_customizada_id") REFERENCES "public"."amostra_colunas"("id") ON DELETE set null ON UPDATE no action;