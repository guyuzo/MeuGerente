import type { Categoria, CategoriaCreateInput, CategoriaRepository, CategoriaUpdateInput } from "@meugerente/shared";
import { apiClient } from "../api-client";

export class CategoriaRepositoryHttp implements CategoriaRepository {
  listar(): Promise<Categoria[]> {
    return apiClient.get("/api/categorias");
  }

  criar(input: CategoriaCreateInput): Promise<Categoria> {
    return apiClient.post("/api/categorias", input);
  }

  atualizar(id: string, input: CategoriaUpdateInput): Promise<Categoria> {
    return apiClient.patch(`/api/categorias/${id}`, input);
  }

  deletar(id: string): Promise<void> {
    return apiClient.delete(`/api/categorias/${id}`);
  }
}
