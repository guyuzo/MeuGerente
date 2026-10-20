// Função serverless da Vercel: todo /api/* cai aqui (rewrite no vercel.json) e o Express roteia.
// Importa o build de apps/server (gerado pelo `npm run build` antes de a Vercel montar a função).
import { app } from "../apps/server/dist/app.js";

export default app;
