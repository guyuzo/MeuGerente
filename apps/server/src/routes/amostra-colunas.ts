import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { repositorios } from "../repositories/index.js";

export const amostraColunasRouter = Router();

amostraColunasRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await repositorios(res).amostraColunaRepository.listar());
  }),
);

amostraColunasRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    res.status(201).json(await repositorios(res).amostraColunaRepository.criar(req.body));
  }),
);

amostraColunasRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await repositorios(res).amostraColunaRepository.atualizar(req.params.id, req.body));
  }),
);

amostraColunasRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await repositorios(res).amostraColunaRepository.deletar(req.params.id);
    res.status(204).end();
  }),
);
