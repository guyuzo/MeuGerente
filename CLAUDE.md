# CLAUDE.md — MEU GERENTE

Instruções de desenvolvimento para este projeto. Ler junto com `PRD-MEU-GERENTE.md` (produto) e `design-system.md` (visual). Este arquivo define **como** construir; o PRD define **o quê**.

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS (SPA, sem Next.js).
- **Backend:** Node (Express) + TypeScript, em `apps/server`. Desde a Fase 2 ele tem duas responsabilidades: (1) a API de dados — CRUD de produtos/amostras/conteúdos/roteiros contra o Postgres (Supabase), porque o navegador não pode falar com o banco direto; (2) o que não pode rodar no navegador de jeito nenhum — chamadas à Gemini e (na Fase 3) tokens do TikTok Shop (PRD seção 6.3, 6.4). Não vira monólito de regra de negócio: cada rota é fina, delega pro repositório.
- **Banco:** Postgres via Supabase, acessado só pelo `apps/server` via Drizzle ORM (`apps/server/src/db`). `DATABASE_URL` fica em `apps/server/.env`, nunca no `apps/web`.
- **IA:** Google Gemini, chamada só por `apps/server/src/ia` (`GEMINI_API_KEY` em `apps/server/.env`). Sem a chave, as rotas `/api/ia/*` respondem 503 de propósito — nunca inventam resposta.
- **Monorepo:** `npm workspaces`, três pacotes:
  - `apps/web` — o SPA.
  - `apps/server` — API de dados + rotas de segredo (IA, e TikTok na Fase 3).
  - `packages/shared` — tipos das entidades do PRD (Produto, Amostra, Conteúdo, Roteiro, Venda...) e as interfaces de repositório, importadas pelos dois apps.

Next.js foi descartado a pedido do usuário; a divisão em dois apps existe **só** para preservar a regra do PRD de que segredo (e agora também connection string de banco) nunca chega ao navegador — não adicionar SSR, API routes ou qualquer coisa que o Vite puro não tem.

## Mobile-first obrigatório

- Todo componente e toda tela nascem estilados para o menor breakpoint (~375px) primeiro. Breakpoints maiores são adicionados com `sm:`/`md:`/`lg:` do Tailwind por cima do estilo mobile, nunca o contrário.
- O menu lateral fixo de 288px (PRD seção 10) só existe a partir de 1024px. Abaixo disso é gaveta (drawer), conforme o próprio PRD já definia como não-funcional.
- Nenhuma tela pode quebrar layout, cortar texto ou exigir scroll horizontal em 375px. Testar sempre nesse breakpoint antes de dar uma tela como pronta.

## Componentização e reuso — regra central

O sistema é construído em componentes, e **reuso vem antes de criação**:

1. Antes de escrever um componente novo, procurar em `apps/web/src/components/ui` e `apps/web/src/components/shared` (Glob/Grep pelo nome ou pela função) se já existe algo equivalente.
2. Se existir um componente parecido, estender por props/variantes em vez de duplicar. Duplicar componente por preguiça de ler a API do que já existe é o erro a evitar aqui.
3. Só criar componente novo quando não houver nada reaproveitável. Quando criar, colocar em `ui/` (componente genérico, sem conhecimento de domínio: Button, Card, Badge, Table, Modal, Input, Select, Tabs) ou em `shared/` (componente de domínio reaproveitado por mais de um módulo: StatusPill de amostra, DeadlineTag, ProductThumb).
4. Componente usado uma única vez, dentro de uma única tela, fica local em `pages/<modulo>/`, não em `ui/` nem `shared/`.

Essa biblioteca em `ui/` e `shared/` segue os tokens de `design-system.md` (cores, espaçamento em escala de 4px, radius, tipografia) — nunca um valor solto fora dessa tabela.

## Otimização de tokens nas sessões

Regra de trabalho para qualquer sessão do Claude Code neste projeto, para gastar o mínimo de contexto pelo melhor resultado:

