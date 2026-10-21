import "dotenv/config";
import { eq, isNull } from "drizzle-orm";
import { db } from "./client.js";
import {
  amostraColunas,
  amostras,
  categorias,
  conteudos,
  integracoes,
  metas,
  produtos,
  roteiros,
  sincronizacoes,
  usuarios,
  vendas,
} from "./schema.js";

/**
 * Passo único da virada pra multiusuário (PLANO-MULTIUSUARIO.md, etapa 1): todo registro criado
 * antes de existir dono passa a ser do usuário informado. Idempotente — só mexe em linha sem dono.
 * Uso: npm run db:atribuir-dono --workspace=apps/server -- email@exemplo.com
 */
const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Uso: npm run db:atribuir-dono --workspace=apps/server -- email@exemplo.com");
  process.exit(1);
}

const [usuario] = await db.select().from(usuarios).where(eq(usuarios.email, email));
if (!usuario) {
  console.error(`Usuário ${email} não existe.`);
  process.exit(1);
}

const tabelas = { categorias, produtos, amostraColunas, amostras, conteudos, roteiros, vendas, metas, integracoes, sincronizacoes };

await db.transaction(async (tx) => {
  for (const [nome, tabela] of Object.entries(tabelas)) {
    const atualizadas = await tx
      .update(tabela)
      .set({ usuarioId: usuario.id })
      .where(isNull(tabela.usuarioId))
      .returning({ id: tabela.id });
    console.log(`${nome}: ${atualizadas.length} linha(s) atribuída(s) a ${email}`);
  }
});
process.exit(0);
