import type { Roteiro, RoteiroCreateInput, RoteiroRepository, RoteiroUpdateInput } from "@meugerente/shared";
import { apiClient } from "../api-client";

export class RoteiroRepositoryHttp implements RoteiroRepository {
  listar(): Promise<Roteiro[]> {
    return apiClient.get("/api/roteiros");
  }

  buscarPorId(id: string): Promise<Roteiro | undefined> {
    return apiClient.get(`/api/roteiros/${id}`);
  }

  listarPorProduto(produtoId: string): Promise<Roteiro[]> {
    return apiClient.get(`/api/roteiros?produtoId=${produtoId}`);
  }

  listarPorConteudo(conteudoId: string): Promise<Roteiro[]> {
    return apiClient.get(`/api/roteiros?conteudoId=${conteudoId}`);
  }

  criar(input: RoteiroCreateInput): Promise<Roteiro> {
    return apiClient.post("/api/roteiros", input);
  }

  atualizar(id: string, input: RoteiroUpdateInput): Promise<Roteiro> {
    return apiClient.patch(`/api/roteiros/${id}`, input);
  }
}
