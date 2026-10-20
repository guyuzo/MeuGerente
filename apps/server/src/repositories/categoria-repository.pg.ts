import type {
  Categoria,
  CategoriaCor,
  CategoriaCreateInput,
  CategoriaRepository,
  CategoriaUpdateInput,
} from "@meugerente/shared";
import { asc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { categorias } from "../db/schema.js";

type LinhaCategoria = typeof categorias.$inferSelect;

function paraCategoria(linha: LinhaCategoria): Categoria {
  return {
    id: linha.id,
    nome: linha.nome,
    // O enum no banco ainda tem os tons antigos (success/warning/error/accent) por compatibilidade
    // com migrations já aplicadas — a partir daqui só se escreve com a paleta nova.
    cor: linha.cor as CategoriaCor,
    emoji: linha.emoji ?? undefined,
    criadoEm: linha.criadoEm,
  };
}

export class CategoriaRepositoryPg implements CategoriaRepository {
  async listar(): Promise<Categoria[]> {
    const linhas = await db.select().from(categorias).orderBy(asc(categorias.nome));
    return linhas.map(paraCategoria);
  }

  async criar(input: CategoriaCreateInput): Promise<Categoria> {
    const [linha] = await db.insert(categorias).values(input).returning();
    return paraCategoria(linha);
  }

  async atualizar(id: string, input: CategoriaUpdateInput): Promise<Categoria> {
    const [linha] = await db.update(categorias).set(input).where(eq(categorias.id, id)).returning();
    if (!linha) throw new Error(`Categoria ${id} não encontrada`);
    return paraCategoria(linha);
  }

  async deletar(id: string): Promise<void> {
    await db.delete(categorias).where(eq(categorias.id, id));
  }
}
