import type { ConteudoFormato, RoteiroPublico } from "@meugerente/shared";
import { apiClient } from "./api-client";

export interface RoteiroGerado {
  gancho: string;
  corpo: string;
  cta: string;
  modeloIa: string;
}

/** Chama /api/ia/roteiro (Gemini, PRD seção 9.1) — nunca a API do Google direto do navegador. */
export function gerarRoteiro(params: {
  produtoId: string;
  publico: RoteiroPublico;
  formato: ConteudoFormato;
  duracaoSegundos?: number;
}): Promise<RoteiroGerado> {
  return apiClient.post("/api/ia/roteiro", params);
}

export function gerarGanchos(params: {
  produtoId: string;
  publico: RoteiroPublico;
  corpo: string;
}): Promise<{ ganchos: string[] }> {
  return apiClient.post("/api/ia/ganchos", params);
}
