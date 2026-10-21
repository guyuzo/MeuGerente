ALTER TABLE "amostra_colunas" ADD COLUMN "usuario_id" uuid;--> statement-breakpoint
ALTER TABLE "amostras" ADD COLUMN "usuario_id" uuid;--> statement-breakpoint
ALTER TABLE "categorias" ADD COLUMN "usuario_id" uuid;--> statement-breakpoint
ALTER TABLE "conteudos" ADD COLUMN "usuario_id" uuid;--> statement-breakpoint
ALTER TABLE "integracoes" ADD COLUMN "usuario_id" uuid;--> statement-breakpoint
ALTER TABLE "metas" ADD COLUMN "usuario_id" uuid;--> statement-breakpoint
ALTER TABLE "produtos" ADD COLUMN "usuario_id" uuid;--> statement-breakpoint
ALTER TABLE "roteiros" ADD COLUMN "usuario_id" uuid;--> statement-breakpoint
ALTER TABLE "sincronizacoes" ADD COLUMN "usuario_id" uuid;--> statement-breakpoint
ALTER TABLE "vendas" ADD COLUMN "usuario_id" uuid;--> statement-breakpoint
ALTER TABLE "amostra_colunas" ADD CONSTRAINT "amostra_colunas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "amostras" ADD CONSTRAINT "amostras_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integracoes" ADD CONSTRAINT "integracoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metas" ADD CONSTRAINT "metas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roteiros" ADD CONSTRAINT "roteiros_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sincronizacoes" ADD CONSTRAINT "sincronizacoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;