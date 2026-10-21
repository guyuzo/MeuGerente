CREATE TABLE "limites_uso" (
	"chave" text PRIMARY KEY NOT NULL,
	"quantidade" integer DEFAULT 0 NOT NULL,
	"desde" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redefinicoes_senha" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expira_em" timestamp NOT NULL,
	"usado_em" timestamp,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "redefinicoes_senha_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "metas" DROP CONSTRAINT "metas_mes_unique";--> statement-breakpoint
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_nome_importado_unique";--> statement-breakpoint
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_tiktok_order_id_unique";--> statement-breakpoint
ALTER TABLE "amostra_colunas" ALTER COLUMN "usuario_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "amostras" ALTER COLUMN "usuario_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categorias" ALTER COLUMN "usuario_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "conteudos" ALTER COLUMN "usuario_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "integracoes" ALTER COLUMN "usuario_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "metas" ALTER COLUMN "usuario_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "produtos" ALTER COLUMN "usuario_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "roteiros" ALTER COLUMN "usuario_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sincronizacoes" ALTER COLUMN "usuario_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "vendas" ALTER COLUMN "usuario_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "versao_sessao" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "aceitou_termos_em" timestamp;--> statement-breakpoint
ALTER TABLE "redefinicoes_senha" ADD CONSTRAINT "redefinicoes_senha_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metas" ADD CONSTRAINT "metas_usuario_mes_unique" UNIQUE("usuario_id","mes");--> statement-breakpoint
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_usuario_nome_importado_unique" UNIQUE("usuario_id","nome_importado");--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_usuario_tiktok_order_id_unique" UNIQUE("usuario_id","tiktok_order_id");