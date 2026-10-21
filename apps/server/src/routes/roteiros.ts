import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { repositorios } from "../repositories/index.js";

export const roteirosRouter = Router();

roteirosRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { produtoId, conteudoId } = req.query;
    if (typeof conteudoId === "string") {
      return void res.json(await repositorios(res).roteiroRepository.listarPorConteudo(conteudoId));
    }
    if (typeof produtoId === "string") {
      return void res.json(await repositorios(res).roteiroRepository.listarPorProduto(produtoId));
    }
    res.json(await repositorios(res).roteiroRepository.listar());
  }),
);

/** Salva um roteiro — gerado pela IA e aceito, ou escrito à mão (PRD seção 8.5: "salvar e vincular a um conteúdo"). */
roteirosRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    res.status(201).json(await repositorios(res).roteiroRepository.criar(req.body));
  }),
);

roteirosRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await repositorios(res).roteiroRepository.atualizar(req.params.id, req.body));
  }),
);
