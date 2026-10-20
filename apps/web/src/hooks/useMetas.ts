import type { MetaInput } from "@meugerente/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { metaRepository } from "../lib/repositories";

export function useMeta(mes: string) {
  return useQuery({
    queryKey: ["metas", mes],
    // React Query não aceita `undefined` como resultado — mês sem meta vira `null`.
    queryFn: async () => (await metaRepository.buscarPorMes(mes)) ?? null,
  });
}

export function useSalvarMeta(mes: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MetaInput) => metaRepository.salvar(mes, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["metas", mes] }),
  });
}
