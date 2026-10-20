# Plano de Implementação — Fase 1 (MEU GERENTE)

Baseado em `PRD-MEU-GERENTE.md` e nas regras de `CLAUDE.md`. Cobre só a **Fase 1** do PRD (seção 14): Produtos, Amostras, Calendário, Dashboard básico, camada de repositório e design system aplicado. Roteiros (Gemini) e Análise de Vendas (integração TikTok Shop) ficam explicitamente fora — ver seção "Fora de escopo" abaixo.

## Por que só a Fase 1

O PRD (seção 13, Risco 5) já avisa: seis módulos de uma vez é o jeito de o projeto ficar "80% pronto e nunca sair". A própria mitigação recomendada é cortar em Produtos + Amostras + Calendário, que já formam um fluxo completo e útil sozinho — cadastrar produto, pedir amostra, cobrar prazo, agendar gravação. Esse plano segue essa recomendação.

## Decisão de arquitetura desta fase

O PRD recomendava Next.js porque resolve front e back no mesmo projeto (rota de servidor para a Gemini e para os tokens do TikTok, sem precisar de um segundo processo). O projeto vai usar **React + Vite + Tailwind** em vez disso, então a mesma regra de segurança (segredo nunca no navegador) é resolvida com um backend Node separado, mesmo que essa fase não use nem Gemini nem TikTok API ainda. O backend entra como monorepo desde já — nasce como stub, só com um health check — para que o `apps/web` já nasça acostumado a chamar uma API interna em vez de embutir lógica de servidor no cliente.

## Escopo desta fase

- Monorepo com `apps/web`, `apps/server` (stub) e `packages/shared`.
- Design system aplicado via Tailwind (tokens do `design-system.md`).
- Layout base responsivo mobile-first (sidebar → drawer).
- Camada de repositório (interface + implementação em memória/localStorage).
- Módulo **Produtos**: tabela + grade, filtros, cadastro/edição manual, ação "solicitar amostra".
- Módulo **Amostras**: kanban arrastável + tabela, sinalização de prazo, modal de prazo ao mover para "Recebida".
- Módulo **Calendário**: mês/semana/lista, eventos = conteúdos, arrastar para reagendar.
- **Dashboard** básico: cards de amostras em risco e conteúdos da semana com dado real local; cards de GMV/comissão em estado vazio explícito.

## Fora de escopo desta fase

- **Roteiros (Gemini)** — Fase 2 do PRD. Rotas `/api/ia/*` não são implementadas agora, só previstas na estrutura do `apps/server`.
- **Análise de Vendas / integração TikTok Shop API** — Fase 3 do PRD. Rotas `/api/tiktok/*`, OAuth e sincronizadores não entram agora.
- **Banco real (Postgres/Supabase)** — continua em memória/localStorage, respeitando a interface de repositório para troca futura sem reescrita.
- **Autenticação** — não-objetivo do MVP inteiro (PRD seção 4).

## Estrutura de pastas

```
meugerente/
├── apps/
│   ├── web/                       # React + Vite + TS + Tailwind
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/             # Button, Card, Badge, Table, Modal, Input, Select, Tabs, EmptyState, Spinner, ErrorState
│   │   │   │   └── shared/         # StatusPill, DeadlineTag, ProductThumb...
│   │   │   ├── pages/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── produtos/
│   │   │   │   ├── amostras/
│   │   │   │   └── calendario/
│   │   │   ├── lib/
│   │   │   │   └── repositories/   # implementação em memória/localStorage
│   │   │   ├── hooks/
│   │   │   ├── router.tsx
│   │   │   └── main.tsx
│   │   ├── tailwind.config.ts (ou @theme no CSS, se Tailwind v4)
│   │   └── vite.config.ts
│   └── server/                     # Express + TS — stub, health check só
│       └── src/index.ts
├── packages/
│   └── shared/
│       └── src/
│           ├── types/              # Produto, Amostra, Conteudo + enums do PRD seção 7
│           └── repositories/       # interfaces ProdutoRepository, AmostraRepository, ConteudoRepository
├── CLAUDE.md
├── PLANO-IMPLEMENTACAO.md
├── PRD-MEU-GERENTE.md
└── design-system.md
```

## Passo a passo

