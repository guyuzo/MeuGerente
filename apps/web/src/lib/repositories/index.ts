import { AmostraColunaRepositoryHttp } from "./amostra-coluna-repository.http";
import { AmostraRepositoryHttp } from "./amostra-repository.http";
import { CategoriaRepositoryHttp } from "./categoria-repository.http";
import { ConteudoRepositoryHttp } from "./conteudo-repository.http";
import { MetaRepositoryHttp } from "./meta-repository.http";
import { ProdutoRepositoryHttp } from "./produto-repository.http";
import { RoteiroRepositoryHttp } from "./roteiro-repository.http";
import { VendaRepositoryHttp } from "./venda-repository.http";

/**
 * Instâncias únicas dos repositórios (PRD seção 6.2). Fase 2: implementação HTTP contra o
 * apps/server, que fala com Postgres/Supabase — o navegador nunca acessa o banco direto.
 * Trocar de novo no futuro (outro banco, cache local) é trocar só este arquivo.
 */
export const produtoRepository = new ProdutoRepositoryHttp();
export const categoriaRepository = new CategoriaRepositoryHttp();
export const amostraRepository = new AmostraRepositoryHttp();
export const amostraColunaRepository = new AmostraColunaRepositoryHttp();
export const conteudoRepository = new ConteudoRepositoryHttp();
export const roteiroRepository = new RoteiroRepositoryHttp();
export const vendaRepository = new VendaRepositoryHttp();
export const metaRepository = new MetaRepositoryHttp();
