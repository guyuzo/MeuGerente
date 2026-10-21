import type { Roteiro, RoteiroCreateInput, RoteiroRepository, RoteiroUpdateInput } from "@meugerente/shared";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { conteudos, produtos, roteiros } from "../db/schema.js";
import { garantirReferencias, NaoEncontradoError, semCamposProtegidos } from "./dono.js";

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

/** Escopado por usuário: toda leitura e escrita filtra por `usuarioId` (PLANO-MULTIUSUARIO.md). */
export class RoteiroRepositoryPg implements RoteiroRepository {
  constructor(private readonly usuarioId: string) {}

  private doUsuario(id: string) {
    return and(eq(roteiros.id, id), eq(roteiros.usuarioId, this.usuarioId));
  }

  private garantirReferencias(dados: object) {
    return garantirReferencias(this.usuarioId, dados, [
      ["conteudoId", conteudos, "Conteúdo"],
      ["produtoId", produtos, "Produto"],
    ]);
  }

  async listar(): Promise<Roteiro[]> {
    const linhas = await db.select().from(roteiros).where(eq(roteiros.usuarioId, this.usuarioId));
    return linhas.map(paraRoteiro);
  }

  async buscarPorId(id: string): Promise<Roteiro | undefined> {
    const [linha] = await db.select().from(roteiros).where(this.doUsuario(id));
    return linha ? paraRoteiro(linha) : undefined;
  }

  async listarPorProduto(produtoId: string): Promise<Roteiro[]> {
    const linhas = await db
      .select()
      .from(roteiros)
      .where(and(eq(roteiros.produtoId, produtoId), eq(roteiros.usuarioId, this.usuarioId)));
    return linhas.map(paraRoteiro);
  }

  async listarPorConteudo(conteudoId: string): Promise<Roteiro[]> {
    const linhas = await db
      .select()
      .from(roteiros)
      .where(and(eq(roteiros.conteudoId, conteudoId), eq(roteiros.usuarioId, this.usuarioId)));
    return linhas.map(paraRoteiro);
  }

  async criar(input: RoteiroCreateInput): Promise<Roteiro> {
    const dados = semCamposProtegidos(input);
    await this.garantirReferencias(dados);

    // Nova versão = maior versão já existente pro mesmo conteúdo + 1 (PRD seção 7: "permite gerar variação sem perder a anterior").
    const existentes = await this.listarPorConteudo(dados.conteudoId);
    const versao = existentes.reduce((maior, r) => Math.max(maior, r.versao), 0) + 1;

    const [linha] = await db
      .insert(roteiros)
      .values({ ...dados, versao, usuarioId: this.usuarioId })
      .returning();
    return paraRoteiro(linha);
  }

  async atualizar(id: string, input: RoteiroUpdateInput): Promise<Roteiro> {
    const dados = semCamposProtegidos(input);
    await this.garantirReferencias(dados);
    const [linha] = await db
      .update(roteiros)
      .set({ ...dados, editadoManualmente: true, atualizadoEm: new Date().toISOString() })
      .where(this.doUsuario(id))
      .returning();
    if (!linha) throw new NaoEncontradoError("Roteiro não encontrado");
    return paraRoteiro(linha);
  }
}
