import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buscarSessao, entrar, sair } from "../lib/auth-client";

export const CHAVE_SESSAO = ["sessao"] as const;

export function useSessao() {
  return useQuery({ queryKey: CHAVE_SESSAO, queryFn: buscarSessao, staleTime: 5 * 60 * 1000, retry: false });
}

export function useEntrar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, senha }: { email: string; senha: string }) => entrar(email, senha),
    onSuccess: (sessao) => queryClient.setQueryData(CHAVE_SESSAO, sessao),
  });
}

export function useSair() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sair,
    onSuccess: () => {
      // Descarta os dados da sessão que acabou (menos a própria sessão, que a tela está observando).
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== CHAVE_SESSAO[0] });
      queryClient.setQueryData(CHAVE_SESSAO, null);
    },
  });
}
