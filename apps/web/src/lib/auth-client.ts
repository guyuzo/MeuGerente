import { ApiError, apiClient } from "./api-client";

export interface Sessao {
  id: string;
  email: string;
}

/** `null` quando não há sessão válida — não é erro, é o estado "precisa entrar". */
export async function buscarSessao(): Promise<Sessao | null> {
  try {
    return await apiClient.get<Sessao>("/api/auth/me");
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 401) return null;
    throw erro;
  }
}

export function entrar(email: string, senha: string): Promise<Sessao> {
  return apiClient.post<Sessao>("/api/auth/login", { email, senha });
}

export function sair(): Promise<void> {
  return apiClient.post<void>("/api/auth/logout", {});
}
