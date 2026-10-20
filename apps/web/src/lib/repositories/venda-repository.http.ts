import type {
  AnaliseImportacaoVendas,
  ProdutoOverrideImportacao,
  ResumoImportacaoVendas,
  ResumoVendas,
  Venda,
  VendaCreateInput,
  VendaRepository,
} from "@meugerente/shared";
import { apiClient } from "../api-client";

export class VendaRepositoryHttp implements VendaRepository {
  listar(): Promise<Venda[]> {
    return apiClient.get("/api/vendas");
  }

  buscarPorId(): Promise<Venda | undefined> {
    throw new Error("Não usado — vendas não têm tela de detalhe própria ainda.");
  }

  buscarPorTiktokOrderId(): Promise<Venda | undefined> {
    throw new Error("Não usado no navegador.");
  }

  listarPorProduto(produtoId: string): Promise<Venda[]> {
    return apiClient.get(`/api/vendas?produtoId=${produtoId}`);
  }

  criar(input: VendaCreateInput): Promise<Venda> {
    return apiClient.post("/api/vendas", input);
  }

  atualizar(): Promise<Venda> {
    throw new Error("Não usado no navegador.");
  }

  upsertPorTiktokOrderId(): Promise<Venda> {
    throw new Error("Não usado no navegador — o upsert acontece só na importação, do lado do servidor.");
  }

  resumo(periodo?: { inicio: string; fim: string }): Promise<ResumoVendas> {
    if (!periodo) return apiClient.get("/api/vendas/resumo");
    return apiClient.get(`/api/vendas/resumo?inicio=${periodo.inicio}&fim=${periodo.fim}`);
  }

  analisarPlanilha(arquivo: File): Promise<AnaliseImportacaoVendas> {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    return apiClient.postForm("/api/vendas/importar/analisar", formData);
  }

  importarPlanilha(arquivo: File, overrides?: Record<string, ProdutoOverrideImportacao>): Promise<ResumoImportacaoVendas> {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    if (overrides) formData.append("overrides", JSON.stringify(overrides));
    return apiClient.postForm("/api/vendas/importar", formData);
  }
}
