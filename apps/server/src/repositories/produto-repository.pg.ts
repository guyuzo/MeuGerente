import type { Produto, ProdutoCreateInput, ProdutoRepository, ProdutoStatus, ProdutoUpdateInput } from "@meugerente/shared";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { produtos } from "../db/schema.js";

type LinhaProduto = typeof produtos.$inferSelect;

function paraProduto(linha: LinhaProduto): Produto {
  return {
    id: linha.id,
    tiktokProductId: linha.tiktokProductId ?? undefined,
    nomeImportado: linha.nomeImportado ?? undefined,
    fonte: linha.fonte,
    sincronizadoEm: linha.sincronizadoEm ?? undefined,
    nome: linha.nome,
    emoji: linha.emoji ?? undefined,
    loja: linha.loja ?? undefined,
    categoriaId: linha.categoriaId ?? undefined,
    linkTiktok: linha.linkTiktok ?? undefined,
    imagemUrl: linha.imagemUrl ?? undefined,
    preco: linha.preco ?? undefined,
    comissaoPct: linha.comissaoPct ?? undefined,
    comissaoValor: linha.comissaoValor ?? undefined,
    status: linha.status,
    notaPotencial: linha.notaPotencial ?? undefined,
    observacao: linha.observacao ?? undefined,
    arquivado: linha.arquivado,
    criadoEm: linha.criadoEm,
    atualizadoEm: linha.atualizadoEm,
  };
}

export class ProdutoRepositoryPg implements ProdutoRepository {
  async listar(): Promise<Produto[]> {
    const linhas = await db.select().from(produtos);
    return linhas.map(paraProduto);
  }

  async buscarPorId(id: string): Promise<Produto | undefined> {
    const [linha] = await db.select().from(produtos).where(eq(produtos.id, id));
    return linha ? paraProduto(linha) : undefined;
  }

  async criar(input: ProdutoCreateInput): Promise<Produto> {
    const [linha] = await db.insert(produtos).values(input).returning();
    return paraProduto(linha);
  }

  async atualizar(id: string, input: ProdutoUpdateInput): Promise<Produto> {
    const [linha] = await db
      .update(produtos)
      .set({ ...input, atualizadoEm: new Date().toISOString() })
      .where(eq(produtos.id, id))
      .returning();
    if (!linha) throw new Error(`Produto ${id} não encontrado`);
    return paraProduto(linha);
  }

  async mudarStatus(id: string, status: ProdutoStatus): Promise<Produto> {
    const [linha] = await db
      .update(produtos)
      .set({ status, atualizadoEm: new Date().toISOString() })
      .where(eq(produtos.id, id))
      .returning();
    if (!linha) throw new Error(`Produto ${id} não encontrado`);
    return paraProduto(linha);
  }
}
