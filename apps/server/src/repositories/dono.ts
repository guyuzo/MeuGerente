import { and, eq } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { db } from "../db/client.js";

/**
 * Registro que não existe OU é de outro usuário. As duas situações respondem igual (404), pra
 * ninguém descobrir por tentativa quais ids existem em outras contas.
 */
export class NaoEncontradoError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "NaoEncontradoError";
  }
}

type TabelaComDono = PgTable & { id: PgColumn; usuarioId: PgColumn };

/**
 * Antes de gravar uma referência (amostra → produto, conteúdo → amostra...), confere que o alvo é
 * do mesmo usuário. Sem isso, a conta B poderia pendurar dado dela num produto da conta A.
 */
export async function garantirDono(usuarioId: string, tabela: TabelaComDono, id: unknown, descricao: string): Promise<void> {
  if (id === undefined || id === null) return;
  if (typeof id !== "string" || !id) throw new NaoEncontradoError(`${descricao} não encontrado(a)`);
  const [linha] = await db
    .select({ id: tabela.id })
    .from(tabela)
    .where(and(eq(tabela.id, id), eq(tabela.usuarioId, usuarioId)));
  if (!linha) throw new NaoEncontradoError(`${descricao} não encontrado(a)`);
}

/**
 * Confere toda referência presente no corpo — lido como objeto solto de propósito: o tipo de
 * update pode não declarar `produtoId`, mas o cliente pode mandar mesmo assim, e o `set` gravaria.
 */
export async function garantirReferencias(
  usuarioId: string,
  dados: object,
  referencias: [campo: string, tabela: TabelaComDono, descricao: string][],
): Promise<void> {
  for (const [campo, tabela, descricao] of referencias) {
    await garantirDono(usuarioId, tabela, (dados as Record<string, unknown>)[campo], descricao);
  }
}

/**
 * As rotas repassam o corpo da requisição direto pro repositório: tira daqui o que o cliente nunca
 * pode definir (id, dono, datas de controle). O dono certo é sempre o da sessão.
 */
export function semCamposProtegidos<T extends object>(input: T): T {
  const { id: _id, usuarioId: _dono, criadoEm: _criado, atualizadoEm: _atualizado, ...resto } = input as Record<string, unknown>;
  return resto as T;
}
