import type { CategoriaCor } from "@meugerente/shared";

interface CorCategoriaInfo {
  value: CategoriaCor;
  label: string;
  dot: string;
  tinta: string;
  pilula: string;
  texto: string;
}

/** Paleta de cor da Categoria — separada da paleta de tons do resto do app (Badge/status) porque aqui é personalização livre do usuário, não sinalização de sistema. */
export const CORES_CATEGORIA: CorCategoriaInfo[] = [
  { value: "neutral", label: "Cinza", dot: "bg-neutral-400", tinta: "bg-neutral-100", pilula: "bg-neutral-200 text-neutral-800", texto: "text-neutral-700" },
  { value: "rose", label: "Rosa", dot: "bg-rose-400", tinta: "bg-rose-500/10", pilula: "bg-rose-200 text-rose-800", texto: "text-rose-700" },
  { value: "orange", label: "Laranja", dot: "bg-orange-400", tinta: "bg-orange-500/10", pilula: "bg-orange-200 text-orange-800", texto: "text-orange-700" },
  { value: "amber", label: "Âmbar", dot: "bg-amber-400", tinta: "bg-amber-500/10", pilula: "bg-amber-200 text-amber-800", texto: "text-amber-700" },
  { value: "yellow", label: "Amarelo", dot: "bg-yellow-400", tinta: "bg-yellow-500/10", pilula: "bg-yellow-200 text-yellow-800", texto: "text-yellow-700" },
  { value: "lime", label: "Lima", dot: "bg-lime-500", tinta: "bg-lime-500/10", pilula: "bg-lime-200 text-lime-900", texto: "text-lime-900" },
  { value: "green", label: "Verde", dot: "bg-green-500", tinta: "bg-green-500/10", pilula: "bg-green-200 text-green-800", texto: "text-green-700" },
  { value: "teal", label: "Verde-azulado", dot: "bg-teal-500", tinta: "bg-teal-500/10", pilula: "bg-teal-200 text-teal-800", texto: "text-teal-700" },
  { value: "cyan", label: "Ciano", dot: "bg-cyan-500", tinta: "bg-cyan-500/10", pilula: "bg-cyan-200 text-cyan-800", texto: "text-cyan-700" },
  { value: "blue", label: "Azul", dot: "bg-blue-500", tinta: "bg-blue-500/10", pilula: "bg-blue-200 text-blue-800", texto: "text-blue-700" },
  { value: "indigo", label: "Índigo", dot: "bg-indigo-500", tinta: "bg-indigo-500/10", pilula: "bg-indigo-200 text-indigo-800", texto: "text-indigo-700" },
  { value: "purple", label: "Roxo", dot: "bg-purple-500", tinta: "bg-purple-500/10", pilula: "bg-purple-200 text-purple-800", texto: "text-purple-700" },
  { value: "fuchsia", label: "Fúcsia", dot: "bg-fuchsia-500", tinta: "bg-fuchsia-500/10", pilula: "bg-fuchsia-200 text-fuchsia-800", texto: "text-fuchsia-700" },
  { value: "pink", label: "Pink", dot: "bg-pink-500", tinta: "bg-pink-500/10", pilula: "bg-pink-200 text-pink-800", texto: "text-pink-700" },
];

export const CORES_CATEGORIA_POR_VALOR: Record<CategoriaCor, CorCategoriaInfo> = Object.fromEntries(
  CORES_CATEGORIA.map((c) => [c.value, c]),
) as Record<CategoriaCor, CorCategoriaInfo>;

/** Busca tolerante: categoria criada antes dessa paleta pode ter uma cor do sistema antigo (accent/success/...). */
export function corCategoria(cor: string): CorCategoriaInfo {
  return CORES_CATEGORIA_POR_VALOR[cor as CategoriaCor] ?? CORES_CATEGORIA_POR_VALOR.neutral;
}
