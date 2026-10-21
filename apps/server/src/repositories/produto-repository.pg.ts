import type { Produto, ProdutoCreateInput, ProdutoRepository, ProdutoStatus, ProdutoUpdateInput } from "@meugerente/shared";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { categorias, produtos } from "../db/schema.js";
import { garantirReferencias, NaoEncontradoError, semCamposProtegidos } from "./dono.js";

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

/** Escopado por usuário: toda leitura e escrita filtra por `usuarioId` (PLANO-MULTIUSUARIO.md). */
export class ProdutoRepositoryPg implements ProdutoRepository {
  constructor(private readonly usuarioId: string) {}

  private doUsuario(id: string) {
    return and(eq(produtos.id, id), eq(produtos.usuarioId, this.usuarioId));
  }

  async listar(): Promise<Produto[]> {
    const linhas = await db.select().from(produtos).where(eq(produtos.usuarioId, this.usuarioId));
    return linhas.map(paraProduto);
  }

  async buscarPorId(id: string): Promise<Produto | undefined> {
    const [linha] = await db.select().from(produtos).where(this.doUsuario(id));
    return linha ? paraProduto(linha) : undefined;
  }

  async criar(input: ProdutoCreateInput): Promise<Produto> {
    const dados = semCamposProtegidos(input);
    await garantirReferencias(this.usuarioId, dados, [["categoriaId", categorias, "Categoria"]]);
    const [linha] = await db
      .insert(produtos)
      .values({ ...dados, usuarioId: this.usuarioId })
      .returning();
    return paraProduto(linha);
  }

  async atualizar(id: string, input: ProdutoUpdateInput): Promise<Produto> {
    const dados = semCamposProtegidos(input);
    await garantirReferencias(this.usuarioId, dados, [["categoriaId", categorias, "Categoria"]]);
    const [linha] = await db
      .update(produtos)
      .set({ ...dados, atualizadoEm: new Date().toISOString() })
      .where(this.doUsuario(id))
      .returning();
    if (!linha) throw new NaoEncontradoError("Produto não encontrado");
    return paraProduto(linha);
  }

  async mudarStatus(id: string, status: ProdutoStatus): Promise<Produto> {
    const [linha] = await db
      .update(produtos)
      .set({ status, atualizadoEm: new Date().toISOString() })
      .where(this.doUsuario(id))
      .returning();
    if (!linha) throw new NaoEncontradoError("Produto não encontrado");
    return paraProduto(linha);
  }
}
