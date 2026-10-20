import type { AmostraColunaCreateInput, AmostraColunaUpdateInput } from "@meugerente/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { amostraColunaRepository } from "../lib/repositories";

const CHAVE = ["amostra-colunas"] as const;

export function useAmostraColunas() {
  return useQuery({ queryKey: CHAVE, queryFn: () => amostraColunaRepository.listar() });
}

export function useCriarAmostraColuna() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AmostraColunaCreateInput) => amostraColunaRepository.criar(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useAtualizarAmostraColuna() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AmostraColunaUpdateInput }) =>
      amostraColunaRepository.atualizar(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE });
      queryClient.invalidateQueries({ queryKey: ["amostras"] });
    },
  });
}

export function useDeletarAmostraColuna() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => amostraColunaRepository.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE });
      queryClient.invalidateQueries({ queryKey: ["amostras"] });
    },
  });
}
