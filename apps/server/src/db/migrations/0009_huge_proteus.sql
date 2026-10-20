ALTER TYPE "public"."venda_status_pedido" ADD VALUE 'aguardando_pagamento' BEFORE 'enviado';--> statement-breakpoint
ALTER TYPE "public"."venda_status_pedido" ADD VALUE 'inelegivel' BEFORE 'devolvido';--> statement-breakpoint
ALTER TABLE "produtos" ADD COLUMN "nome_importado" text;--> statement-breakpoint
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_nome_importado_unique" UNIQUE("nome_importado");