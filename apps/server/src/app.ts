import "dotenv/config";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { geminiDisponivel } from "./ia/gemini-client.js";
import { authRouter } from "./routes/auth.js";
import { exigirLogin } from "./lib/auth.js";
import { amostraColunasRouter } from "./routes/amostra-colunas.js";
import { amostrasRouter } from "./routes/amostras.js";
import { categoriasRouter } from "./routes/categorias.js";
import { conteudosRouter } from "./routes/conteudos.js";
import { iaRouter } from "./routes/ia.js";
import { metasRouter } from "./routes/metas.js";
import { produtosRouter } from "./routes/produtos.js";
import { roteirosRouter } from "./routes/roteiros.js";
import { vendasRouter } from "./routes/vendas.js";

/**
 * O app sem `listen`: localmente o index.ts sobe ele numa porta; na Vercel, api/index.mjs
 * exporta ele como função serverless, no mesmo domínio do front.
 */
export const app = express();

// Na Vercel front e API dividem o domínio, então CORS só importa no dev (5173 → 3001).
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173", credentials: true }));
app.use(express.json());

/**
 * Fase 2: além do health check, o servidor agora expõe a API de dados (Postgres via Supabase)
 * que o apps/web consome por HTTP — o navegador nunca fala com o banco direto — e a rota de
 * IA (Gemini), que fica atrás de GEMINI_API_KEY. /api/tiktok/* continua fora, é Fase 3.
 */
app.get("/api/status", (_req, res) => {
  res.json({ status: "ok", fase: 2, servico: "meugerente-server", gemini: geminiDisponivel() });
});

// Tudo em /api exige sessão, exceto /api/status e /api/auth/*.
app.use("/api/auth", authRouter);
app.use("/api", exigirLogin);

app.use("/api/produtos", produtosRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/amostras", amostrasRouter);
app.use("/api/amostra-colunas", amostraColunasRouter);
app.use("/api/conteudos", conteudosRouter);
app.use("/api/roteiros", roteirosRouter);
app.use("/api/vendas", vendasRouter);
app.use("/api/metas", metasRouter);
app.use("/api/ia", iaRouter);

const tratarErro: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ erro: "erro_interno", mensagem: err instanceof Error ? err.message : "Erro desconhecido" });
};
app.use(tratarErro);
