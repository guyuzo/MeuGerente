import type { Venda, VendaCreateInput, VendaRepository, VendaUpdateInput } from "@meugerente/shared";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { conteudos, produtos, vendas } from "../db/schema.js";
import { garantirReferencias, NaoEncontradoError, semCamposProtegidos } from "./dono.js";

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

/** Escopado por usuário: toda leitura e escrita filtra por `usuarioId` (PLANO-MULTIUSUARIO.md). */
export class VendaRepositoryPg implements VendaRepository {
  constructor(private readonly usuarioId: string) {}

  private doUsuario(id: string) {
    return and(eq(vendas.id, id), eq(vendas.usuarioId, this.usuarioId));
  }

  private garantirReferencias(dados: object) {
    return garantirReferencias(this.usuarioId, dados, [
      ["produtoId", produtos, "Produto"],
      ["conteudoId", conteudos, "Conteúdo"],
    ]);
  }

  async listar(): Promise<Venda[]> {
    const linhas = await db.select().from(vendas).where(eq(vendas.usuarioId, this.usuarioId));
    return linhas.map(paraVenda);
  }

  async buscarPorId(id: string): Promise<Venda | undefined> {
    const [linha] = await db.select().from(vendas).where(this.doUsuario(id));
    return linha ? paraVenda(linha) : undefined;
  }

  async buscarPorTiktokOrderId(tiktokOrderId: string): Promise<Venda | undefined> {
    const [linha] = await db
      .select()
      .from(vendas)
      .where(and(eq(vendas.tiktokOrderId, tiktokOrderId), eq(vendas.usuarioId, this.usuarioId)));
    return linha ? paraVenda(linha) : undefined;
  }

  async listarPorProduto(produtoId: string): Promise<Venda[]> {
    const linhas = await db
      .select()
      .from(vendas)
      .where(and(eq(vendas.produtoId, produtoId), eq(vendas.usuarioId, this.usuarioId)));
    return linhas.map(paraVenda);
  }

  async criar(input: VendaCreateInput): Promise<Venda> {
    const dados = semCamposProtegidos(input);
    await this.garantirReferencias(dados);
    const [linha] = await db
      .insert(vendas)
      .values({ ...dados, usuarioId: this.usuarioId })
      .returning();
    return paraVenda(linha);
  }

  async atualizar(id: string, input: VendaUpdateInput): Promise<Venda> {
    const dados = semCamposProtegidos(input);
    await this.garantirReferencias(dados);
    const [linha] = await db
      .update(vendas)
      .set({ ...dados, atualizadoEm: new Date().toISOString() })
      .where(this.doUsuario(id))
      .returning();
    if (!linha) throw new NaoEncontradoError("Venda não encontrada");
    return paraVenda(linha);
  }

  /**
   * Chamado só pela importação, com `produtoId` já resolvido entre os produtos do próprio usuário
   * — por isso não confere dono a cada linha (seriam milhares de consultas extras por planilha).
   */
  async upsertPorTiktokOrderId(tiktokOrderId: string, input: VendaCreateInput): Promise<Venda> {
    const dados = semCamposProtegidos(input);
    const [linha] = await db
      .insert(vendas)
      .values({ ...dados, tiktokOrderId, usuarioId: this.usuarioId })
      .onConflictDoUpdate({
        target: [vendas.usuarioId, vendas.tiktokOrderId],
        set: { ...dados, tiktokOrderId, atualizadoEm: new Date().toISOString() },
      })
      .returning();
    return paraVenda(linha);
  }
}
