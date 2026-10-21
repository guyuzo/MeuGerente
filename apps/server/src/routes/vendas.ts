import type { ProdutoOverrideImportacao } from "@meugerente/shared";
import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../lib/async-handler.js";
import { repositorios } from "../repositories/index.js";
import { analisarVendasSemSalvar, analisarVendasTiktok, importarVendasTiktok } from "../services/importar-vendas-tiktok.js";
import { resumirVendas } from "../services/resumo-vendas.js";

export const vendasRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  // A Vercel corta requisição acima de 4,5 MB antes de chegar aqui; 4 MB cobre ~15 mil pedidos.
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.xlsx$/i.test(file.originalname)) return cb(null, true);
    cb(new Error("Envie um arquivo .xlsx"));
  },
});

vendasRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { vendaRepository } = repositorios(res);
    const { produtoId } = req.query;
    if (typeof produtoId === "string") {
      return void res.json(await vendaRepository.listarPorProduto(produtoId));
    }
    res.json(await vendaRepository.listar());
  }),
);

vendasRouter.get(
  "/resumo",
  asyncHandler(async (req, res) => {
    const { inicio, fim } = req.query;
    const { vendaRepository, produtoRepository } = repositorios(res);
    const [todasVendas, produtos] = await Promise.all([vendaRepository.listar(), produtoRepository.listar()]);
    const produtosPorId = new Map(produtos.map((p) => [p.id, p]));

    const vendas =
      typeof inicio === "string" && typeof fim === "string"
        ? todasVendas.filter((v) => v.data >= inicio && v.data < fim)
        : todasVendas;

    res.json(resumirVendas(vendas, (id) => produtosPorId.get(id)?.nome));
  }),
);

vendasRouter.post(
  "/analise-avulsa",
  upload.single("arquivo"),
  asyncHandler(async (req, res) => {
    if (!req.file) return void res.status(400).json({ erro: "Envie o arquivo no campo 'arquivo'." });
    res.json(analisarVendasSemSalvar(req.file.buffer));
  }),
);

vendasRouter.post(
  "/importar/analisar",
  upload.single("arquivo"),
  asyncHandler(async (req, res) => {
    if (!req.file) return void res.status(400).json({ erro: "Envie o arquivo no campo 'arquivo'." });
    res.json(await analisarVendasTiktok(repositorios(res), req.file.buffer));
  }),
);

vendasRouter.post(
  "/importar",
  upload.single("arquivo"),
  asyncHandler(async (req, res) => {
    if (!req.file) return void res.status(400).json({ erro: "Envie o arquivo no campo 'arquivo'." });

    let overrides: Record<string, ProdutoOverrideImportacao> = {};
    if (typeof req.body.overrides === "string" && req.body.overrides) {
      try {
        overrides = JSON.parse(req.body.overrides);
      } catch {
        return void res.status(400).json({ erro: "Campo 'overrides' inválido — precisa ser JSON." });
      }
    }

    const resumo = await importarVendasTiktok(repositorios(res), req.file.buffer, overrides);
    res.status(201).json(resumo);
  }),
);
