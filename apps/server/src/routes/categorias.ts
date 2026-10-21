import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { repositorios } from "../repositories/index.js";

export const categoriasRouter = Router();

categoriasRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await repositorios(res).categoriaRepository.listar());
  }),
);

categoriasRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    res.status(201).json(await repositorios(res).categoriaRepository.criar(req.body));
  }),
);

categoriasRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await repositorios(res).categoriaRepository.atualizar(req.params.id, req.body));
  }),
);

categoriasRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await repositorios(res).categoriaRepository.deletar(req.params.id);
    res.status(204).end();
  }),
);
