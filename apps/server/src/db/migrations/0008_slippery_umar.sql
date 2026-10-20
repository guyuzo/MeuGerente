ALTER TYPE "public"."amostra_coluna_cor" ADD VALUE 'blue';--> statement-breakpoint
ALTER TYPE "public"."amostra_status" ADD VALUE 'para_publicar';--> statement-breakpoint
ALTER TYPE "public"."amostra_status" ADD VALUE 'publicado';--> statement-breakpoint
ALTER TYPE "public"."amostra_status" ADD VALUE 'vendida';--> statement-breakpoint
ALTER TYPE "public"."amostra_status" ADD VALUE 'descartada';--> statement-breakpoint
ALTER TABLE "amostras" ADD COLUMN "publicado_em" timestamp;