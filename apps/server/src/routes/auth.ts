import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { Router, type Request, type Response } from "express";
import { db } from "../db/client.js";
import { redefinicoesSenha, usuarios } from "../db/schema.js";
import { asyncHandler } from "../lib/async-handler.js";
import {
  encerrarSessao,
  gerarTokenAleatorio,
  hashSenha,
  hashToken,
  iniciarSessao,
  usuarioDaRequisicao,
  verificarSenha,
} from "../lib/auth.js";
import { emailDisponivel, enviarEmail, urlDoApp } from "../lib/email.js";
import { contarTentativa, tentativasAtuais, zerarTentativas } from "../lib/limites.js";

export const authRouter = Router();

// Hash de uma senha qualquer, usado pra gastar o mesmo tempo quando o e-mail não existe (não vaza quem tem conta).
const HASH_FALSO = "scrypt$00000000000000000000000000000000$" + "00".repeat(64);

const QUINZE_MINUTOS = 15 * 60 * 1000;
const UMA_HORA = 60 * 60 * 1000;
const SENHA_MINIMA = 8;
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MUITAS_TENTATIVAS = { erro: "muitas_tentativas", mensagem: "Muitas tentativas. Tente de novo mais tarde." };

/**
 * IP do cliente pros freios. Na Vercel `req.ip` seria o do proxy — o mesmo pra todo mundo, e 5
 * erros de qualquer pessoa travariam o login de todos. Lá o IP real vem em `x-real-ip`, que a
 * própria Vercel define (o cliente não consegue forjar). Fora da Vercel, conexão direta: `req.ip`.
 */
function ipDe(req: Request): string {
  const ipVercel = process.env.VERCEL ? req.headers["x-real-ip"] : undefined;
  return (typeof ipVercel === "string" && ipVercel) || req.ip || "desconhecido";
}

function lerEmail(req: Request): string {
  return typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
}

function lerSenha(req: Request, campo = "senha"): string {
  return typeof req.body?.[campo] === "string" ? req.body[campo] : "";
}

function senhaFraca(res: Response, senha: string): boolean {
  if (senha.length >= SENHA_MINIMA) return false;
  res.status(400).json({ erro: "senha_fraca", mensagem: `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.` });
  return true;
}

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const chave = `login:${ipDe(req)}`;
    if ((await tentativasAtuais(chave, QUINZE_MINUTOS)) >= 5) {
      return void res.status(429).json({ ...MUITAS_TENTATIVAS, mensagem: "Muitas tentativas. Tente de novo em 15 minutos." });
    }

    const email = lerEmail(req);
    const senha = lerSenha(req);
    const [usuario] = email ? await db.select().from(usuarios).where(eq(usuarios.email, email)) : [];
    const senhaConfere = await verificarSenha(senha, usuario?.senhaHash ?? HASH_FALSO);

    if (!usuario || !senhaConfere) {
      await contarTentativa(chave, QUINZE_MINUTOS);
      return void res.status(401).json({ erro: "credenciais_invalidas", mensagem: "E-mail ou senha incorretos." });
    }

    await zerarTentativas(chave);
    iniciarSessao(res, usuario);
    res.json({ id: usuario.id, email: usuario.email });
  }),
);

authRouter.post(
  "/cadastro",
  asyncHandler(async (req, res) => {
    if ((await contarTentativa(`cadastro:${ipDe(req)}`, UMA_HORA)) > 5) return void res.status(429).json(MUITAS_TENTATIVAS);

    const email = lerEmail(req);
    const senha = lerSenha(req);
    if (!EMAIL_VALIDO.test(email)) {
      return void res.status(400).json({ erro: "email_invalido", mensagem: "Informe um e-mail válido." });
    }
    if (senhaFraca(res, senha)) return;
    if (req.body?.aceitouTermos !== true) {
      return void res.status(400).json({
        erro: "termos_nao_aceitos",
        mensagem: "Para criar a conta, aceite os Termos de Uso e a Política de Privacidade.",
      });
    }

    const [existente] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, email));
    if (existente) {
      return void res.status(409).json({ erro: "email_em_uso", mensagem: "Já existe uma conta com esse e-mail. Entre ou recupere a senha." });
    }

    const [usuario] = await db
      .insert(usuarios)
      .values({ email, senhaHash: await hashSenha(senha), aceitouTermosEm: new Date().toISOString() })
      .onConflictDoNothing({ target: usuarios.email })
      .returning();
    // Duas requisições simultâneas com o mesmo e-mail: a segunda cai aqui em vez de estourar 500.
    if (!usuario) {
      return void res.status(409).json({ erro: "email_em_uso", mensagem: "Já existe uma conta com esse e-mail. Entre ou recupere a senha." });
    }

    iniciarSessao(res, usuario);
    res.status(201).json({ id: usuario.id, email: usuario.email });
  }),
);