- Antes de criar um componente, usar Glob/Grep para localizar candidato a reaproveitar em vez de reler pastas inteiras "para garantir".
- Ler arquivo grande só pelo trecho necessário (`offset`/`limit`), não o arquivo inteiro quando a tarefa é local.
- Preferir edição cirúrgica (Edit) a reescrever o arquivo inteiro (Write), exceto quando o arquivo é novo ou a reescrita é total.
- Não reler um arquivo logo depois de editá-lo — o resultado da edição já confirma o que mudou.
- Resumir em vez de colar blocos grandes de código, log ou saída de comando na conversa quando um resumo já responde à pergunta.
- Usar o contexto mínimo necessário para entender a tarefa: não puxar o PRD inteiro ou o design system inteiro de novo se a pergunta é sobre uma função isolada.

## Camada de repositório

Nenhum componente acessa dado diretamente, dos dois lados do monorepo:

- `apps/web/src/lib/repositories/*` implementa a interface de `packages/shared` fazendo fetch pra API do `apps/server` (`*.http.ts`). Hooks (`useProdutos`, `useAmostras`...) só conhecem essa interface, nunca a URL da API diretamente — isso fica encapsulado em `lib/api-client.ts`.
- `apps/server/src/repositories/*` implementa a **mesma** interface de `packages/shared` falando com Postgres via Drizzle (`*.pg.ts`). As rotas Express (`src/routes/*`) são finas: validam o essencial e delegam pro repositório.

Trocar de banco de novo, ou dar cache local no front, é trocar só a implementação apontada em cada `lib/repositories/index.ts` — nenhuma tela muda. Essa é a regra do PRD seção 6.2 e não é opcional.

## Multiusuário — isolamento por conta

Desde `PLANO-MULTIUSUARIO.md`, cada afiliado tem a própria conta e só enxerga os próprios dados:

- Toda tabela de dado tem `usuario_id` (inclusive as filhas). Tabela nova de dado nasce com `colunaDono()` do `schema.ts`.
- No server não existe instância única de repositório: rota usa `repositorios(res)`, que monta os `*.pg.ts` presos ao `res.locals.usuarioId` gravado pelo `exigirLogin`. O dono vem **só** da sessão, nunca do corpo/URL.
- Repositório novo: filtrar todo select/update/delete por `usuarioId`, gravar o dono no insert, passar o corpo por `semCamposProtegidos` e conferir toda referência a outro registro com `garantirReferencias` (id de outra conta = 404, igual a inexistente).
- Freios (login, cadastro, esqueci a senha, IA por dia) ficam na tabela `limites_uso`, não em memória — na Vercel cada instância teria o próprio contador.

## Banco de dados

Schema Drizzle em `apps/server/src/db/schema.ts` (uma tabela por entidade do PRD seção 7: produtos, amostras, conteudos, roteiros). Datas são `timestamp` em modo string, então nenhuma camada acima faz conversão de tipo na fronteira repositório ↔ banco.

Fluxo de migração:
```
npm run db:generate --workspace=apps/server   # gera SQL a partir do schema.ts
npm run db:migrate --workspace=apps/server    # aplica no Postgres apontado por DATABASE_URL
npm run db:seed --workspace=apps/server       # popula um catálogo de exemplo (idempotente não é — não rodar em produção com dado real)
```

Nunca escrever SQL de migração à mão nem editar uma migration já aplicada — mudar o schema e gerar de novo.

## Segredos nunca no cliente

Chave da Gemini, `DATABASE_URL` e (Fase 3) tokens do TikTok Shop (`access_token`, `refresh_token`, `app_secret`) existem **só** em `apps/server`, em variável de ambiente (`apps/server/.env`, nunca commitado — só `.env.example` vai pro repo). `apps/web` nunca importa, nunca recebe e nunca loga esses valores. Toda chamada de IA, banco ou TikTok do front é para uma rota interna de `apps/server` (`/api/produtos`, `/api/amostras`, `/api/conteudos`, `/api/roteiros`, `/api/ia/*`, e depois `/api/tiktok/*`), nunca direto pra API/banco externo.

## Estados obrigatórios de tela

Toda tela ou lista que busca dado precisa dos quatro estados do PRD (seção 10): **vazio** (com uma ação, não só uma frase), **carregando**, **erro** e **com dados**. Usar os componentes `EmptyState`, `Spinner`/`Skeleton` e `ErrorState` de `components/ui` em vez de recriar cada estado tela por tela.

## Design system

