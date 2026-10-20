CREATE TABLE "metas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mes" text NOT NULL,
	"videos" integer DEFAULT 0 NOT NULL,
	"faturamento" numeric DEFAULT 0 NOT NULL,
	"lives" integer DEFAULT 0 NOT NULL,
	"nivel" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "metas_mes_unique" UNIQUE("mes")
);
