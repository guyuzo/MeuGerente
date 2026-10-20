/**
 * Contrato base de repositório (PRD seção 6.2). Toda leitura/escrita do sistema passa por
 * uma implementação desta interface — hoje em memória/localStorage, depois Postgres —
 * sem que nenhuma tela precise mudar.
 */
export interface Repository<T, TCreate, TUpdate> {
  listar(): Promise<T[]>;
  buscarPorId(id: string): Promise<T | undefined>;
  criar(input: TCreate): Promise<T>;
  atualizar(id: string, input: TUpdate): Promise<T>;
}
