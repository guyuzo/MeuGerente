import type { Roteiro, RoteiroCreateInput, RoteiroRepository, RoteiroUpdateInput } from "@meugerente/shared";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { roteiros } from "../db/schema.js";

type LinhaRoteiro = typeof roteiros.$inferSelect;

function paraRoteiro(linha: LinhaRoteiro): Roteiro {
  return {
    id: linha.id,
    conteudoId: linha.conteudoId,
    produtoId: linha.produtoId,
    publico: linha.publico,
    gancho: linha.gancho,
    corpo: linha.corpo,
    cta: linha.cta,
    versao: linha.versao,
    geradoPorIa: linha.geradoPorIa,
    modeloIa: linha.modeloIa ?? undefined,
    editadoManualmente: linha.editadoManualmente,
    criadoEm: linha.criadoEm,
    atualizadoEm: linha.atualizadoEm,
  };
}

export class RoteiroRepositoryPg implements RoteiroRepository {
  async listar(): Promise<Roteiro[]> {
    const linhas = await db.select().from(roteiros);
    return linhas.map(paraRoteiro);
  }

  async buscarPorId(id: string): Promise<Roteiro | undefined> {
    const [linha] = await db.select().from(roteiros).where(eq(roteiros.id, id));
    return linha ? paraRoteiro(linha) : undefined;
  }

  async listarPorProduto(produtoId: string): Promise<Roteiro[]> {
    const linhas = await db.select().from(roteiros).where(eq(roteiros.produtoId, produtoId));
    return linhas.map(paraRoteiro);
  }

  async listarPorConteudo(conteudoId: string): Promise<Roteiro[]> {
    const linhas = await db.select().from(roteiros).where(eq(roteiros.conteudoId, conteudoId));
    return linhas.map(paraRoteiro);
  }

  async criar(input: RoteiroCreateInput): Promise<Roteiro> {
    // Nova versão = maior versão já existente pro mesmo conteúdo + 1 (PRD seção 7: "permite gerar variação sem perder a anterior").
    const existentes = await this.listarPorConteudo(input.conteudoId);
    const versao = existentes.reduce((maior, r) => Math.max(maior, r.versao), 0) + 1;

    const [linha] = await db
      .insert(roteiros)
      .values({ ...input, versao })
      .returning();
    return paraRoteiro(linha);
  }

  async atualizar(id: string, input: RoteiroUpdateInput): Promise<Roteiro> {
    const [linha] = await db
      .update(roteiros)
      .set({ ...input, editadoManualmente: true, atualizadoEm: new Date().toISOString() })
      .where(eq(roteiros.id, id))
      .returning();
    if (!linha) throw new Error(`Roteiro ${id} não encontrado`);
    return paraRoteiro(linha);
  }
}
