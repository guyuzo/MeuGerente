import type { Conteudo, ConteudoCreateInput, ConteudoRepository, ConteudoStatus, ConteudoUpdateInput } from "@meugerente/shared";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { conteudos } from "../db/schema.js";

type LinhaConteudo = typeof conteudos.$inferSelect;

function paraConteudo(linha: LinhaConteudo): Conteudo {
  return {
    id: linha.id,
    produtoId: linha.produtoId,
    amostraId: linha.amostraId ?? undefined,
    titulo: linha.titulo,
    formato: linha.formato,
    status: linha.status,
    dataPrevista: linha.dataPrevista ?? undefined,
    dataPublicacao: linha.dataPublicacao ?? undefined,
    linkPublicacao: linha.linkPublicacao ?? undefined,
    criadoEm: linha.criadoEm,
    atualizadoEm: linha.atualizadoEm,
  };
}

export class ConteudoRepositoryPg implements ConteudoRepository {
  async listar(): Promise<Conteudo[]> {
    const linhas = await db.select().from(conteudos);
    return linhas.map(paraConteudo);
  }

  async buscarPorId(id: string): Promise<Conteudo | undefined> {
    const [linha] = await db.select().from(conteudos).where(eq(conteudos.id, id));
    return linha ? paraConteudo(linha) : undefined;
  }

  async listarPorProduto(produtoId: string): Promise<Conteudo[]> {
    const linhas = await db.select().from(conteudos).where(eq(conteudos.produtoId, produtoId));
    return linhas.map(paraConteudo);
  }

  async criar(input: ConteudoCreateInput): Promise<Conteudo> {
    const [linha] = await db.insert(conteudos).values(input).returning();
    return paraConteudo(linha);
  }

  async atualizar(id: string, input: ConteudoUpdateInput): Promise<Conteudo> {
    const [linha] = await db
      .update(conteudos)
      .set({ ...input, atualizadoEm: new Date().toISOString() })
      .where(eq(conteudos.id, id))
      .returning();
    if (!linha) throw new Error(`Conteúdo ${id} não encontrado`);
    return paraConteudo(linha);
  }

  async mudarStatus(id: string, status: ConteudoStatus): Promise<Conteudo> {
    const atual = await this.buscarPorId(id);
    if (!atual) throw new Error(`Conteúdo ${id} não encontrado`);

    const patch: Partial<LinhaConteudo> = { status, atualizadoEm: new Date().toISOString() };
    if (status === "publicado" && !atual.dataPublicacao) {
      patch.dataPublicacao = new Date().toISOString();
    }

    const [linha] = await db.update(conteudos).set(patch).where(eq(conteudos.id, id)).returning();
    return paraConteudo(linha);
  }
}
