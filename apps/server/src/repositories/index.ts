import type { Response } from "express";
import { AmostraColunaRepositoryPg } from "./amostra-coluna-repository.pg.js";
import { AmostraRepositoryPg } from "./amostra-repository.pg.js";
import { CategoriaRepositoryPg } from "./categoria-repository.pg.js";
import { ConteudoRepositoryPg } from "./conteudo-repository.pg.js";
import { MetaRepositoryPg } from "./meta-repository.pg.js";
import { ProdutoRepositoryPg } from "./produto-repository.pg.js";
import { RoteiroRepositoryPg } from "./roteiro-repository.pg.js";
import { VendaRepositoryPg } from "./venda-repository.pg.js";

/**
 * Multiusuário (PLANO-MULTIUSUARIO.md): não existe mais instância única de repositório — cada
 * requisição monta os seus já presos ao usuário da sessão, então nenhuma rota consegue, nem por
 * esquecimento, ler ou gravar dado de outra conta.
 */
export function repositoriosDo(usuarioId: string) {
  return {
    produtoRepository: new ProdutoRepositoryPg(usuarioId),
    categoriaRepository: new CategoriaRepositoryPg(usuarioId),
    amostraRepository: new AmostraRepositoryPg(usuarioId),
    amostraColunaRepository: new AmostraColunaRepositoryPg(usuarioId),
    conteudoRepository: new ConteudoRepositoryPg(usuarioId),
    roteiroRepository: new RoteiroRepositoryPg(usuarioId),
    vendaRepository: new VendaRepositoryPg(usuarioId),
    metaRepository: new MetaRepositoryPg(usuarioId),
  };
}

export type Repositorios = ReturnType<typeof repositoriosDo>;

/** Repositórios do usuário logado. `exigirLogin` grava `usuarioId` em `res.locals` antes de qualquer rota de dado. */
export function repositorios(res: Response): Repositorios {
  const usuarioId = res.locals.usuarioId;
  if (typeof usuarioId !== "string") throw new Error("Rota de dado sem sessão — exigirLogin não rodou antes dela.");
  return repositoriosDo(usuarioId);
}
