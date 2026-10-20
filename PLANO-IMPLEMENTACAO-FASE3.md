# Plano de Implementação — Fase 3 (MEU GERENTE)

> **STATUS: PAUSADO (18/09/2026).** Decisão do usuário: pausar a sincronização com o TikTok Shop por tempo indeterminado — o acesso ao Partner Center não andou. O sistema segue rodando só como ferramenta de organização manual (Fases 1 e 2: Produtos, Amostras, Calendário, Roteiros com Gemini), sem nada de TikTok.
>
> **O que já foi adiantado, por não depender de credencial nenhuma (passos 1 e 2 do plano):**
> - Tipo `Venda` + interface `VendaRepository` em `packages/shared`.
> - Tabelas `vendas`, `integracoes` e `sincronizacoes` no schema Drizzle, migration já aplicada no Supabase real.
>
> **O que ainda não existe** (só entra quando o `app_key`/`app_secret` chegarem): `VendaRepositoryPg` (implementação Postgres), rotas `/api/tiktok/*`, `lib/tiktok/*` (auth, client, mapper, sync), cron e a tela de status. Retomar a partir do passo 3.

Continuação de [PLANO-IMPLEMENTACAO-FASE2.md](PLANO-IMPLEMENTACAO-FASE2.md). Baseado no PRD seção 14 ("OAuth do TikTok, sincronizador de produtos e vendas, cron, tela de status") e seção 6.4.

## Pré-requisito bloqueante (Fase 0 do PRD)

Diferente do banco e da Gemini, isso **não dá pra contornar com um `.env` vazio** — sem aprovação do TikTok, a API não responde:

1. Conta de desenvolvedor aprovada no **TikTok Shop Partner Center**.
2. App criado, com `app_key` e `app_secret` emitidos.
3. Escopos de produto, pedido e afiliado aprovados.
4. Ambiente de sandbox liberado.

Isso tem prazo incerto e não depende de mim. **Recomendo abrir esse cadastro agora**, em paralelo — o PRD (seção 13, Risco 3) já avisa que é a tarefa de maior espera. Enquanto não tiver `app_key`/`app_secret`, eu construo a integração inteira do mesmo jeito que fiz com a Gemini: pronta, com as rotas de OAuth e sync retornando erro claro em vez de fingir sucesso.

## Escopo desta fase

- **`lib/tiktok/auth.ts`** — fluxo OAuth (redirect, troca de código por token, renovação automática antes de expirar).
- **`lib/tiktok/client.ts`** — assinatura de requisição, timestamp, fila com espera crescente pro limite de chamadas.
- **`lib/tiktok/mapper.ts`** — traduz o formato da API pro modelo interno (`Produto`, `Venda`).
- **`lib/tiktok/sync/produtos.ts`** e **`sync/vendas.ts`** — um sincronizador por domínio, incremental (só o que mudou desde `sincronizado_em`), idempotente (`upsert` pelo ID do TikTok).
- **Tabelas novas** no schema Drizzle: `integracoes` (conexão, tokens criptografados, escopos, status) e `sincronizacoes` (log de cada rodada — criados, atualizados, erro).
- **Rotas:** `GET /api/tiktok/auth/iniciar`, `GET /api/tiktok/auth/retorno`, `POST /api/tiktok/sync/produtos`, `POST /api/tiktok/sync/vendas`, `GET /api/tiktok/status`, `POST /api/cron/sync`.
- **Entidade `Venda`** em `packages/shared` (ainda não existe — só `Produto`, `Amostra`, `Conteudo`, `Roteiro`).
- **Tela de status** no Dashboard e em Análise de Vendas (faixa: conectada/sincronizando/atrasada/erro — já desenhada no PRD seção 8.6).
- **Regra de dono do dado:** campo vindo da API é somente leitura na interface; campo do usuário (nota, observação, status de trabalho) nunca é sobrescrito pela sincronização (PRD 6.4, regra 4).

## Fora de escopo desta fase

- **Módulo Análise de Vendas completo** (ranking, comparação de origem, diagnóstico da Gemini) — isso é Fase 4, consome o dado que a sincronização vai gravar.
- **Importação manual de CSV/XLSX** (plano B do PRD 8.6) — só entra se a API não cobrir tudo; decide depois de ver os escopos liberados.
- **Cron de verdade agendado** (Vercel Cron/Supabase Edge Functions) — como ainda estamos local, a rota `/api/cron/sync` fica pronta pra ser chamada, mas o agendamento em produção é decisão de deploy, não de código.

## Passo a passo

1. Adicionar `Venda` a `packages/shared` (tipo + interface `VendaRepository`), seguindo o mesmo padrão de `Roteiro`.
2. Schema Drizzle: tabelas `vendas`, `integracoes`, `sincronizacoes` + migration.
3. `lib/tiktok/auth.ts` e `client.ts` — esqueleto funcional, mas que falha com erro claro sem `TIKTOK_APP_KEY`/`TIKTOK_APP_SECRET` (mesmo padrão do `geminiDisponivel()`).
4. Rotas de OAuth (`/api/tiktok/auth/*`) e `GET /api/tiktok/status`.
5. `mapper.ts` + sincronizador de produtos, com log em `sincronizacoes`.
6. Sincronizador de vendas (depende do produto já sincronizado).
7. `POST /api/cron/sync` chamando os dois sincronizadores em sequência.
8. Front: faixa de status da conexão no Dashboard e em uma tela `/analise-vendas` mínima (só a faixa de status + tabela de vendas cruas — o ranking/diagnóstico fica pra Fase 4).
9. Tirar o `emBreve` de "Análise de Vendas" no menu quando a tela mínima existir.

## Critério de conclusão

Citando o PRD (seção 14, Fase 3): **"Uma venda aparece no sistema sem você digitar nada."**

## Verificação

1. `apps/server/.env` com `TIKTOK_APP_KEY`, `TIKTOK_APP_SECRET` (a definir quando o cadastro for aprovado).
2. Sem essas variáveis: `/api/tiktok/*` responde erro claro, resto do sistema funciona normal (mesmo padrão da Gemini).
3. Com sandbox liberado: completar OAuth, rodar sync de produtos, conferir que campo de API fica travado na tela e campo do usuário não é sobrescrito.
4. Rodar sync de vendas, conferir idempotência (rodar duas vezes não duplica).
5. `tsc -b` limpo, `npm run build` sem erro.
