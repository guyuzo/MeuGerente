import type { CategoriaCreateInput, CategoriaUpdateInput } from "@meugerente/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriaRepository } from "../lib/repositories";

const CHAVE = ["categorias"] as const;

export function useCategorias() {
  return useQuery({ queryKey: CHAVE, queryFn: () => categoriaRepository.listar() });
}

export function useCriarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoriaCreateInput) => categoriaRepository.criar(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useAtualizarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoriaUpdateInput }) => categoriaRepository.atualizar(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE });
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}

export function useDeletarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriaRepository.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE });
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}
