import type { Meta, MetaInput, MetaRepository } from "@meugerente/shared";
import { apiClient } from "../api-client";

export class MetaRepositoryHttp implements MetaRepository {
  async buscarPorMes(mes: string): Promise<Meta | undefined> {
    return (await apiClient.get<Meta | null>(`/api/metas/${mes}`)) ?? undefined;
  }

  salvar(mes: string, input: MetaInput): Promise<Meta> {
    return apiClient.post(`/api/metas/${mes}`, input);
  }
}