Identidade v1.0 (23/09/2026), tokens em `apps/web/src/index.css`: cor da marca lilás `purple-400` (`#B18BFF`) — nunca como texto sobre fundo claro, texto sobre ela é sempre `neutral-900`, texto lilás é `purple-600`+; ~85% neutros, ~10% lilás, ~5% avisos. `success` `#497D00`, `warning` `#9A5B00`, `error` `#C62828` (vermelho, não mais magenta), cada um com `-bg`. Botão `brand` (lilás) é reservado pra ações de IA; um único botão `primary` por tela. Títulos (h1/h2) em Plus Jakarta Sans 700, resto em Inter, números com `tabular-nums`. Foco: anel `purple-300`. Espaçamento só nos valores 4/8/12/16/24/32/48/64, radius por nível de aninhamento (filho sempre menor que o pai), sem gradiente. Cor nunca é o único sinal — sempre acompanhada de texto. Logo: `public/logo-simbolo.png` (símbolo/favicon), `public/logo-negativo.png` (wordmark pra fundo escuro — o "GERENTE" é quase branco, não usar em fundo claro).

## Estrutura de pastas

```
meugerente/
├── apps/
│   ├── web/                   # React + Vite + TS + Tailwind
│   │   └── src/
│   │       ├── components/
│   │       │   ├── ui/         # genéricos, reaproveitáveis por qualquer módulo
│   │       │   ├── shared/     # de domínio, reaproveitados por mais de um módulo
│   │       │   └── layout/     # AppShell, Sidebar, PageHeader
│   │       ├── pages/           # dashboard, produtos, amostras, calendario, roteiros
│   │       ├── lib/
│   │       │   ├── api-client.ts   # fetch fino contra apps/server
│   │       │   ├── ia-client.ts    # chamadas a /api/ia/*
│   │       │   └── repositories/   # *.http.ts, implementam a interface de packages/shared
│   │       ├── hooks/
│   │       └── router.tsx
│   └── server/                 # Express + TS — API de dados + rotas de segredo
│       └── src/
│           ├── db/               # schema.ts (Drizzle), client.ts, migrations/, seed.ts
│           ├── repositories/      # *.pg.ts, implementam a mesma interface de packages/shared
│           ├── routes/            # produtos, amostras, conteudos, roteiros, ia
│           └── ia/                # gemini-client.ts, prompts.ts
├── packages/
│   └── shared/                  # tipos das entidades + interfaces de repositório
├── CLAUDE.md
├── PLANO-IMPLEMENTACAO.md
├── PLANO-IMPLEMENTACAO-FASE2.md
├── PLANO-IMPLEMENTACAO-FASE3.md
├── PRD-MEU-GERENTE.md
└── design-system.md
```

## Convenções

- Componentes em PascalCase, um por arquivo (`StatusPill.tsx`).
- Hooks customizados com prefixo `use` (`useProdutos.ts`).
- Tipos e enums de entidade só existem em `packages/shared`, nunca redefinidos localmente em `apps/web` ou `apps/server`.

## Comandos

Rodar `npm install` uma vez na raiz (workspaces cobrem os três pacotes). Antes do primeiro `dev`, compilar `packages/shared` e configurar os `.env`:

```
npm run build --workspace=packages/shared     # ou --workspace=packages/shared -- -w para watch

# apps/server/.env a partir de apps/server/.env.example (DATABASE_URL, GEMINI_API_KEY)
npm run db:generate --workspace=apps/server   # gera migration a partir do schema
npm run db:migrate --workspace=apps/server    # aplica no Postgres
npm run db:seed --workspace=apps/server -- email@exemplo.com   # opcional, popula catálogo de exemplo nessa conta
npm run user:create --workspace=apps/server -- email@exemplo.com "senha"   # cria (ou troca a senha de) um usuário pelo terminal; o cadastro normal é pela tela /cadastro

npm run dev:web       # Vite em http://localhost:5173
npm run dev:server    # Express em http://localhost:3001
npm run build         # build de shared + web + server, nessa ordem
```

`apps/web` e `apps/server` sobem em processos separados e **os dois precisam estar rodando** desde a Fase 2 — sem `apps/server` no ar, nenhuma tela carrega dado, porque o repositório do front fala com o banco só por HTTP. Sem `GEMINI_API_KEY`, tudo funciona normalmente exceto Roteiros, que mostra erro explícito ao tentar gerar.
