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
import { produtoRepository } from "../repositories/index.js";

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

iaRouter.post(
  "/roteiro",
  asyncHandler(async (req, res) => {
    const { produtoId, publico, formato, duracaoSegundos } = req.body;
    const produto = await produtoRepository.buscarPorId(produtoId);
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
    const produto = await produtoRepository.buscarPorId(produtoId);
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
