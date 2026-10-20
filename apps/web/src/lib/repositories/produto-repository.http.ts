import type { Produto, ProdutoCreateInput, ProdutoRepository, ProdutoStatus, ProdutoUpdateInput } from "@meugerente/shared";
import { apiClient } from "../api-client";

export class ProdutoRepositoryHttp implements ProdutoRepository {
  listar(): Promise<Produto[]> {
    return apiClient.get("/api/produtos");
  }

  buscarPorId(id: string): Promise<Produto | undefined> {
    return apiClient.get(`/api/produtos/${id}`);
  }

  criar(input: ProdutoCreateInput): Promise<Produto> {
    return apiClient.post("/api/produtos", input);
  }

  atualizar(id: string, input: ProdutoUpdateInput): Promise<Produto> {
    return apiClient.patch(`/api/produtos/${id}`, input);
  }

  mudarStatus(id: string, status: ProdutoStatus): Promise<Produto> {
    return apiClient.patch(`/api/produtos/${id}/status`, { status });
  }
}
