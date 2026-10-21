import { type QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  buscarSessao,
  cadastrar,
  entrar,
  excluirConta,
  pedirRedefinicaoSenha,
  redefinirSenha,
  sair,
  type Sessao,
} from "../lib/auth-client";

export const CHAVE_SESSAO = ["sessao"] as const;

/**
 * Troca de sessão (entrar, sair, criar conta...): descarta todo dado em cache antes. Sem isso,
 * quem entra depois de outra conta no mesmo navegador veria por um instante os dados dela.
 */
function trocarSessao(queryClient: QueryClient, sessao: Sessao | null) {
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== CHAVE_SESSAO[0] });
  queryClient.setQueryData(CHAVE_SESSAO, sessao);
}

export function useSessao() {
  return useQuery({ queryKey: CHAVE_SESSAO, queryFn: buscarSessao, staleTime: 5 * 60 * 1000, retry: false });
}

export function useEntrar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, senha }: { email: string; senha: string }) => entrar(email, senha),
    onSuccess: (sessao) => trocarSessao(queryClient, sessao),
  });
}

export function useCadastrar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, senha, aceitouTermos }: { email: string; senha: string; aceitouTermos: boolean }) =>
      cadastrar(email, senha, aceitouTermos),
    onSuccess: (sessao) => trocarSessao(queryClient, sessao),
  });
}

export function usePedirRedefinicaoSenha() {
  return useMutation({ mutationFn: (email: string) => pedirRedefinicaoSenha(email) });
}

export function useRedefinirSenha() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, senha }: { token: string; senha: string }) => redefinirSenha(token, senha),
    onSuccess: (sessao) => trocarSessao(queryClient, sessao),
  });
}

export function useSair() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: sair, onSuccess: () => trocarSessao(queryClient, null) });
}

export function useExcluirConta() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (senha: string) => excluirConta(senha), onSuccess: () => trocarSessao(queryClient, null) });
}
