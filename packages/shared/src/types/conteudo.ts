export type ConteudoFormato = "video_curto" | "live" | "carrossel" | "unboxing";

export type ConteudoStatus = "ideia" | "roteiro_pronto" | "gravado" | "editado" | "publicado";

export interface Conteudo {
  id: string;
  produtoId: string;
  amostraId?: string;
  titulo: string;
  formato: ConteudoFormato;
  status: ConteudoStatus;
  dataPrevista?: string;
  dataPublicacao?: string;
  linkPublicacao?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export type ConteudoCreateInput = Pick<Conteudo, "produtoId" | "titulo" | "formato"> &
  Partial<Pick<Conteudo, "amostraId" | "dataPrevista">>;

export type ConteudoUpdateInput = Partial<
  Pick<Conteudo, "titulo" | "formato" | "dataPrevista" | "dataPublicacao" | "linkPublicacao">
>;
