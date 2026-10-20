import type { ConteudoFormato, Produto, RoteiroPublico } from "@meugerente/shared";

/** Regras não negociáveis do PRD seção 9.3 (regras 1, 3 e 4) — vale pra todo prompt de roteiro/gancho. */
export const SYSTEM_INSTRUCTION_ROTEIRO = `Você escreve roteiro de vídeo curto para afiliados de TikTok Shop no Brasil.
Regras obrigatórias:
- Português do Brasil, linguagem falada — o texto é lido em voz alta, não lido na tela.
- Nunca invente número, dado de venda ou estatística que não foi passado no prompt. Se faltar dado, não estime.
- Nunca prometa resultado garantido, alegue cura ou use superlativo sem base (ex: "o melhor", "definitivo", "nunca mais").
- Devolva só o JSON pedido, sem comentário fora dele.`;

const LABEL_PUBLICO: Record<RoteiroPublico, string> = {
  frio: "público frio (nunca ouviu falar do produto)",
  morno: "público morno (já viu o produto ou similar antes)",
  quente: "público quente (já demonstrou interesse, precisa só do empurrão final)",
};

const LABEL_FORMATO: Record<ConteudoFormato, string> = {
  video_curto: "vídeo curto",
  live: "roteiro de abertura de live",
  carrossel: "carrossel (cada linha vira um slide)",
  unboxing: "unboxing",
};

function fatosDoProduto(produto: Produto): string {
  const linhas = [`Nome: ${produto.nome}`];
  if (produto.preco !== undefined) linhas.push(`Preço: R$ ${produto.preco.toFixed(2)}`);
  if (produto.comissaoPct !== undefined) linhas.push(`Comissão do afiliado: ${produto.comissaoPct}%`);
  if (produto.observacao) linhas.push(`Observação do afiliado: ${produto.observacao}`);
  return linhas.join("\n");
}

export function montarPromptRoteiro(params: {
  produto: Produto;
  publico: RoteiroPublico;
  formato: ConteudoFormato;
  duracaoSegundos?: number;
}): string {
  const { produto, publico, formato, duracaoSegundos } = params;
  return `Escreva um roteiro de ${LABEL_FORMATO[formato]} para o produto abaixo, para ${LABEL_PUBLICO[publico]}.
${duracaoSegundos ? `Duração alvo: ${duracaoSegundos} segundos.` : ""}

Dados do produto (só use o que está aqui, não invente mais nada):
${fatosDoProduto(produto)}

Devolva um JSON com exatamente os campos "gancho" (os 3 primeiros segundos, a frase que prende antes de qualquer explicação), "corpo" (o desenvolvimento) e "cta" (a chamada para ação final, mencionando o link/vitrine do TikTok Shop).`;
}

export function montarPromptGanchos(params: { produto: Produto; publico: RoteiroPublico; corpo: string }): string {
  const { produto, publico, corpo } = params;
  return `O corpo do roteiro abaixo já está pronto para o produto "${produto.nome}", direcionado a ${LABEL_PUBLICO[publico]}.

Corpo:
"""
${corpo}
"""

Gere 3 variações de gancho (os 3 primeiros segundos) para esse mesmo corpo, cada uma com uma abordagem diferente (pergunta, choque/curiosidade, identificação com a dor). Devolva um JSON com o campo "ganchos", uma lista com exatamente 3 strings.`;
}

export const ROTEIRO_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    gancho: { type: "string" },
    corpo: { type: "string" },
    cta: { type: "string" },
  },
  required: ["gancho", "corpo", "cta"],
};

export const GANCHOS_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    ganchos: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
  },
  required: ["ganchos"],
};
