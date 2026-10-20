import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { amostraRepository, conteudoRepository } from "../repositories/index.js";

export const conteudosRouter = Router();

conteudosRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { produtoId } = req.query;
    if (typeof produtoId === "string") {
      return void res.json(await conteudoRepository.listarPorProduto(produtoId));
    }
    res.json(await conteudoRepository.listar());
  }),
);

conteudosRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const conteudo = await conteudoRepository.buscarPorId(req.params.id);
    if (!conteudo) return void res.status(404).json({ erro: "Conteúdo não encontrado" });
    res.json(conteudo);
  }),
);

conteudosRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    res.status(201).json(await conteudoRepository.criar(req.body));
  }),
);

conteudosRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await conteudoRepository.atualizar(req.params.id, req.body));
  }),
);

/** Publicar o conteúdo também marca a amostra ligada a ele como "publicado" (fecha o pipeline do quadro de Amostras). */
conteudosRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const conteudo = await conteudoRepository.mudarStatus(req.params.id, req.body.status);
    if (conteudo.status === "publicado" && conteudo.amostraId) {
      await amostraRepository.mudarStatus(conteudo.amostraId, "publicado");
    }
    res.json(conteudo);
  }),
);
