import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { repositorios } from "../repositories/index.js";

export const amostrasRouter = Router();

amostrasRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { produtoId } = req.query;
    if (typeof produtoId === "string") {
      return void res.json(await repositorios(res).amostraRepository.listarPorProduto(produtoId));
    }
    res.json(await repositorios(res).amostraRepository.listar());
  }),
);

amostrasRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const amostra = await repositorios(res).amostraRepository.buscarPorId(req.params.id);
    if (!amostra) return void res.status(404).json({ erro: "Amostra não encontrada" });
    res.json(amostra);
  }),
);

amostrasRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const amostra = await repositorios(res).amostraRepository.criar(req.body);
    res.status(201).json(amostra);
  }),
);

amostrasRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await repositorios(res).amostraRepository.atualizar(req.params.id, req.body));
  }),
);

amostrasRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    res.json(await repositorios(res).amostraRepository.mudarStatus(req.params.id, req.body.status));
  }),
);
