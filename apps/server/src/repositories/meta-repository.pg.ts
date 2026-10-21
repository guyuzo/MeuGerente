import type { Meta, MetaInput, MetaRepository } from "@meugerente/shared";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { metas } from "../db/schema.js";

type LinhaMeta = typeof metas.$inferSelect;

function paraMeta(linha: LinhaMeta): Meta {
  return {
    id: linha.id,
    mes: linha.mes,
    videos: linha.videos,
    faturamento: linha.faturamento,
    lives: linha.lives,
    nivel: linha.nivel,
    criadoEm: linha.criadoEm,
    atualizadoEm: linha.atualizadoEm,
  };
}

/** Escopado por usuário: cada conta tem a própria meta de cada mês (PLANO-MULTIUSUARIO.md). */
export class MetaRepositoryPg implements MetaRepository {
  constructor(private readonly usuarioId: string) {}

  async buscarPorMes(mes: string): Promise<Meta | undefined> {
    const [linha] = await db
      .select()
      .from(metas)
      .where(and(eq(metas.mes, mes), eq(metas.usuarioId, this.usuarioId)));
    return linha ? paraMeta(linha) : undefined;
  }

  async salvar(mes: string, input: MetaInput): Promise<Meta> {
    const [linha] = await db
      .insert(metas)
      .values({ ...input, mes, usuarioId: this.usuarioId })
      .onConflictDoUpdate({
        target: [metas.usuarioId, metas.mes],
        set: { ...input, atualizadoEm: new Date().toISOString() },
      })
      .returning();
    return paraMeta(linha);
  }
}
