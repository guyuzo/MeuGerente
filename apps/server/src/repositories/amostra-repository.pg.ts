import type { Amostra, AmostraCreateInput, AmostraRepository, AmostraStatus, AmostraUpdateInput } from "@meugerente/shared";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { amostras } from "../db/schema.js";

type LinhaAmostra = typeof amostras.$inferSelect;

function paraAmostra(linha: LinhaAmostra): Amostra {
  return {
    id: linha.id,
    produtoId: linha.produtoId,
    status: linha.status as AmostraStatus,
    origem: linha.origem,
    custo: linha.custo,
    dataSolicitacao: linha.dataSolicitacao ?? undefined,
    dataRecebimento: linha.dataRecebimento ?? undefined,
    publicadoEm: linha.publicadoEm ?? undefined,
    prazoConteudo: linha.prazoConteudo ?? undefined,
    codigoRastreio: linha.codigoRastreio ?? undefined,
    observacao: linha.observacao ?? undefined,
    colunaCustomizadaId: linha.colunaCustomizadaId ?? undefined,
    criadoEm: linha.criadoEm,
    atualizadoEm: linha.atualizadoEm,
  };
}

export class AmostraRepositoryPg implements AmostraRepository {
  async listar(): Promise<Amostra[]> {
    const linhas = await db.select().from(amostras);
    return linhas.map(paraAmostra);
  }

  async buscarPorId(id: string): Promise<Amostra | undefined> {
    const [linha] = await db.select().from(amostras).where(eq(amostras.id, id));
    return linha ? paraAmostra(linha) : undefined;
  }

  async listarPorProduto(produtoId: string): Promise<Amostra[]> {
    const linhas = await db.select().from(amostras).where(eq(amostras.produtoId, produtoId));
    return linhas.map(paraAmostra);
  }

  async criar(input: AmostraCreateInput): Promise<Amostra> {
    const [linha] = await db.insert(amostras).values(input).returning();
    return paraAmostra(linha);
  }

  async atualizar(id: string, input: AmostraUpdateInput): Promise<Amostra> {
    const [linha] = await db
      .update(amostras)
      .set({ ...input, atualizadoEm: new Date().toISOString() })
      .where(eq(amostras.id, id))
      .returning();
    if (!linha) throw new Error(`Amostra ${id} não encontrada`);
    return paraAmostra(linha);
  }

  async mudarStatus(id: string, status: AmostraStatus): Promise<Amostra> {
    const atual = await this.buscarPorId(id);
    if (!atual) throw new Error(`Amostra ${id} não encontrada`);

    // Mudar de status (arrastar pra coluna fixa) sempre tira a amostra de uma coluna customizada.
    const patch: Partial<LinhaAmostra> = { status, colunaCustomizadaId: null, atualizadoEm: new Date().toISOString() };
    if (status === "publicado" && !atual.publicadoEm) {
      patch.publicadoEm = new Date().toISOString();
    }

    const [linha] = await db.update(amostras).set(patch).where(eq(amostras.id, id)).returning();
    return paraAmostra(linha);
  }
}
