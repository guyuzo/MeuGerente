import { eq, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { limitesUso } from "../db/schema.js";

/**
 * Contador com janela fixa, guardado no Postgres (tabela limites_uso) — em memória não serve na
 * Vercel, onde cada instância da função teria o próprio contador e o freio viraria enfeite.
 */

function inicioDaJanela(janelaMs: number) {
  return sql`now() - make_interval(secs => ${janelaMs / 1000})`;
}

/** Soma 1 tentativa e devolve o total da janela atual (janela vencida recomeça em 1). Atômico. */
export async function contarTentativa(chave: string, janelaMs: number): Promise<number> {
  const vencida = sql`${limitesUso.desde} < ${inicioDaJanela(janelaMs)}`;
  const [linha] = await db
    .insert(limitesUso)
    .values({ chave, quantidade: 1 })
    .onConflictDoUpdate({
      target: limitesUso.chave,
      set: {
        quantidade: sql`case when ${vencida} then 1 else ${limitesUso.quantidade} + 1 end`,
        desde: sql`case when ${vencida} then now() else ${limitesUso.desde} end`,
      },
    })
    .returning({ quantidade: limitesUso.quantidade });
  return linha.quantidade;
}

/** Total da janela atual sem somar nada (0 se a janela já venceu). */
export async function tentativasAtuais(chave: string, janelaMs: number): Promise<number> {
  const [linha] = await db
    .select({ quantidade: limitesUso.quantidade })
    .from(limitesUso)
    .where(sql`${limitesUso.chave} = ${chave} and ${limitesUso.desde} >= ${inicioDaJanela(janelaMs)}`);
  return linha?.quantidade ?? 0;
}

export async function zerarTentativas(chave: string): Promise<void> {
  await db.delete(limitesUso).where(eq(limitesUso.chave, chave));
}
