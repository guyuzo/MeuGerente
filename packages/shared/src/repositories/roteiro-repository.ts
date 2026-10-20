import type { Roteiro, RoteiroCreateInput, RoteiroUpdateInput } from "../types/roteiro.js";
import type { Repository } from "./repository.js";

export interface RoteiroRepository extends Repository<Roteiro, RoteiroCreateInput, RoteiroUpdateInput> {
  listarPorProduto(produtoId: string): Promise<Roteiro[]>;
  listarPorConteudo(conteudoId: string): Promise<Roteiro[]>;
}
