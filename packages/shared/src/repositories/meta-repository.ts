import type { Meta, MetaInput } from "../types/meta.js";

export interface MetaRepository {
  buscarPorMes(mes: string): Promise<Meta | undefined>;
  /** Uma linha por mês — salvar de novo no mesmo mês atualiza em vez de duplicar. */
  salvar(mes: string, input: MetaInput): Promise<Meta>;
}
