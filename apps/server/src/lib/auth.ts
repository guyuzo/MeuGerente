import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";

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

function assinar(corpo: string): string {
  return createHmac("sha256", segredo()).update(corpo).digest("base64url");
}

/** Sessão sem estado: "<usuarioId>.<expira em ms>.<assinatura HMAC>" — trocar SESSION_SECRET derruba todas as sessões. */
function criarToken(usuarioId: string): string {
  const corpo = `${usuarioId}.${Date.now() + DURACAO_SESSAO_MS}`;
  return `${corpo}.${assinar(corpo)}`;
}

function lerToken(token: string): { usuarioId: string } | undefined {
  const partes = token.split(".");
  if (partes.length !== 3) return undefined;
  const [usuarioId, expira, assinatura] = partes;
  const esperada = assinar(`${usuarioId}.${expira}`);
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return undefined;
  if (Number(expira) < Date.now()) return undefined;
  return { usuarioId };
}

function lerCookie(req: Request): string | undefined {
  for (const par of (req.headers.cookie ?? "").split(";")) {
    const [nome, ...resto] = par.trim().split("=");
    if (nome === NOME_COOKIE) return decodeURIComponent(resto.join("="));
  }
  return undefined;
}

export function usuarioDaRequisicao(req: Request): { usuarioId: string } | undefined {
  const token = lerCookie(req);
  return token ? lerToken(token) : undefined;
}

export function iniciarSessao(res: Response, usuarioId: string): void {
  res.cookie(NOME_COOKIE, criarToken(usuarioId), {
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

/** Barra toda rota /api que não seja de login com 401. */
export const exigirLogin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  if (!usuarioDaRequisicao(req)) return void res.status(401).json({ erro: "nao_autenticado", mensagem: "Faça login para continuar." });
  next();
};

/** Freio simples contra tentativa de senha em sequência: 5 falhas por IP a cada 15 minutos. */
const falhas = new Map<string, { quantidade: number; desde: number }>();
const JANELA_MS = 15 * 60 * 1000;
const MAX_FALHAS = 5;

export function loginBloqueado(ip: string): boolean {
  const registro = falhas.get(ip);
  if (!registro) return false;
  if (Date.now() - registro.desde > JANELA_MS) {
    falhas.delete(ip);
    return false;
  }
  return registro.quantidade >= MAX_FALHAS;
}

export function registrarFalhaDeLogin(ip: string): void {
  const registro = falhas.get(ip);
  if (!registro || Date.now() - registro.desde > JANELA_MS) falhas.set(ip, { quantidade: 1, desde: Date.now() });
  else registro.quantidade++;
}

export function limparFalhasDeLogin(ip: string): void {
  falhas.delete(ip);
}
