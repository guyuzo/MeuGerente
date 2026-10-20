import type { Amostra, AmostraCreateInput, AmostraRepository, AmostraStatus, AmostraUpdateInput } from "@meugerente/shared";
import { apiClient } from "../api-client";

export class AmostraRepositoryHttp implements AmostraRepository {
  listar(): Promise<Amostra[]> {
    return apiClient.get("/api/amostras");
  }

  buscarPorId(id: string): Promise<Amostra | undefined> {
    return apiClient.get(`/api/amostras/${id}`);
  }

  listarPorProduto(produtoId: string): Promise<Amostra[]> {
    return apiClient.get(`/api/amostras?produtoId=${produtoId}`);
  }

  criar(input: AmostraCreateInput): Promise<Amostra> {
    return apiClient.post("/api/amostras", input);
  }

  atualizar(id: string, input: AmostraUpdateInput): Promise<Amostra> {
    return apiClient.patch(`/api/amostras/${id}`, input);
  }

  mudarStatus(id: string, status: AmostraStatus): Promise<Amostra> {
    return apiClient.patch(`/api/amostras/${id}/status`, { status });
  }
}
