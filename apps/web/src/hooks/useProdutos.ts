import type { ProdutoCreateInput, ProdutoStatus, ProdutoUpdateInput } from "@meugerente/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { produtoRepository } from "../lib/repositories";

const CHAVE = ["produtos"] as const;

export function useProdutos() {
  return useQuery({ queryKey: CHAVE, queryFn: () => produtoRepository.listar() });
}

export function useCriarProduto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProdutoCreateInput) => produtoRepository.criar(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useAtualizarProduto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProdutoUpdateInput }) => produtoRepository.atualizar(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useMudarStatusProduto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProdutoStatus }) => produtoRepository.mudarStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}
