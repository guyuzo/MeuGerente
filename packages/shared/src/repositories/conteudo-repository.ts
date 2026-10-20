import type { Conteudo, ConteudoCreateInput, ConteudoStatus, ConteudoUpdateInput } from "../types/conteudo.js";
import type { Repository } from "./repository.js";

export interface ConteudoRepository extends Repository<Conteudo, ConteudoCreateInput, ConteudoUpdateInput> {
  listarPorProduto(produtoId: string): Promise<Conteudo[]>;
  mudarStatus(id: string, status: ConteudoStatus): Promise<Conteudo>;
}
