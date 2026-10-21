import type {
  Categoria,
  CategoriaCor,
  CategoriaCreateInput,
  CategoriaRepository,
  CategoriaUpdateInput,
} from "@meugerente/shared";
import { and, asc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { categorias } from "../db/schema.js";
import { NaoEncontradoError, semCamposProtegidos } from "./dono.js";

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

/** Escopado por usuário: toda leitura e escrita filtra por `usuarioId` (PLANO-MULTIUSUARIO.md). */
export class CategoriaRepositoryPg implements CategoriaRepository {
  constructor(private readonly usuarioId: string) {}

  private doUsuario(id: string) {
    return and(eq(categorias.id, id), eq(categorias.usuarioId, this.usuarioId));
  }

  async listar(): Promise<Categoria[]> {
    const linhas = await db
      .select()
      .from(categorias)
      .where(eq(categorias.usuarioId, this.usuarioId))
      .orderBy(asc(categorias.nome));
    return linhas.map(paraCategoria);
  }

  async criar(input: CategoriaCreateInput): Promise<Categoria> {
    const [linha] = await db
      .insert(categorias)
      .values({ ...semCamposProtegidos(input), usuarioId: this.usuarioId })
      .returning();
    return paraCategoria(linha);
  }

  async atualizar(id: string, input: CategoriaUpdateInput): Promise<Categoria> {
    const [linha] = await db.update(categorias).set(semCamposProtegidos(input)).where(this.doUsuario(id)).returning();
    if (!linha) throw new NaoEncontradoError("Categoria não encontrada");
    return paraCategoria(linha);
  }

  async deletar(id: string): Promise<void> {
    await db.delete(categorias).where(this.doUsuario(id));
  }
}
