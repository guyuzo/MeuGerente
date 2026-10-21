import type { Conteudo, ConteudoCreateInput, ConteudoRepository, ConteudoStatus, ConteudoUpdateInput } from "@meugerente/shared";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { amostras, conteudos, produtos } from "../db/schema.js";
import { garantirReferencias, NaoEncontradoError, semCamposProtegidos } from "./dono.js";

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

/** Escopado por usuário: toda leitura e escrita filtra por `usuarioId` (PLANO-MULTIUSUARIO.md). */
export class ConteudoRepositoryPg implements ConteudoRepository {
  constructor(private readonly usuarioId: string) {}

  private doUsuario(id: string) {
    return and(eq(conteudos.id, id), eq(conteudos.usuarioId, this.usuarioId));
  }

  private garantirReferencias(dados: object) {
    return garantirReferencias(this.usuarioId, dados, [
      ["produtoId", produtos, "Produto"],
      ["amostraId", amostras, "Amostra"],
    ]);
  }

  async listar(): Promise<Conteudo[]> {
    const linhas = await db.select().from(conteudos).where(eq(conteudos.usuarioId, this.usuarioId));
    return linhas.map(paraConteudo);
  }

  async buscarPorId(id: string): Promise<Conteudo | undefined> {
    const [linha] = await db.select().from(conteudos).where(this.doUsuario(id));
    return linha ? paraConteudo(linha) : undefined;
  }

  async listarPorProduto(produtoId: string): Promise<Conteudo[]> {
    const linhas = await db
      .select()
      .from(conteudos)
      .where(and(eq(conteudos.produtoId, produtoId), eq(conteudos.usuarioId, this.usuarioId)));
    return linhas.map(paraConteudo);
  }

  async criar(input: ConteudoCreateInput): Promise<Conteudo> {
    const dados = semCamposProtegidos(input);
    await this.garantirReferencias(dados);
    const [linha] = await db
      .insert(conteudos)
      .values({ ...dados, usuarioId: this.usuarioId })
      .returning();
    return paraConteudo(linha);
  }

  async atualizar(id: string, input: ConteudoUpdateInput): Promise<Conteudo> {
    const dados = semCamposProtegidos(input);
    await this.garantirReferencias(dados);
    const [linha] = await db
      .update(conteudos)
      .set({ ...dados, atualizadoEm: new Date().toISOString() })
      .where(this.doUsuario(id))
      .returning();
    if (!linha) throw new NaoEncontradoError("Conteúdo não encontrado");
    return paraConteudo(linha);
  }

  async mudarStatus(id: string, status: ConteudoStatus): Promise<Conteudo> {
    const atual = await this.buscarPorId(id);
    if (!atual) throw new NaoEncontradoError("Conteúdo não encontrado");

    const patch: Partial<LinhaConteudo> = { status, atualizadoEm: new Date().toISOString() };
    if (status === "publicado" && !atual.dataPublicacao) {
      patch.dataPublicacao = new Date().toISOString();
    }

    const [linha] = await db.update(conteudos).set(patch).where(this.doUsuario(id)).returning();
    return paraConteudo(linha);
  }
}
