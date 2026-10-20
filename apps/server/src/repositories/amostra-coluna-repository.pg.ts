import type {
  AmostraColuna,
  AmostraColunaCreateInput,
  AmostraColunaRepository,
  AmostraColunaUpdateInput,
} from "@meugerente/shared";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { amostraColunas } from "../db/schema.js";

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

export class AmostraColunaRepositoryPg implements AmostraColunaRepository {
  async listar(): Promise<AmostraColuna[]> {
    const linhas = await db.select().from(amostraColunas).orderBy(asc(amostraColunas.ordem));
    return linhas.map(paraColuna);
  }

  async criar(input: AmostraColunaCreateInput): Promise<AmostraColuna> {
    const [{ maxOrdem }] = await db
      .select({ maxOrdem: sql<number>`coalesce(max(${amostraColunas.ordem}), -1)` })
      .from(amostraColunas);
    const [linha] = await db
      .insert(amostraColunas)
      .values({ ...input, ordem: maxOrdem + 1 })
      .returning();
    return paraColuna(linha);
  }

  async atualizar(id: string, input: AmostraColunaUpdateInput): Promise<AmostraColuna> {
    const [linha] = await db.update(amostraColunas).set(input).where(eq(amostraColunas.id, id)).returning();
    if (!linha) throw new Error(`Coluna ${id} não encontrada`);
    return paraColuna(linha);
  }

  async deletar(id: string): Promise<void> {
    await db.delete(amostraColunas).where(eq(amostraColunas.id, id));
  }
}
