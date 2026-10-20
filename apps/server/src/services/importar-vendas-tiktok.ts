import type {
  AnaliseImportacaoVendas,
  Produto,
  ProdutoOverrideImportacao,
  ResumoImportacaoVendas,
  VendaOrigem,
  VendaStatusPedido,
} from "@meugerente/shared";
import * as XLSX from "xlsx";
import { produtoRepository, vendaRepository } from "../repositories/index.js";

type LinhaPlanilha = Record<string, string>;

/**
 * O zip que o TikTok Shop Affiliate Center exporta não é lido pelo exceljs (0 planilhas
 * encontradas, sem erro) — o pacote `xlsx` (SheetJS) lê normalmente. Instalado a partir do
 * CDN oficial da SheetJS (não do npm) porque a versão do npm tem CVE de prototype pollution/ReDoS
 * sem correção publicada lá; a build da SheetJS já vem corrigida.
 */
function lerLinhasPlanilha(buffer: Buffer): LinhaPlanilha[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const nomeAba = workbook.SheetNames[0];
  if (!nomeAba) throw new Error("Planilha vazia ou em formato inesperado.");

  const linhasBrutas = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[nomeAba], { defval: "" });
  return linhasBrutas.map((linha) => {
    const registro: LinhaPlanilha = {};
    for (const [chave, valor] of Object.entries(linha)) {
      registro[chave.trim()] = String(valor ?? "").trim();
    }
    return registro;
  });
}

function linhasValidas(buffer: Buffer): { linhas: LinhaPlanilha[]; linhasIgnoradas: number } {
  const todasLinhas = lerLinhasPlanilha(buffer);
  const linhas = todasLinhas.filter((l) => l["ID do pedido"] && l["Nome do produto"]);
  return { linhas, linhasIgnoradas: todasLinhas.length - linhas.length };
}

/** Números vêm como texto no padrão BR ("1.234,56"); pontos são milhar, vírgula é decimal. */
function paraNumero(valor: string | undefined): number {
  if (!valor) return 0;
  const normalizado = valor.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : 0;
}

/** Diferente dos outros números da planilha, o percentual ("10.5%") já vem com ponto decimal. */
function paraPercentual(valor: string | undefined): number | undefined {
  if (!valor) return undefined;
  const numero = Number(valor.replace("%", "").replace(",", "."));
  return Number.isFinite(numero) ? numero : undefined;
}

/** "23/09/2026 15:22:25" (DD/MM/AAAA); "/" sozinho significa que o pedido ainda não liquidou. */
function paraDataISO(valor: string | undefined): string | undefined {
  if (!valor || valor === "/") return undefined;
  const m = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/);
  if (!m) return undefined;
  const [, dia, mes, ano, hora = "00", min = "00", seg = "00"] = m;
  const data = new Date(`${ano}-${mes}-${dia}T${hora}:${min}:${seg}`);
  return Number.isNaN(data.getTime()) ? undefined : data.toISOString();
}

function normalizarNome(nome: string): string {
  return nome.trim().toLowerCase().replace(/\s+/g, " ");
}

const STATUS_MAP: Record<string, VendaStatusPedido> = {
  pendente: "pendente",
  awaitingpayment: "aguardando_pagamento",
  inelegível: "inelegivel",
  inelegivel: "inelegivel",
  liquidado: "concluido",
  cancelado: "cancelado",
  cancelled: "cancelado",
};

function mapearStatus(valor: string): VendaStatusPedido {
  return STATUS_MAP[valor.trim().toLowerCase()] ?? "pendente";
}

const ORIGEM_MAP: Record<string, VendaOrigem> = {
  vídeo: "video",
  video: "video",
  live: "live",
  vitrine: "vitrine",
};

function mapearOrigem(valor: string): VendaOrigem {
  return ORIGEM_MAP[valor.trim().toLowerCase()] ?? "outro";
}

function emLotes<T>(itens: T[], tamanho: number): T[][] {
  const lotes: T[][] = [];
  for (let i = 0; i < itens.length; i += tamanho) lotes.push(itens.slice(i, i + tamanho));
  return lotes;
}

interface ProdutoDaLinha {
  chave: string;
  tiktokProductId?: string;
  nomeRaw: string;
  lojaSugerida?: string;
  precoSugerido?: number;
  comissaoPctSugerida?: number;
  linhas: number;
}

/** Um produto por nome exato da planilha — o nome é a chave de casamento pra sempre (o mesmo nome pode vir com IDs do TikTok diferentes). */
function agruparProdutosDaPlanilha(linhas: LinhaPlanilha[]): Map<string, ProdutoDaLinha> {
  const grupos = new Map<string, ProdutoDaLinha>();
  for (const linha of linhas) {
    const nomeRaw = linha["Nome do produto"];
    const tiktokProductId = linha["ID do produto"] || undefined;
    const chave = nomeRaw;

    const existente = grupos.get(chave);
    if (existente) {
      existente.linhas++;
      continue;
    }
    grupos.set(chave, {
      chave,
      tiktokProductId,
      nomeRaw,
      lojaSugerida: linha["Nome da loja"] || undefined,
      precoSugerido: paraNumero(linha["Preço"]) || undefined,
      comissaoPctSugerida: paraPercentual(linha["Padrão"]),
      linhas: 1,
    });
  }
  return grupos;
}

