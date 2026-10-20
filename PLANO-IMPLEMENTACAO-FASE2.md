# Plano de Implementação — Fase 2 (MEU GERENTE)

Continuação de [PLANO-IMPLEMENTACAO.md](PLANO-IMPLEMENTACAO.md) (Fase 1). Baseado no PRD seção 14: "Banco conectado, Roteiros com Gemini, Dashboard completo".

## Contexto

A Fase 1 rodava inteira no navegador, com os repositórios em memória/localStorage — suficiente para Produtos, Amostras e Calendário, que não dependem de segredo. A Fase 2 exige dois recursos que não podem existir no `apps/web`: a connection string do Postgres (Supabase) e a chave da Gemini API (PRD seção 6.3, 13 Risco 2). Isso muda a arquitetura: o `apps/server`, que na Fase 1 era só um stub, passa a ser a única porta de entrada para dado e para IA — o navegador não fala mais com o banco nem com o Google direto, só com o `apps/server`.

Decisões tomadas com o usuário para esta rodada:
- **Banco:** Supabase já está pronto do lado do usuário. Ele configura `DATABASE_URL` em `apps/server/.env` (nunca compartilhado no chat).
- **Gemini:** o usuário ainda não tem a chave. A integração inteira (rotas, prompts, parsing) foi construída e testa sem 500 mesmo sem chave — sem `GEMINI_API_KEY`, `/api/ia/*` responde 503 com mensagem clara em vez de quebrar ou inventar resposta.

## Escopo desta fase (o que entrou)

- **Banco conectado:** schema Drizzle (`produtos`, `amostras`, `conteudos`, `roteiros`) + migrations versionadas, tudo em `apps/server/src/db`.
- **API de dados:** rotas REST em `apps/server` (`/api/produtos`, `/api/amostras`, `/api/conteudos`, `/api/roteiros`) — CRUD + mudança de status, delegando pros repositórios Postgres (`*.pg.ts`).
- **Repositórios do `apps/web` trocados** de memória/localStorage para HTTP (`*.http.ts`, via `lib/api-client.ts`) — nenhuma tela mudou, só a implementação em `lib/repositories/index.ts`, exatamente como o PRD 6.2 previa.
- **Módulo Roteiros** (PRD seção 8.5): escolher produto → público → formato/duração → gerar via Gemini → editar gancho/corpo/cta separado → gerar 3 variações de gancho → salvar vinculado a um conteúdo → biblioteca filtrável por público.
- **Integração Gemini** (PRD seção 9): rotas `/api/ia/roteiro` e `/api/ia/ganchos`, prompt system com as regras não negociáveis (nunca inventa número, saída JSON estruturada, português falado, sem promessa proibida), modelo configurável via `GEMINI_MODEL_RAPIDO`.

## Fora de escopo desta fase

- **Chave da Gemini de verdade** — a integração está pronta, mas não testada contra a API real. O usuário adiciona a chave quando tiver.
- **`/api/ia/analise-vendas` e `/api/ia/potencial-produto`** — dependem de dado de venda, que só existe na Fase 3/4 (integração TikTok Shop).
- **Dashboard completo** — os cards de GMV/comissão continuam em estado vazio; dependem da sincronização de vendas (Fase 3), não de banco conectado.
- **Marcar roteiro como "funcionou"** (citado no PRD 8.5) — não entrou porque a tabela `roteiros` do PRD (seção 7) não tem esse campo; fica pra quando o modelo de dados for revisto.
- **OAuth do TikTok Shop, sincronizadores, tabela `integracoes`/`sincronizacoes`** — Fase 3.

## Arquitetura

```
apps/web  --HTTP-->  apps/server  --Drizzle-->  Postgres (Supabase)
                          |
                          '--> Gemini API (só quando GEMINI_API_KEY existir)
```

- `packages/shared`: interfaces de repositório e tipos de entidade continuam sendo o contrato único — `apps/web` e `apps/server` implementam a mesma interface, cada um do seu lado.
- `apps/server/src/db/schema.ts`: schema Drizzle, uma tabela por entidade.
- `apps/server/src/repositories/*.pg.ts`: implementação Postgres da interface de `packages/shared`.
- `apps/server/src/routes/*.ts`: rotas Express finas (validação mínima, delega pro repositório).
- `apps/server/src/ia/`: `gemini-client.ts` (chamada ao modelo, com `geminiDisponivel()` pra degradar sem quebrar) e `prompts.ts` (system instruction + montagem de prompt com dado real).
- `apps/web/src/lib/repositories/*.http.ts`: implementação HTTP da mesma interface, usada pelos hooks existentes sem nenhuma mudança de assinatura.

## Critério de conclusão

Citando o PRD (seção 14, Fase 2): **"Roteiro gerado e usado em vídeo publicado de verdade."** — isso só fecha depois que o usuário configurar `GEMINI_API_KEY` e testar a geração de verdade; o que esta rodada entrega é a integração pronta pra esse teste.

## Verificação

1. `apps/server/.env` com `DATABASE_URL` preenchida (a partir de `.env.example`).
2. `npm run db:generate --workspace=apps/server` → `npm run db:migrate --workspace=apps/server` → `npm run db:seed --workspace=apps/server`.
3. `npm run dev:server` e `npm run dev:web` — o Dashboard/Produtos/Amostras/Calendário devem continuar funcionando exatamente como na Fase 1, agora lendo do Postgres em vez de localStorage.
4. Abrir `/roteiros`, escolher um produto com conteúdo agendado, clicar em "Gerar roteiro" **sem** `GEMINI_API_KEY` configurada → deve aparecer o erro "GEMINI_API_KEY não está definida...", não uma tela quebrada.
5. Depois que o usuário configurar `GEMINI_API_KEY`: gerar roteiro de verdade, editar os três campos, gerar variação de gancho, salvar e confirmar que aparece na biblioteca do produto.
6. `tsc -b` limpo em `apps/web` e `apps/server`, `npm run build` na raiz sem erro.
