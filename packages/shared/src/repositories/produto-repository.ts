import type { Produto, ProdutoCreateInput, ProdutoStatus, ProdutoUpdateInput } from "../types/produto.js";
import type { Repository } from "./repository.js";

export interface ProdutoRepository extends Repository<Produto, ProdutoCreateInput, ProdutoUpdateInput> {
  mudarStatus(id: string, status: ProdutoStatus): Promise<Produto>;
}