1. **Scaffold do monorepo** — `package.json` raiz com `workspaces`; `apps/web` via template `react-ts` do Vite; `apps/server` com Express + TS mínimo; `packages/shared` como pacote TS puro.
2. **Tailwind configurado com os tokens do design system** — mapear `neutral-50..950`, `lime-500/600/900`, `magenta-500/700/100`, a escala de espaçamento (4/8/12/16/24/32/48/64), os radius (`sm 8px` / `md 12px` / `lg 16px` / `xl 24px` / `full`) e a escala tipográfica (Display/H1/H2/H3/Body/Body-strong/Caption/Micro) de `design-system.md`.
3. **Layout base** — `AppShell` com sidebar fixa de 288px (`neutral-50`) que vira drawer abaixo de 1024px; roteamento com `react-router`; componentes `EmptyState`, `Spinner`, `ErrorState` prontos para os 4 estados obrigatórios de qualquer tela.
4. **`packages/shared`** — tipos de `Produto`, `Amostra`, `Conteudo` e seus enums de status (PRD seção 7); interfaces `ProdutoRepository`, `AmostraRepository`, `ConteudoRepository` (métodos: listar, buscar por id, criar, atualizar, mudar status).
5. **Repositórios em memória** (`apps/web/src/lib/repositories`) — implementação inicial em memória/localStorage respeitando as interfaces de `shared`, com dados de exemplo (seed) para testar as telas desde o primeiro momento.
6. **Biblioteca de componentes base** (`components/ui`) — `Button` (variantes primary/secondary/icon), `Card`, `Badge`/`StatusPill`, `Table`, `Tabs`, `Modal`, `Input`, `Select`, `DeadlineTag`. Cada módulo abaixo reaproveita daqui em vez de recriar.
7. **Módulo Produtos** — tabela (imagem, nome, loja, preço, comissão, status, nota de potencial, ações) + grade de cartões; filtros por status/categoria/faixa de comissão; formulário de cadastro/edição manual; ação "Solicitar amostra" que cria registro em Amostras e muda status do produto para `solicitado`.
8. **Módulo Amostras** — quadro kanban arrastável (Solicitada → Aprovada → Enviada → Recebida → Conteúdo publicado) + visão em tabela; sinalização de prazo por cor **e** texto (`neutral-600` folgado, `#B26A00` de 1 a 5 dias, `magenta-700` vencido); modal obrigatório de "prazo de conteúdo" ao mover para "Recebida" (regra do PRD seção 8.3).
9. **Módulo Calendário** — visões mês (padrão)/semana/lista; evento = conteúdo, com cor de borda por status; arrastar para reagendar; painel lateral com detalhe do conteúdo e botão de marcar como publicado.
10. **Dashboard básico** — cards de "amostras aguardando conteúdo" e "conteúdos previstos para a semana" com dado real dos repositórios locais; cards de GMV do mês e comissão confirmada em estado vazio explícito ("aguardando integração com o TikTok Shop — Fase 3"), já no formato de cartão de superfície escura que a Fase 2/3 vai preencher.
11. **Passe de responsividade mobile-first** — revisar cada tela em 375px, 768px, 1024px e 1440px; confirmar que a sidebar vira drawer abaixo de 1024px e que nenhuma tela exige scroll horizontal em 375px.
12. **`apps/server` stub** — health check (`GET /api/status`) e CORS liberado para o `apps/web` em desenvolvimento; nenhuma rota de negócio (IA, TikTok) ainda — só a porta pronta para a Fase 2/3.
13. **Atualizar `CLAUDE.md`** com os comandos finais de dev/build depois do scaffold (ex.: `npm run dev --workspace=apps/web`, `npm run dev --workspace=apps/server`).

## Critério de conclusão

Citando o PRD (seção 14, Fase 1): **"Você consegue rodar uma semana real de trabalho só no sistema."**

## Verificação

- `npm run dev` sobe `apps/web` (Vite) e `apps/server` (Express) em paralelo, sem erro no console.
- Fluxo ponta-a-ponta manual: cadastrar produto → solicitar amostra → mover no kanban até "Recebida" → definir prazo → amostra aparece em "risco" no Dashboard quando o prazo vencer → criar conteúdo vinculado → conteúdo aparece no calendário → marcar como publicado.
- Testar os quatro estados (vazio/carregando/erro/com dados) em pelo menos uma lista de cada módulo.
- Testar em viewport mobile (375px) e desktop (1440px) sem quebra de layout.
- Rodar `tsc --noEmit` (e lint, se configurado) sem erro antes de considerar um passo concluído.
