import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { db } from "../db/client.js";
import { usuarios } from "../db/schema.js";

const NOME_COOKIE = "meugerente_sessao";
const DURACAO_SESSAO_MS = 7 * 24 * 60 * 60 * 1000;

function segredo(): string {
  const valor = process.env.SESSION_SECRET;
  if (!valor || valor.length < 32) {
    throw new Error("SESSION_SECRET não definida (mínimo 32 caracteres). Veja apps/server/.env.example.");
  }
  return valor;
}

function derivar(senha: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(senha, salt, 64, (erro, chave) => (erro ? reject(erro) : resolve(chave)));
  });
}

export async function hashSenha(senha: string): Promise<string> {
  const salt = randomBytes(16);
  const chave = await derivar(senha, salt);
  return `scrypt$${salt.toString("hex")}$${chave.toString("hex")}`;
}

export async function verificarSenha(senha: string, hashGuardado: string): Promise<boolean> {
  const [algoritmo, saltHex, chaveHex] = hashGuardado.split("$");
  if (algoritmo !== "scrypt" || !saltHex || !chaveHex) return false;
  const esperado = Buffer.from(chaveHex, "hex");
  const calculado = await derivar(senha, Buffer.from(saltHex, "hex"));
  return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}

/** Token aleatório de uso único (link de redefinir senha). No banco vai só o hash — vazamento da tabela não dá acesso. */
export function gerarTokenAleatorio(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function assinar(corpo: string): string {
  return createHmac("sha256", segredo()).update(corpo).digest("base64url");
}

/**
 * Sessão: "<usuarioId>.<versaoSessao>.<expira em ms>.<assinatura HMAC>". A versão vem de
 * `usuarios.versao_sessao` — trocar a senha incrementa ela e derruba toda sessão aberta.
 * Trocar SESSION_SECRET também derruba todas.
 */
function criarToken(usuarioId: string, versaoSessao: number): string {
  const corpo = `${usuarioId}.${versaoSessao}.${Date.now() + DURACAO_SESSAO_MS}`;
  return `${corpo}.${assinar(corpo)}`;
}

function lerToken(token: string): { usuarioId: string; versaoSessao: number } | undefined {
  const partes = token.split(".");
  if (partes.length !== 4) return undefined;
  const [usuarioId, versao, expira, assinatura] = partes;
  const esperada = assinar(`${usuarioId}.${versao}.${expira}`);
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return undefined;
  if (Number(expira) < Date.now()) return undefined;
  return { usuarioId, versaoSessao: Number(versao) };
}

function lerCookie(req: Request): string | undefined {
  for (const par of (req.headers.cookie ?? "").split(";")) {
    const [nome, ...resto] = par.trim().split("=");
    if (nome === NOME_COOKIE) return decodeURIComponent(resto.join("="));
  }
  return undefined;
}

/** Usuário da sessão, conferido no banco: conta apagada ou senha trocada depois do login invalidam o cookie. */
export async function usuarioDaRequisicao(req: Request): Promise<{ id: string; email: string } | undefined> {
  const token = lerCookie(req);
  const sessao = token ? lerToken(token) : undefined;
  if (!sessao) return undefined;

  const [usuario] = await db
    .select({ id: usuarios.id, email: usuarios.email, versaoSessao: usuarios.versaoSessao })
    .from(usuarios)
    .where(eq(usuarios.id, sessao.usuarioId));
  if (!usuario || usuario.versaoSessao !== sessao.versaoSessao) return undefined;
  return { id: usuario.id, email: usuario.email };
}

export function iniciarSessao(res: Response, usuario: { id: string; versaoSessao: number }): void {
  res.cookie(NOME_COOKIE, criarToken(usuario.id, usuario.versaoSessao), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: DURACAO_SESSAO_MS,
    path: "/",
  });
}

export function encerrarSessao(res: Response): void {
  res.clearCookie(NOME_COOKIE, { path: "/" });
}

/** Barra toda rota /api que não seja de login com 401 e deixa o dono da sessão em `res.locals.usuarioId`. */
export const exigirLogin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  usuarioDaRequisicao(req)
    .then((usuario) => {
      if (!usuario) return void res.status(401).json({ erro: "nao_autenticado", mensagem: "Faça login para continuar." });
      res.locals.usuarioId = usuario.id;
      next();
    })
    .catch(next);
};
