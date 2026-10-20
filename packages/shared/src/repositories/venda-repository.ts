import type { Venda, VendaCreateInput, VendaUpdateInput } from "../types/venda.js";
import type { Repository } from "./repository.js";

export interface VendaRepository extends Repository<Venda, VendaCreateInput, VendaUpdateInput> {
  buscarPorTiktokOrderId(tiktokOrderId: string): Promise<Venda | undefined>;
  listarPorProduto(produtoId: string): Promise<Venda[]>;
  /** Upsert pelo ID do TikTok (PRD 6.4, regra 3) — é assim que o futuro sincronizador evita duplicar venda. */
  upsertPorTiktokOrderId(tiktokOrderId: string, input: VendaCreateInput): Promise<Venda>;
}
