import type { Conteudo, ConteudoCreateInput, ConteudoRepository, ConteudoStatus, ConteudoUpdateInput } from "@meugerente/shared";
import { apiClient } from "../api-client";

export class ConteudoRepositoryHttp implements ConteudoRepository {
  listar(): Promise<Conteudo[]> {
    return apiClient.get("/api/conteudos");
  }

  buscarPorId(id: string): Promise<Conteudo | undefined> {
    return apiClient.get(`/api/conteudos/${id}`);
  }

  listarPorProduto(produtoId: string): Promise<Conteudo[]> {
    return apiClient.get(`/api/conteudos?produtoId=${produtoId}`);
  }

  criar(input: ConteudoCreateInput): Promise<Conteudo> {
    return apiClient.post("/api/conteudos", input);
  }

  atualizar(id: string, input: ConteudoUpdateInput): Promise<Conteudo> {
    return apiClient.patch(`/api/conteudos/${id}`, input);
  }

  mudarStatus(id: string, status: ConteudoStatus): Promise<Conteudo> {
    return apiClient.patch(`/api/conteudos/${id}/status`, { status });
  }
}
