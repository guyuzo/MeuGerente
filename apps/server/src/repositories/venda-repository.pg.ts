import type { Venda, VendaCreateInput, VendaRepository, VendaUpdateInput } from "@meugerente/shared";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { vendas } from "../db/schema.js";

type LinhaVenda = typeof vendas.$inferSelect;

function paraVenda(linha: LinhaVenda): Venda {
  return {
    id: linha.id,
    tiktokOrderId: linha.tiktokOrderId,
    produtoId: linha.produtoId,
    conteudoId: linha.conteudoId ?? undefined,
    data: linha.data,
    origem: linha.origem,
    statusPedido: linha.statusPedido,
    pedidos: linha.pedidos,
    itens: linha.itens,
    gmv: linha.gmv,
    comissao: linha.comissao,
    comissaoConfirmada: linha.comissaoConfirmada,
    fonte: linha.fonte,
    sincronizadoEm: linha.sincronizadoEm ?? undefined,
    criadoEm: linha.criadoEm,
    atualizadoEm: linha.atualizadoEm,
  };
}

export class VendaRepositoryPg implements VendaRepository {
  async listar(): Promise<Venda[]> {
    const linhas = await db.select().from(vendas);
    return linhas.map(paraVenda);
  }

  async buscarPorId(id: string): Promise<Venda | undefined> {
    const [linha] = await db.select().from(vendas).where(eq(vendas.id, id));
    return linha ? paraVenda(linha) : undefined;
  }

  async buscarPorTiktokOrderId(tiktokOrderId: string): Promise<Venda | undefined> {
    const [linha] = await db.select().from(vendas).where(eq(vendas.tiktokOrderId, tiktokOrderId));
    return linha ? paraVenda(linha) : undefined;
  }

  async listarPorProduto(produtoId: string): Promise<Venda[]> {
    const linhas = await db.select().from(vendas).where(eq(vendas.produtoId, produtoId));
    return linhas.map(paraVenda);
  }

  async criar(input: VendaCreateInput): Promise<Venda> {
    const [linha] = await db.insert(vendas).values(input).returning();
    return paraVenda(linha);
  }

  async atualizar(id: string, input: VendaUpdateInput): Promise<Venda> {
    const [linha] = await db
      .update(vendas)
      .set({ ...input, atualizadoEm: new Date().toISOString() })
      .where(eq(vendas.id, id))
      .returning();
    if (!linha) throw new Error(`Venda ${id} não encontrada`);
    return paraVenda(linha);
  }

  async upsertPorTiktokOrderId(tiktokOrderId: string, input: VendaCreateInput): Promise<Venda> {
    const [linha] = await db
      .insert(vendas)
      .values({ ...input, tiktokOrderId })
      .onConflictDoUpdate({
        target: vendas.tiktokOrderId,
        set: { ...input, tiktokOrderId, atualizadoEm: new Date().toISOString() },
      })
      .returning();
    return paraVenda(linha);
  }
}
