import { boolean, integer, numeric, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

/**
 * Schema Drizzle (PRD seção 7). Datas ficam como `timestamp` em modo string — o resto do
 * sistema (packages/shared, apps/web) já trata toda data como ISO string, então não há
 * conversão extra na fronteira repositório <-> banco.
 */

/**
 * Dono do registro (multiusuário — PLANO-MULTIUSUARIO.md). Vai em toda tabela de dado, inclusive
 * nas filhas, pra toda consulta filtrar pela própria tabela. Apagar o usuário apaga tudo dele.
 */
const colunaDono = () =>
  uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" });

export const categoriaCorEnum = pgEnum("categoria_cor", [
  "neutral",
  "success",
  "warning",
  "error",
  "accent",
  "rose",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "teal",
  "cyan",
  "blue",
  "indigo",
  "purple",
  "fuchsia",
  "pink",
]);

export const categorias = pgTable("categorias", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: colunaDono(),
  nome: text("nome").notNull(),
  cor: categoriaCorEnum("cor").notNull().default("neutral"),
  emoji: text("emoji"),
  criadoEm: timestamp("criado_em", { mode: "string" }).notNull().defaultNow(),
});

export const produtoFonteEnum = pgEnum("produto_fonte", ["api", "manual"]);
export const produtoStatusEnum = pgEnum("produto_status", ["radar", "ativo", "pausado", "descartado"]);

export const produtos = pgTable("produtos", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: colunaDono(),
  tiktokProductId: text("tiktok_product_id"),
  // Nome cru da planilha na primeira importação — chave de casamento pra reimportar sem duplicar mesmo com `nome` editado.
  nomeImportado: text("nome_importado"),
  fonte: produtoFonteEnum("fonte").notNull().default("manual"),
  sincronizadoEm: timestamp("sincronizado_em", { mode: "string" }),
  nome: text("nome").notNull(),
  emoji: text("emoji"),
  loja: text("loja"),
  categoriaId: uuid("categoria_id").references(() => categorias.id, { onDelete: "set null" }),
  linkTiktok: text("link_tiktok"),
  imagemUrl: text("imagem_url"),
  preco: numeric("preco", { mode: "number" }),
  comissaoPct: numeric("comissao_pct", { mode: "number" }),
  comissaoValor: numeric("comissao_valor", { mode: "number" }),
  status: produtoStatusEnum("status").notNull().default("radar"),
  notaPotencial: integer("nota_potencial"),
  observacao: text("observacao"),
  arquivado: boolean("arquivado").notNull().default(false),
  criadoEm: timestamp("criado_em", { mode: "string" }).notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em", { mode: "string" }).notNull().defaultNow(),
}, (t) => [unique("produtos_usuario_nome_importado_unique").on(t.usuarioId, t.nomeImportado)]);

export const amostraStatusEnum = pgEnum("amostra_status", [
  "solicitada",
  "aprovada",
  "enviada",
  "recebida",
  "publicada",
  "recusada",
  "devolvida",
  "para_publicar",
  "publicado",
  "vendida",
  "descartada",
]);
export const amostraOrigemEnum = pgEnum("amostra_origem", ["gratuita", "comprada", "parceria"]);
export const amostraColunaCorEnum = pgEnum("amostra_coluna_cor", [
  "neutral",
  "success",
  "warning",
  "error",
  "accent",
  "blue",
]);

/** Coluna extra do quadro de Amostras, criada livremente pelo usuário — não mexe no status/prazo da amostra. */
export const amostraColunas = pgTable("amostra_colunas", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: colunaDono(),
  nome: text("nome").notNull(),
  cor: amostraColunaCorEnum("cor").notNull().default("neutral"),
  ordem: integer("ordem").notNull().default(0),
  criadoEm: timestamp("criado_em", { mode: "string" }).notNull().defaultNow(),
});

export const amostras = pgTable("amostras", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: colunaDono(),
  produtoId: uuid("produto_id")
    .notNull()
    .references(() => produtos.id, { onDelete: "cascade" }),
  status: amostraStatusEnum("status").notNull().default("para_publicar"),
  origem: amostraOrigemEnum("origem").notNull().default("gratuita"),
  custo: numeric("custo", { mode: "number" }).notNull().default(0),
  dataSolicitacao: timestamp("data_solicitacao", { mode: "string" }),
  dataRecebimento: timestamp("data_recebimento", { mode: "string" }),
  publicadoEm: timestamp("publicado_em", { mode: "string" }),
  prazoConteudo: timestamp("prazo_conteudo", { mode: "string" }),
  codigoRastreio: text("codigo_rastreio"),
  observacao: text("observacao"),
  colunaCustomizadaId: uuid("coluna_customizada_id").references(() => amostraColunas.id, { onDelete: "set null" }),
  criadoEm: timestamp("criado_em", { mode: "string" }).notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em", { mode: "string" }).notNull().defaultNow(),
});

