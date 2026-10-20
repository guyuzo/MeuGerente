import type {
  AmostraColuna,
  AmostraColunaCreateInput,
  AmostraColunaRepository,
  AmostraColunaUpdateInput,
} from "@meugerente/shared";
import { apiClient } from "../api-client";

export class AmostraColunaRepositoryHttp implements AmostraColunaRepository {
  listar(): Promise<AmostraColuna[]> {
    return apiClient.get("/api/amostra-colunas");
  }

  criar(input: AmostraColunaCreateInput): Promise<AmostraColuna> {
    return apiClient.post("/api/amostra-colunas", input);
  }

  atualizar(id: string, input: AmostraColunaUpdateInput): Promise<AmostraColuna> {
    return apiClient.patch(`/api/amostra-colunas/${id}`, input);
  }

  deletar(id: string): Promise<void> {
    return apiClient.delete(`/api/amostra-colunas/${id}`);
  }
}
