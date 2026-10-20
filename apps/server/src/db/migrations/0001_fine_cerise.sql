CREATE TYPE "public"."integracao_provedor" AS ENUM('tiktok_shop');--> statement-breakpoint
CREATE TYPE "public"."integracao_status" AS ENUM('conectada', 'expirada', 'erro', 'desconectada');--> statement-breakpoint
CREATE TYPE "public"."sincronizacao_status" AS ENUM('sucesso', 'parcial', 'erro');--> statement-breakpoint
CREATE TYPE "public"."sincronizacao_tipo" AS ENUM('produtos', 'vendas', 'comissao');--> statement-breakpoint
CREATE TYPE "public"."venda_fonte" AS ENUM('api', 'importacao');--> statement-breakpoint
CREATE TYPE "public"."venda_origem" AS ENUM('video', 'live', 'vitrine', 'outro');--> statement-breakpoint
CREATE TYPE "public"."venda_status_pedido" AS ENUM('pendente', 'enviado', 'concluido', 'cancelado', 'devolvido');--> statement-breakpoint
CREATE TABLE "integracoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provedor" "integracao_provedor" DEFAULT 'tiktok_shop' NOT NULL,
	"conta_nome" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expira_em" timestamp,
	"escopos" text[],
	"status" "integracao_status" DEFAULT 'desconectada' NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sincronizacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "sincronizacao_tipo" NOT NULL,
	"iniciada_em" timestamp DEFAULT now() NOT NULL,
	"concluida_em" timestamp,
	"registros_criados" integer DEFAULT 0 NOT NULL,
	"registros_atualizados" integer DEFAULT 0 NOT NULL,
	"status" "sincronizacao_status" NOT NULL,
	"mensagem_erro" text
);
--> statement-breakpoint
CREATE TABLE "vendas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tiktok_order_id" text NOT NULL,
	"produto_id" uuid NOT NULL,
	"conteudo_id" uuid,
	"data" timestamp NOT NULL,
	"origem" "venda_origem" NOT NULL,
	"status_pedido" "venda_status_pedido" DEFAULT 'pendente' NOT NULL,
	"pedidos" integer DEFAULT 0 NOT NULL,
	"itens" integer DEFAULT 0 NOT NULL,
	"gmv" numeric DEFAULT 0 NOT NULL,
	"comissao" numeric DEFAULT 0 NOT NULL,
	"comissao_confirmada" boolean DEFAULT false NOT NULL,
	"fonte" "venda_fonte" DEFAULT 'api' NOT NULL,
	"sincronizado_em" timestamp,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendas_tiktok_order_id_unique" UNIQUE("tiktok_order_id")
);
--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_conteudo_id_conteudos_id_fk" FOREIGN KEY ("conteudo_id") REFERENCES "public"."conteudos"("id") ON DELETE set null ON UPDATE no action;