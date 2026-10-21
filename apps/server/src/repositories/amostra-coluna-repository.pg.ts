import type {
  AmostraColuna,
  AmostraColunaCreateInput,
  AmostraColunaRepository,
  AmostraColunaUpdateInput,
} from "@meugerente/shared";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { amostraColunas } from "../db/schema.js";
import { NaoEncontradoError, semCamposProtegidos } from "./dono.js";

type LinhaColuna = typeof amostraColunas.$inferSelect;

function paraColuna(linha: LinhaColuna): AmostraColuna {
  return {
    id: linha.id,
    nome: linha.nome,
    cor: linha.cor,
    ordem: linha.ordem,
    criadoEm: linha.criadoEm,
  };
}

/** Escopado por usuário: toda leitura e escrita filtra por `usuarioId` (PLANO-MULTIUSUARIO.md). */
export class AmostraColunaRepositoryPg implements AmostraColunaRepository {
  constructor(private readonly usuarioId: string) {}

  private doUsuario(id: string) {
    return and(eq(amostraColunas.id, id), eq(amostraColunas.usuarioId, this.usuarioId));
  }

  async listar(): Promise<AmostraColuna[]> {
    const linhas = await db
      .select()
      .from(amostraColunas)
      .where(eq(amostraColunas.usuarioId, this.usuarioId))
      .orderBy(asc(amostraColunas.ordem));
    return linhas.map(paraColuna);
  }

  async criar(input: AmostraColunaCreateInput): Promise<AmostraColuna> {
    const [{ maxOrdem }] = await db
      .select({ maxOrdem: sql<number>`coalesce(max(${amostraColunas.ordem}), -1)` })
      .from(amostraColunas)
      .where(eq(amostraColunas.usuarioId, this.usuarioId));
    const [linha] = await db
      .insert(amostraColunas)
      .values({ ...semCamposProtegidos(input), ordem: maxOrdem + 1, usuarioId: this.usuarioId })
      .returning();
    return paraColuna(linha);
  }

  async atualizar(id: string, input: AmostraColunaUpdateInput): Promise<AmostraColuna> {
    const [linha] = await db
      .update(amostraColunas)
      .set(semCamposProtegidos(input))
      .where(this.doUsuario(id))
      .returning();
    if (!linha) throw new NaoEncontradoError("Coluna não encontrada");
    return paraColuna(linha);
  }

  async deletar(id: string): Promise<void> {
    await db.delete(amostraColunas).where(this.doUsuario(id));
  }
}
