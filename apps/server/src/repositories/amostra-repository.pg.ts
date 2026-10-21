import type { Amostra, AmostraCreateInput, AmostraRepository, AmostraStatus, AmostraUpdateInput } from "@meugerente/shared";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { amostraColunas, amostras, produtos } from "../db/schema.js";
import { garantirReferencias, NaoEncontradoError, semCamposProtegidos } from "./dono.js";

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

/** Escopado por usuário: toda leitura e escrita filtra por `usuarioId` (PLANO-MULTIUSUARIO.md). */
export class AmostraRepositoryPg implements AmostraRepository {
  constructor(private readonly usuarioId: string) {}

  private doUsuario(id: string) {
    return and(eq(amostras.id, id), eq(amostras.usuarioId, this.usuarioId));
  }

  private garantirReferencias(dados: object) {
    return garantirReferencias(this.usuarioId, dados, [
      ["produtoId", produtos, "Produto"],
      ["colunaCustomizadaId", amostraColunas, "Coluna"],
    ]);
  }

  async listar(): Promise<Amostra[]> {
    const linhas = await db.select().from(amostras).where(eq(amostras.usuarioId, this.usuarioId));
    return linhas.map(paraAmostra);
  }

  async buscarPorId(id: string): Promise<Amostra | undefined> {
    const [linha] = await db.select().from(amostras).where(this.doUsuario(id));
    return linha ? paraAmostra(linha) : undefined;
  }

  async listarPorProduto(produtoId: string): Promise<Amostra[]> {
    const linhas = await db
      .select()
      .from(amostras)
      .where(and(eq(amostras.produtoId, produtoId), eq(amostras.usuarioId, this.usuarioId)));
    return linhas.map(paraAmostra);
  }

  async criar(input: AmostraCreateInput): Promise<Amostra> {
    const dados = semCamposProtegidos(input);
    await this.garantirReferencias(dados);
    const [linha] = await db
      .insert(amostras)
      .values({ ...dados, usuarioId: this.usuarioId })
      .returning();
    return paraAmostra(linha);
  }

  async atualizar(id: string, input: AmostraUpdateInput): Promise<Amostra> {
    const dados = semCamposProtegidos(input);
    await this.garantirReferencias(dados);
    const [linha] = await db
      .update(amostras)
      .set({ ...dados, atualizadoEm: new Date().toISOString() })
      .where(this.doUsuario(id))
      .returning();
    if (!linha) throw new NaoEncontradoError("Amostra não encontrada");
    return paraAmostra(linha);
  }

  async mudarStatus(id: string, status: AmostraStatus): Promise<Amostra> {
    const atual = await this.buscarPorId(id);
    if (!atual) throw new NaoEncontradoError("Amostra não encontrada");

    // Mudar de status (arrastar pra coluna fixa) sempre tira a amostra de uma coluna customizada.
    const patch: Partial<LinhaAmostra> = { status, colunaCustomizadaId: null, atualizadoEm: new Date().toISOString() };
    if (status === "publicado" && !atual.publicadoEm) {
      patch.publicadoEm = new Date().toISOString();
    }

    const [linha] = await db.update(amostras).set(patch).where(this.doUsuario(id)).returning();
    return paraAmostra(linha);
  }
}
