import "dotenv/config";
import { eq } from "drizzle-orm";
import { hashSenha } from "../lib/auth.js";
import { db } from "./client.js";
import { usuarios } from "./schema.js";

/** Uso: npm run user:create --workspace=apps/server -- email@exemplo.com "senha-com-8-ou-mais-caracteres" (se o e-mail já existe, troca a senha) */
const [emailBruto, senha] = process.argv.slice(2);
const email = emailBruto?.trim().toLowerCase();

if (!email || !email.includes("@") || !senha) {
  console.error('Uso: npm run user:create --workspace=apps/server -- email@exemplo.com "senha"');
  process.exit(1);
}
if (senha.length < 8) {
  console.error("A senha precisa ter pelo menos 8 caracteres.");
  process.exit(1);
}

const senhaHash = await hashSenha(senha);
const [existente] = await db.select().from(usuarios).where(eq(usuarios.email, email));

if (existente) {
  await db.update(usuarios).set({ senhaHash }).where(eq(usuarios.id, existente.id));
  console.log(`Senha de ${email} atualizada.`);
} else {
  await db.insert(usuarios).values({ email, senhaHash });
  console.log(`Usuário ${email} criado.`);
}
process.exit(0);
