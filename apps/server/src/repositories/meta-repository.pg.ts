import type { Meta, MetaInput, MetaRepository } from "@meugerente/shared";
import { eq } from "drizzle-orm";
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

export class MetaRepositoryPg implements MetaRepository {
  async buscarPorMes(mes: string): Promise<Meta | undefined> {
    const [linha] = await db.select().from(metas).where(eq(metas.mes, mes));
    return linha ? paraMeta(linha) : undefined;
  }

  async salvar(mes: string, input: MetaInput): Promise<Meta> {
    const [linha] = await db
      .insert(metas)
      .values({ mes, ...input })
      .onConflictDoUpdate({ target: metas.mes, set: { ...input, atualizadoEm: new Date().toISOString() } })
      .returning();
    return paraMeta(linha);
  }
}
