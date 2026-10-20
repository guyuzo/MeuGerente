import type { ConteudoFormato, RoteiroCreateInput, RoteiroPublico, RoteiroUpdateInput } from "@meugerente/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gerarGanchos, gerarRoteiro } from "../lib/ia-client";
import { roteiroRepository } from "../lib/repositories";

const chaveProduto = (produtoId: string) => ["roteiros", "produto", produtoId] as const;

export function useRoteirosPorProduto(produtoId: string | undefined) {
  return useQuery({
    queryKey: chaveProduto(produtoId ?? ""),
    queryFn: () => roteiroRepository.listarPorProduto(produtoId as string),
    enabled: !!produtoId,
  });
}

export function useCriarRoteiro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RoteiroCreateInput) => roteiroRepository.criar(input),
    onSuccess: (roteiro) => queryClient.invalidateQueries({ queryKey: chaveProduto(roteiro.produtoId) }),
  });
}

export function useAtualizarRoteiro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RoteiroUpdateInput }) => roteiroRepository.atualizar(id, input),
    onSuccess: (roteiro) => queryClient.invalidateQueries({ queryKey: chaveProduto(roteiro.produtoId) }),
  });
}

/** Passo "gerar" do fluxo (PRD seção 8.5) — não persiste nada, só devolve o rascunho pra edição. */
export function useGerarRoteiro() {
  return useMutation({
    mutationFn: (params: { produtoId: string; publico: RoteiroPublico; formato: ConteudoFormato; duracaoSegundos?: number }) =>
      gerarRoteiro(params),
  });
}

export function useGerarGanchos() {
  return useMutation({
    mutationFn: (params: { produtoId: string; publico: RoteiroPublico; corpo: string }) => gerarGanchos(params),
  });
}
