import type { AmostraCreateInput, AmostraStatus, AmostraUpdateInput } from "@meugerente/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { amostraRepository } from "../lib/repositories";

const CHAVE = ["amostras"] as const;

export function useAmostras() {
  return useQuery({ queryKey: CHAVE, queryFn: () => amostraRepository.listar() });
}

export function useAtualizarAmostra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AmostraUpdateInput }) => amostraRepository.atualizar(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useMudarStatusAmostra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AmostraStatus }) => amostraRepository.mudarStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useCriarAmostra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AmostraCreateInput) => amostraRepository.criar(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}