export const conteudoFormatoEnum = pgEnum("conteudo_formato", ["video_curto", "live", "carrossel", "unboxing"]);
export const conteudoStatusEnum = pgEnum("conteudo_status", [
  "ideia",
  "roteiro_pronto",
  "gravado",
  "editado",
  "publicado",
]);

export const conteudos = pgTable("conteudos", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: colunaDono(),
  produtoId: uuid("produto_id")
    .notNull()
    .references(() => produtos.id, { onDelete: "cascade" }),
  amostraId: uuid("amostra_id").references(() => amostras.id, { onDelete: "set null" }),
  titulo: text("titulo").notNull(),
  formato: conteudoFormatoEnum("formato").notNull(),
  status: conteudoStatusEnum("status").notNull().default("ideia"),
  dataPrevista: timestamp("data_prevista", { mode: "string" }),
  dataPublicacao: timestamp("data_publicacao", { mode: "string" }),
  linkPublicacao: text("link_publicacao"),
  criadoEm: timestamp("criado_em", { mode: "string" }).notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em", { mode: "string" }).notNull().defaultNow(),
});

export const roteiroPublicoEnum = pgEnum("roteiro_publico", ["frio", "morno", "quente"]);

export const roteiros = pgTable("roteiros", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: colunaDono(),
  conteudoId: uuid("conteudo_id")
    .notNull()
    .references(() => conteudos.id, { onDelete: "cascade" }),
  produtoId: uuid("produto_id")
    .notNull()
    .references(() => produtos.id, { onDelete: "cascade" }),
  publico: roteiroPublicoEnum("publico").notNull(),
  gancho: text("gancho").notNull(),
  corpo: text("corpo").notNull(),
  cta: text("cta").notNull(),
  versao: integer("versao").notNull().default(1),
  geradoPorIa: boolean("gerado_por_ia").notNull().default(false),
  modeloIa: text("modelo_ia"),
  editadoManualmente: boolean("editado_manualmente").notNull().default(false),
  criadoEm: timestamp("criado_em", { mode: "string" }).notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em", { mode: "string" }).notNull().defaultNow(),
});

/**
 * Tabelas da Fase 3 (integração TikTok Shop — PLANO-IMPLEMENTACAO-FASE3.md, hoje pausada).
 * Existem desde já porque não dependem de credencial nenhuma: `vendas` também recebe dado por
 * importação manual (plano B do PRD 8.6) quando a sincronização for retomada, e `integracoes`/
 * `sincronizacoes` são só estrutura de log, sem lógica de negócio ainda.
 */

export const vendaOrigemEnum = pgEnum("venda_origem", ["video", "live", "vitrine", "outro"]);
export const vendaStatusPedidoEnum = pgEnum("venda_status_pedido", [
  "pendente",
  "aguardando_pagamento",
  "enviado",
  "concluido",
  "cancelado",
  "inelegivel",
  "devolvido",
]);
export const vendaFonteEnum = pgEnum("venda_fonte", ["api", "importacao"]);

export const vendas = pgTable("vendas", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: colunaDono(),
  // Chave única do pedido na API — base do upsert que evita duplicar venda (PRD seção 6.4, regra 3).
  tiktokOrderId: text("tiktok_order_id").notNull(),
  produtoId: uuid("produto_id")
    .notNull()
    .references(() => produtos.id, { onDelete: "cascade" }),
  conteudoId: uuid("conteudo_id").references(() => conteudos.id, { onDelete: "set null" }),
  data: timestamp("data", { mode: "string" }).notNull(),
  origem: vendaOrigemEnum("origem").notNull(),
  statusPedido: vendaStatusPedidoEnum("status_pedido").notNull().default("pendente"),
  pedidos: integer("pedidos").notNull().default(0),
  itens: integer("itens").notNull().default(0),
  gmv: numeric("gmv", { mode: "number" }).notNull().default(0),
  comissao: numeric("comissao", { mode: "number" }).notNull().default(0),
  // Só conta no total do mês quando true — pedido cancelado/devolvido muda de status, nunca some (PRD seção 7).
  comissaoConfirmada: boolean("comissao_confirmada").notNull().default(false),
  fonte: vendaFonteEnum("fonte").notNull().default("api"),
  sincronizadoEm: timestamp("sincronizado_em", { mode: "string" }),
  criadoEm: timestamp("criado_em", { mode: "string" }).notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em", { mode: "string" }).notNull().defaultNow(),
}, (t) => [unique("vendas_usuario_tiktok_order_id_unique").on(t.usuarioId, t.tiktokOrderId)]);

