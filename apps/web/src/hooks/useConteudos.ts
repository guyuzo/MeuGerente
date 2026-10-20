import type { ConteudoCreateInput, ConteudoStatus, ConteudoUpdateInput } from "@meugerente/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conteudoRepository } from "../lib/repositories";

const CHAVE = ["conteudos"] as const;

export function useConteudos() {
  return useQuery({ queryKey: CHAVE, queryFn: () => conteudoRepository.listar() });
}

export function useCriarConteudo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConteudoCreateInput) => conteudoRepository.criar(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useAtualizarConteudo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ConteudoUpdateInput }) => conteudoRepository.atualizar(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useMudarStatusConteudo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ConteudoStatus }) => conteudoRepository.mudarStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}
