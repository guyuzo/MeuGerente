/** Metas de um mês (`mes` = "AAAA-MM"). O app calcula sozinho quanto falta por dia/semana. */
export interface Meta {
  id: string;
  mes: string;
  videos: number;
  faturamento: number;
  lives: number;
  nivel: number;
  criadoEm: string;
  atualizadoEm: string;
}

export type MetaInput = Pick<Meta, "videos" | "faturamento" | "lives" | "nivel">;
