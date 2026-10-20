import { AmostraColunaRepositoryPg } from "./amostra-coluna-repository.pg.js";
import { AmostraRepositoryPg } from "./amostra-repository.pg.js";
import { CategoriaRepositoryPg } from "./categoria-repository.pg.js";
import { ConteudoRepositoryPg } from "./conteudo-repository.pg.js";
import { MetaRepositoryPg } from "./meta-repository.pg.js";
import { ProdutoRepositoryPg } from "./produto-repository.pg.js";
import { RoteiroRepositoryPg } from "./roteiro-repository.pg.js";
import { VendaRepositoryPg } from "./venda-repository.pg.js";

export const produtoRepository = new ProdutoRepositoryPg();
export const categoriaRepository = new CategoriaRepositoryPg();
export const amostraRepository = new AmostraRepositoryPg();
export const amostraColunaRepository = new AmostraColunaRepositoryPg();
export const conteudoRepository = new ConteudoRepositoryPg();
export const roteiroRepository = new RoteiroRepositoryPg();
export const vendaRepository = new VendaRepositoryPg();
export const metaRepository = new MetaRepositoryPg();
