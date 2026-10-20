import type { Amostra, AmostraCreateInput, AmostraStatus, AmostraUpdateInput } from "../types/amostra.js";
import type { Repository } from "./repository.js";

export interface AmostraRepository extends Repository<Amostra, AmostraCreateInput, AmostraUpdateInput> {
  listarPorProduto(produtoId: string): Promise<Amostra[]>;
  mudarStatus(id: string, status: AmostraStatus): Promise<Amostra>;
}
