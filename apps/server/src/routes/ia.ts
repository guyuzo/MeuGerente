import { Router } from "express";
import { geminiDisponivel, gerarJson } from "../ia/gemini-client.js";
import {
  GANCHOS_RESPONSE_SCHEMA,
  montarPromptGanchos,
  montarPromptRoteiro,
  ROTEIRO_RESPONSE_SCHEMA,
  SYSTEM_INSTRUCTION_ROTEIRO,
} from "../ia/prompts.js";
import { asyncHandler } from "../lib/async-handler.js";
import { contarTentativa } from "../lib/limites.js";
import { repositorios } from "../repositories/index.js";

export const iaRouter = Router();

/** Toda rota de IA falha de forma explícita sem a chave — nunca finge sucesso (Fase 2 ainda sem GEMINI_API_KEY). */
iaRouter.use((_req, res, next) => {
  if (!geminiDisponivel()) {
    return void res.status(503).json({
      erro: "gemini_nao_configurado",
      mensagem: "GEMINI_API_KEY não está definida em apps/server/.env — configure a chave para gerar roteiro.",
    });
  }
  next();
});

/**
 * A chave da Gemini é uma só e paga por todos os usuários: cada conta tem um teto de gerações a
 * cada 24h (IA_LIMITE_DIARIO, padrão 50). Conta a tentativa antes de chamar a IA, então pedido que
 * falhou também gasta — evita que um erro em loop vire chamada ilimitada.
 */
const LIMITE_DIARIO_IA = Number(process.env.IA_LIMITE_DIARIO) || 50;
const UM_DIA = 24 * 60 * 60 * 1000;

iaRouter.use((_req, res, next) => {
  contarTentativa(`ia:${res.locals.usuarioId}`, UM_DIA)
    .then((usadas) => {
      if (usadas > LIMITE_DIARIO_IA) {
        return void res.status(429).json({
          erro: "limite_ia",
          mensagem: `Você usou as ${LIMITE_DIARIO_IA} gerações de IA das últimas 24 horas. Tente de novo amanhã.`,
        });
      }
      next();
    })
    .catch(next);
});

iaRouter.post(
  "/roteiro",
  asyncHandler(async (req, res) => {
    const { produtoId, publico, formato, duracaoSegundos } = req.body;
    const produto = await repositorios(res).produtoRepository.buscarPorId(produtoId);
    if (!produto) return void res.status(404).json({ erro: "Produto não encontrado" });

    const prompt = montarPromptRoteiro({ produto, publico, formato, duracaoSegundos });
    const resultado = await gerarJson<{ gancho: string; corpo: string; cta: string }>({
      systemInstruction: SYSTEM_INSTRUCTION_ROTEIRO,
      prompt,
      responseSchema: ROTEIRO_RESPONSE_SCHEMA,
    });

    res.json({ ...resultado, modeloIa: process.env.GEMINI_MODEL_RAPIDO ?? "gemini-2.5-flash" });
  }),
);

iaRouter.post(
  "/ganchos",
  asyncHandler(async (req, res) => {
    const { produtoId, publico, corpo } = req.body;
    const produto = await repositorios(res).produtoRepository.buscarPorId(produtoId);
    if (!produto) return void res.status(404).json({ erro: "Produto não encontrado" });

    const prompt = montarPromptGanchos({ produto, publico, corpo });
    const resultado = await gerarJson<{ ganchos: string[] }>({
      systemInstruction: SYSTEM_INSTRUCTION_ROTEIRO,
      prompt,
      responseSchema: GANCHOS_RESPONSE_SCHEMA,
    });

    res.json(resultado);
  }),
);
