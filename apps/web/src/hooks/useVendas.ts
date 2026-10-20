import type { ProdutoOverrideImportacao } from "@meugerente/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vendaRepository } from "../lib/repositories";

const CHAVE_RESUMO = ["vendas", "resumo"] as const;

export function useResumoVendas(periodo?: { inicio: string; fim: string }) {
  return useQuery({
    queryKey: [...CHAVE_RESUMO, periodo?.inicio, periodo?.fim],
    queryFn: () => vendaRepository.resumo(periodo),
  });
}

export function useAnalisarVendas() {
  return useMutation({
    mutationFn: (arquivo: File) => vendaRepository.analisarPlanilha(arquivo),
  });
}

/** Não invalida nada: a análise avulsa não grava venda nem produto. */
export function useAnaliseAvulsaVendas() {
  return useMutation({
    mutationFn: (arquivo: File) => vendaRepository.analisarSemSalvar(arquivo),
  });
}

export function useImportarVendas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ arquivo, overrides }: { arquivo: File; overrides?: Record<string, ProdutoOverrideImportacao> }) =>
      vendaRepository.importarPlanilha(arquivo, overrides),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_RESUMO });
      // A importação pode ter criado produto novo (planilha traz item que ainda não existia aqui).
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}
