import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { produtoRepository } from "../repositories/index.js";

export const produtosRouter = Router();

produtosRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await produtoRepository.listar());
  }),
);

produtosRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const produto = await produtoRepository.buscarPorId(req.params.id);
    if (!produto) return void res.status(404).json({ erro: "Produto não encontrado" });
    res.json(produto);
  }),
);

produtosRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    res.status(201).json(await produtoRepository.criar(req.body));
  }),
);

produtosRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await produtoRepository.atualizar(req.params.id, req.body));
  }),
);

produtosRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    res.json(await produtoRepository.mudarStatus(req.params.id, req.body.status));
  }),
);
