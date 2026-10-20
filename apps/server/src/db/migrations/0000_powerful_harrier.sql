CREATE TYPE "public"."amostra_origem" AS ENUM('gratuita', 'comprada', 'parceria');--> statement-breakpoint
CREATE TYPE "public"."amostra_status" AS ENUM('solicitada', 'aprovada', 'enviada', 'recebida', 'recusada', 'devolvida');--> statement-breakpoint
CREATE TYPE "public"."conteudo_formato" AS ENUM('video_curto', 'live', 'carrossel', 'unboxing');--> statement-breakpoint
CREATE TYPE "public"."conteudo_status" AS ENUM('ideia', 'roteiro_pronto', 'gravado', 'editado', 'publicado');--> statement-breakpoint
CREATE TYPE "public"."produto_fonte" AS ENUM('api', 'manual');--> statement-breakpoint
CREATE TYPE "public"."produto_status" AS ENUM('radar', 'solicitado', 'ativo', 'pausado', 'descartado');--> statement-breakpoint
CREATE TYPE "public"."roteiro_publico" AS ENUM('frio', 'morno', 'quente');--> statement-breakpoint
CREATE TABLE "amostras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produto_id" uuid NOT NULL,
	"status" "amostra_status" DEFAULT 'solicitada' NOT NULL,
	"origem" "amostra_origem" DEFAULT 'gratuita' NOT NULL,
	"custo" numeric DEFAULT 0 NOT NULL,
	"data_solicitacao" timestamp,
	"data_recebimento" timestamp,
	"prazo_conteudo" timestamp,
	"codigo_rastreio" text,
	"observacao" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conteudos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produto_id" uuid NOT NULL,
	"amostra_id" uuid,
	"titulo" text NOT NULL,
	"formato" "conteudo_formato" NOT NULL,
	"status" "conteudo_status" DEFAULT 'ideia' NOT NULL,
	"data_prevista" timestamp,
	"data_publicacao" timestamp,
	"link_publicacao" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "produtos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tiktok_product_id" text,
	"fonte" "produto_fonte" DEFAULT 'manual' NOT NULL,
	"sincronizado_em" timestamp,
	"nome" text NOT NULL,
	"loja" text,
	"categoria" text,
	"link_tiktok" text,
	"imagem_url" text,
	"preco" numeric,
	"comissao_pct" numeric,
	"comissao_valor" numeric,
	"status" "produto_status" DEFAULT 'radar' NOT NULL,
	"nota_potencial" integer,
	"observacao" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roteiros" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conteudo_id" uuid NOT NULL,
	"produto_id" uuid NOT NULL,
	"publico" "roteiro_publico" NOT NULL,
	"gancho" text NOT NULL,
	"corpo" text NOT NULL,
	"cta" text NOT NULL,
	"versao" integer DEFAULT 1 NOT NULL,
	"gerado_por_ia" boolean DEFAULT false NOT NULL,
	"modelo_ia" text,
	"editado_manualmente" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "amostras" ADD CONSTRAINT "amostras_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_amostra_id_amostras_id_fk" FOREIGN KEY ("amostra_id") REFERENCES "public"."amostras"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roteiros" ADD CONSTRAINT "roteiros_conteudo_id_conteudos_id_fk" FOREIGN KEY ("conteudo_id") REFERENCES "public"."conteudos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roteiros" ADD CONSTRAINT "roteiros_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;