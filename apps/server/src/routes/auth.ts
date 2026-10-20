import { eq } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db/client.js";
import { usuarios } from "../db/schema.js";
import { asyncHandler } from "../lib/async-handler.js";
import {
  encerrarSessao,
  iniciarSessao,
  limparFalhasDeLogin,
  loginBloqueado,
  registrarFalhaDeLogin,
  usuarioDaRequisicao,
  verificarSenha,
} from "../lib/auth.js";

export const authRouter = Router();

// Hash de uma senha qualquer, usado pra gastar o mesmo tempo quando o e-mail não existe (não vaza quem tem conta).
const HASH_FALSO = "scrypt$00000000000000000000000000000000$" + "00".repeat(64);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const ip = req.ip ?? "desconhecido";
    if (loginBloqueado(ip)) {
      return void res.status(429).json({ erro: "muitas_tentativas", mensagem: "Muitas tentativas. Tente de novo em 15 minutos." });
    }

    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const senha = typeof req.body?.senha === "string" ? req.body.senha : "";

    const [usuario] = email ? await db.select().from(usuarios).where(eq(usuarios.email, email)) : [];
    const senhaConfere = await verificarSenha(senha, usuario?.senhaHash ?? HASH_FALSO);

    if (!usuario || !senhaConfere) {
      registrarFalhaDeLogin(ip);
      return void res.status(401).json({ erro: "credenciais_invalidas", mensagem: "E-mail ou senha incorretos." });
    }

    limparFalhasDeLogin(ip);
    iniciarSessao(res, usuario.id);
    res.json({ id: usuario.id, email: usuario.email });
  }),
);

authRouter.post("/logout", (_req, res) => {
  encerrarSessao(res);
  res.status(204).end();
});

authRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const sessao = usuarioDaRequisicao(req);
    if (!sessao) return void res.status(401).json({ erro: "nao_autenticado", mensagem: "Faça login para continuar." });
    const [usuario] = await db.select().from(usuarios).where(eq(usuarios.id, sessao.usuarioId));
    if (!usuario) return void res.status(401).json({ erro: "nao_autenticado", mensagem: "Faça login para continuar." });
    res.json({ id: usuario.id, email: usuario.email });
  }),
);
