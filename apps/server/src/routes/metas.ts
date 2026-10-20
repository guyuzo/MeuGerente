import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { metaRepository } from "../repositories/index.js";

export const metasRouter = Router();

const MES_VALIDO = /^\d{4}-(0[1-9]|1[0-2])$/;

function numeroNaoNegativo(valor: unknown): number {
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Sem meta cadastrada pro mês responde `null` (não é erro — a tela mostra o formulário vazio). */
metasRouter.get(
  "/:mes",
  asyncHandler(async (req, res) => {
    if (!MES_VALIDO.test(req.params.mes)) return void res.status(400).json({ erro: "Mês inválido — use AAAA-MM." });
    res.json((await metaRepository.buscarPorMes(req.params.mes)) ?? null);
  }),
);

metasRouter.post(
  "/:mes",
  asyncHandler(async (req, res) => {
    if (!MES_VALIDO.test(req.params.mes)) return void res.status(400).json({ erro: "Mês inválido — use AAAA-MM." });
    const meta = await metaRepository.salvar(req.params.mes, {
      videos: Math.trunc(numeroNaoNegativo(req.body.videos)),
      faturamento: numeroNaoNegativo(req.body.faturamento),
      lives: Math.trunc(numeroNaoNegativo(req.body.lives)),
      nivel: Math.trunc(numeroNaoNegativo(req.body.nivel)),
    });
    res.json(meta);
  }),
);