export const integracaoProvedorEnum = pgEnum("integracao_provedor", ["tiktok_shop"]);
export const integracaoStatusEnum = pgEnum("integracao_status", ["conectada", "expirada", "erro", "desconectada"]);

export const integracoes = pgTable("integracoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: colunaDono(),
  provedor: integracaoProvedorEnum("provedor").notNull().default("tiktok_shop"),
  contaNome: text("conta_nome").notNull(),
  // Criptografar na aplicação antes de gravar quando o fluxo OAuth existir (PRD 6.4) — a coluna só guarda texto já cifrado.
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiraEm: timestamp("expira_em", { mode: "string" }),
  escopos: text("escopos").array(),
  status: integracaoStatusEnum("status").notNull().default("desconectada"),
  criadoEm: timestamp("criado_em", { mode: "string" }).notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em", { mode: "string" }).notNull().defaultNow(),
});

export const sincronizacaoTipoEnum = pgEnum("sincronizacao_tipo", ["produtos", "vendas", "comissao"]);
export const sincronizacaoStatusEnum = pgEnum("sincronizacao_status", ["sucesso", "parcial", "erro"]);

export const sincronizacoes = pgTable("sincronizacoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: colunaDono(),
  tipo: sincronizacaoTipoEnum("tipo").notNull(),
  iniciadaEm: timestamp("iniciada_em", { mode: "string" }).notNull().defaultNow(),
  concluidaEm: timestamp("concluida_em", { mode: "string" }),
  registrosCriados: integer("registros_criados").notNull().default(0),
  registrosAtualizados: integer("registros_atualizados").notNull().default(0),
  status: sincronizacaoStatusEnum("status").notNull(),
  mensagemErro: text("mensagem_erro"),
});

export const metas = pgTable("metas", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: colunaDono(),
  // "AAAA-MM" — uma linha de metas por mês.
  mes: text("mes").notNull(),
  videos: integer("videos").notNull().default(0),
  faturamento: numeric("faturamento", { mode: "number" }).notNull().default(0),
  lives: integer("lives").notNull().default(0),
  nivel: integer("nivel").notNull().default(0),
  criadoEm: timestamp("criado_em", { mode: "string" }).notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em", { mode: "string" }).notNull().defaultNow(),
}, (t) => [unique("metas_usuario_mes_unique").on(t.usuarioId, t.mes)]);

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  // Formato "scrypt$<salt hex>$<hash hex>" — nunca a senha em si.
  senhaHash: text("senha_hash").notNull(),
  // Entra no token de sessão assinado: incrementar (troca de senha) invalida toda sessão aberta.
  versaoSessao: integer("versao_sessao").notNull().default(0),
  // LGPD: quando aceitou Termos + Política de Privacidade. Null = conta criada antes do cadastro aberto.
  aceitouTermosEm: timestamp("aceitou_termos_em", { mode: "string" }),
  criadoEm: timestamp("criado_em", { mode: "string" }).notNull().defaultNow(),
});

/** Link de "esqueci a senha": guarda só o hash do token (o token em si só existe no e-mail). Uso único, expira em 1h. */
export const redefinicoesSenha = pgTable("redefinicoes_senha", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: colunaDono(),
  tokenHash: text("token_hash").notNull().unique(),
  expiraEm: timestamp("expira_em", { mode: "string" }).notNull(),
  usadoEm: timestamp("usado_em", { mode: "string" }),
  criadoEm: timestamp("criado_em", { mode: "string" }).notNull().defaultNow(),
});

/**
 * Contadores de freio (tentativas de login/cadastro por IP, gerações de IA por usuário). No banco
 * e não em memória porque na Vercel cada instância da função teria o próprio contador.
 * `chave` = "<tipo>:<ip ou usuário>"; a janela recomeça quando `desde` fica mais velho que ela.
 */
export const limitesUso = pgTable("limites_uso", {
  chave: text("chave").primaryKey(),
  quantidade: integer("quantidade").notNull().default(0),
  desde: timestamp("desde", { mode: "string" }).notNull().defaultNow(),
});
