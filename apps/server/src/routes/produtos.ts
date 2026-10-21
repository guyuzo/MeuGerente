import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { repositorios } from "../repositories/index.js";

export const produtosRouter = Router();

produtosRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await repositorios(res).produtoRepository.listar());
  }),
);

produtosRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const produto = await repositorios(res).produtoRepository.buscarPorId(req.params.id);
    if (!produto) return void res.status(404).json({ erro: "Produto não encontrado" });
    res.json(produto);
  }),
);

produtosRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    res.status(201).json(await repositorios(res).produtoRepository.criar(req.body));
  }),
);

produtosRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await repositorios(res).produtoRepository.atualizar(req.params.id, req.body));
  }),
);

produtosRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    res.json(await repositorios(res).produtoRepository.mudarStatus(req.params.id, req.body.status));
  }),
);