/** Responde igual exista ou não a conta — quem pede não descobre quais e-mails estão cadastrados. */
authRouter.post(
  "/esqueci-senha",
  asyncHandler(async (req, res) => {
    const baseUrl = urlDoApp();
    if (!emailDisponivel() || !baseUrl) {
      return void res.status(503).json({
        erro: "email_nao_configurado",
        mensagem: "A recuperação de senha por e-mail ainda não está configurada. Fale com o suporte.",
      });
    }

    const email = lerEmail(req);
    if ((await contarTentativa(`esqueci:${ipDe(req)}`, QUINZE_MINUTOS)) > 5) return void res.status(429).json(MUITAS_TENTATIVAS);
    const resposta = { mensagem: "Se existir uma conta com esse e-mail, enviamos um link para criar uma nova senha." };
    if (!EMAIL_VALIDO.test(email)) return void res.json(resposta);
    // Freio por e-mail também, pra ninguém usar o formulário pra lotar a caixa de entrada de alguém.
    if ((await contarTentativa(`esqueci-email:${email}`, UMA_HORA)) > 3) return void res.json(resposta);

    const [usuario] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, email));
    if (usuario) {
      const { token, hash } = gerarTokenAleatorio();
      await db.insert(redefinicoesSenha).values({
        usuarioId: usuario.id,
        tokenHash: hash,
        expiraEm: new Date(Date.now() + UMA_HORA).toISOString(),
      });

      const link = `${baseUrl}/redefinir-senha?token=${token}`;
      await enviarEmail({
        para: email,
        assunto: "Crie uma nova senha — MEU GERENTE",
        texto: `Recebemos um pedido para trocar a senha da sua conta no MEU GERENTE.\n\nCrie uma nova senha por este link (vale por 1 hora):\n${link}\n\nSe não foi você, ignore este e-mail — sua senha continua a mesma.`,
        html: `<p>Recebemos um pedido para trocar a senha da sua conta no <strong>MEU GERENTE</strong>.</p><p><a href="${link}">Criar nova senha</a> (o link vale por 1 hora).</p><p>Se não foi você, ignore este e-mail — sua senha continua a mesma.</p>`,
      });
    }

    res.json(resposta);
  }),
);

authRouter.post(
  "/redefinir-senha",
  asyncHandler(async (req, res) => {
    if ((await contarTentativa(`redefinir:${ipDe(req)}`, QUINZE_MINUTOS)) > 10) return void res.status(429).json(MUITAS_TENTATIVAS);

    const token = typeof req.body?.token === "string" ? req.body.token : "";
    const senha = lerSenha(req);
    if (senhaFraca(res, senha)) return;

    const [pedido] = token
      ? await db
          .select()
          .from(redefinicoesSenha)
          .where(
            and(
              eq(redefinicoesSenha.tokenHash, hashToken(token)),
              isNull(redefinicoesSenha.usadoEm),
              gt(redefinicoesSenha.expiraEm, sql`now()`),
            ),
          )
      : [];
    if (!pedido) {
      return void res.status(400).json({
        erro: "link_invalido",
        mensagem: "Esse link expirou ou já foi usado. Peça um novo em \"Esqueci a senha\".",
      });
    }

    const senhaHash = await hashSenha(senha);
    const usuario = await db.transaction(async (tx) => {
      // Usa este e invalida qualquer outro link pendente da mesma conta.
      await tx
        .update(redefinicoesSenha)
        .set({ usadoEm: new Date().toISOString() })
        .where(and(eq(redefinicoesSenha.usuarioId, pedido.usuarioId), isNull(redefinicoesSenha.usadoEm)));
      const [atualizado] = await tx
        .update(usuarios)
        .set({ senhaHash, versaoSessao: sql`${usuarios.versaoSessao} + 1` })
        .where(eq(usuarios.id, pedido.usuarioId))
        .returning();
      return atualizado;
    });

    iniciarSessao(res, usuario);
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
    const usuario = await usuarioDaRequisicao(req);
    if (!usuario) return void res.status(401).json({ erro: "nao_autenticado", mensagem: "Faça login para continuar." });
    res.json(usuario);
  }),
);

/** LGPD: apaga a conta e, por cascade no banco, todo dado dela. Pede a senha de novo. */
authRouter.delete(
  "/conta",
  asyncHandler(async (req, res) => {
    const sessao = await usuarioDaRequisicao(req);
    if (!sessao) return void res.status(401).json({ erro: "nao_autenticado", mensagem: "Faça login para continuar." });

    const chave = `excluir:${sessao.id}`;
    if ((await tentativasAtuais(chave, QUINZE_MINUTOS)) >= 5) return void res.status(429).json(MUITAS_TENTATIVAS);

    const [usuario] = await db.select().from(usuarios).where(eq(usuarios.id, sessao.id));
    if (!usuario || !(await verificarSenha(lerSenha(req), usuario.senhaHash))) {
      await contarTentativa(chave, QUINZE_MINUTOS);
      return void res.status(401).json({ erro: "senha_incorreta", mensagem: "Senha incorreta." });
    }

    await db.delete(usuarios).where(eq(usuarios.id, usuario.id));
    await zerarTentativas(chave);
    encerrarSessao(res);
    res.status(204).end();
  }),
);