/** Casa cada produto da planilha com um já cadastrado — por `tiktokProductId`, depois pelo `nomeImportado` exato, depois por nome normalizado (planilhas importadas antes desse recurso existir). */
async function resolverProdutosExistentes(
  grupos: Map<string, ProdutoDaLinha>,
): Promise<{ resolvidos: Map<string, Produto>; novos: ProdutoDaLinha[] }> {
  const produtosExistentes = await produtoRepository.listar();
  const porTiktokId = new Map(produtosExistentes.filter((p) => p.tiktokProductId).map((p) => [p.tiktokProductId as string, p]));
  const porNomeImportado = new Map(produtosExistentes.filter((p) => p.nomeImportado).map((p) => [p.nomeImportado as string, p]));
  const porNomeNormalizado = new Map(produtosExistentes.map((p) => [normalizarNome(p.nome), p]));

  const resolvidos = new Map<string, Produto>();
  const novos: ProdutoDaLinha[] = [];

  for (const grupo of grupos.values()) {
    const produto =
      (grupo.tiktokProductId && porTiktokId.get(grupo.tiktokProductId)) ||
      porNomeImportado.get(grupo.nomeRaw) ||
      porNomeNormalizado.get(normalizarNome(grupo.nomeRaw));
    if (produto) resolvidos.set(grupo.chave, produto);
    else novos.push(grupo);
  }

  return { resolvidos, novos };
}

/** Passo 1: só analisa a planilha e devolve os produtos que ainda não existem, pro usuário revisar nome/categoria antes de criar. */
export async function analisarVendasTiktok(buffer: Buffer): Promise<AnaliseImportacaoVendas> {
  const { linhas } = linhasValidas(buffer);
  const grupos = agruparProdutosDaPlanilha(linhas);
  const { resolvidos, novos } = await resolverProdutosExistentes(grupos);

  return {
    produtosNovos: novos
      .sort((a, b) => b.linhas - a.linhas)
      .map((n) => ({
        nomeImportado: n.nomeRaw,
        nomeSugerido: n.nomeRaw,
        lojaSugerida: n.lojaSugerida,
        precoSugerido: n.precoSugerido,
        comissaoPctSugerida: n.comissaoPctSugerida,
        linhas: n.linhas,
      })),
    produtosReconhecidos: resolvidos.size,
    linhasTotais: linhas.length,
  };
}

/**
 * Passo 2: importa de fato. `overrides` (chave = nome exato da planilha) vem do popup de revisão —
 * nome/categoria escolhidos pelo usuário pros produtos novos. O nome CRU da planilha sempre vira
 * `nomeImportado`, então reimportar depois casa por ele mesmo se o usuário tiver renomeado o produto.
 */
export async function importarVendasTiktok(
  buffer: Buffer,
  overrides: Record<string, ProdutoOverrideImportacao> = {},
): Promise<ResumoImportacaoVendas> {
  const { linhas, linhasIgnoradas } = linhasValidas(buffer);
  const grupos = agruparProdutosDaPlanilha(linhas);
  const { resolvidos, novos } = await resolverProdutosExistentes(grupos);

  let produtosCriados = 0;
  for (const grupo of novos) {
    const override = overrides[grupo.nomeRaw];
    const produto = await produtoRepository.criar({
      nome: override?.nome?.trim() || grupo.nomeRaw,
      categoriaId: override?.categoriaId,
      loja: grupo.lojaSugerida,
      preco: grupo.precoSugerido,
      comissaoPct: grupo.comissaoPctSugerida,
      tiktokProductId: grupo.tiktokProductId,
      nomeImportado: grupo.nomeRaw,
      fonte: "manual",
      status: "ativo",
    });
    produtosCriados++;
    resolvidos.set(grupo.chave, produto);
  }

  // Produto que só bateu pelo nome normalizado (planilha importada antes desse recurso) ganha a chave estável agora.
  for (const grupo of grupos.values()) {
    const produto = resolvidos.get(grupo.chave);
    if (produto && !produto.nomeImportado) {
      resolvidos.set(grupo.chave, await produtoRepository.atualizar(produto.id, { nomeImportado: grupo.nomeRaw }));
    }
  }

  let linhasProcessadas = 0;
  for (const lote of emLotes(linhas, 15)) {
    await Promise.all(
      lote.map(async (linha) => {
        const produto = resolvidos.get(linha["Nome do produto"]);
        if (!produto) return;

        const idSku = linha["ID do SKU"] || "0";
        const statusPedido = mapearStatus(linha["Status de liquidação do pedido"] ?? "");
        const tiktokOrderId = `${linha["ID do pedido"]}-${idSku}`;

        await vendaRepository.upsertPorTiktokOrderId(tiktokOrderId, {
          tiktokOrderId,
          produtoId: produto.id,
          data: paraDataISO(linha["Data do pedido"]) ?? new Date().toISOString(),
          origem: mapearOrigem(linha["Tipo de conteúdo"] ?? ""),
          statusPedido,
          pedidos: 1,
          itens: Math.trunc(paraNumero(linha["Itens vendidos"])),
          gmv: paraNumero(linha["GMV"]),
          comissao:
            paraNumero(linha["Valor total final recebido"]) ||
            paraNumero(linha["Comissão padrão"]) ||
            paraNumero(linha["Comissão padrão estimada"]),
          comissaoConfirmada: statusPedido === "concluido",
          fonte: "importacao",
          sincronizadoEm: new Date().toISOString(),
        });
        linhasProcessadas++;
      }),
    );
  }

  return { linhasProcessadas, linhasIgnoradas, produtosCriados };
}
