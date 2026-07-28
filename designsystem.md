# Design System — Fundação Visual

> **Escopo deste arquivo:** apenas a camada estética/fundacional (cores, tipografia, formas, espaçamento, elevação) extraída das referências visuais. Funcionalidades, fluxos e componentes específicos do sistema de organização de conteúdo do TikTok Shop **não** fazem parte deste documento.
>
> Um segundo arquivo (`designsystem-content.md` ou similar) será criado futuramente com tokens e componentes voltados especificamente para os temas de criação de posts.

---

## 1. Direção Estética

Estética **"Apple-like"**: confiante, editorial, com muito espaço em branco/preto, tipografia grande e bem hierarquizada, formas arredondadas generosas (cápsulas/pills) e pontos de cor vibrante contra fundos neutros quase monocromáticos.

### Princípios observados nas referências

1. **Canvas escuro como padrão, luz como variante funcional.** As telas de produto (tabela comparativa, mockup "Agenda") usam fundo quase preto (`#1E1D1D`/`#000000`) como base. A interface clara aparece em contextos de especificação de componente (pills, segmented control, calendário), sugerindo que o dark mode é a experiência primária e o light mode é suportado igualmente bem.
2. **Tipografia como hierarquia principal.** SF Pro em múltiplos pesos (Regular → Bold) numa escala compacta e previsível (11–34pt). Números grandes e em negrito carregam o significado (ratings "X/10", percentuais, datas).
3. **Formas em cápsula (pill) e círculo dominam.** Badges, botões, chips de data e avatares são quase sempre `border-radius: full` ou circulares — nunca cantos retos, raramente retângulos com raio pequeno.
4. **Cor como sinal, não como decoração.** A paleta neutra (preto/branco/cinza) domina 90% da UI; cor vibrante (roxo, ciano, verde, dourado, coral, laranja) é reservada para estados (seleção, rating, prioridade, sucesso).
5. **Traço tracejado (dashed) como anotação de especificação**, não como estilo de borda de produto — usado para "circular" e explicar componentes numa peça de case study/apresentação.
6. **Progress rings e avatares circulares** para dados quantitativos (68%, 42%) — reforça o vocabulário circular do sistema.
7. **Cantos de blocos de cor grandes e chapados** (color palette cards) sem gradientes, sem textura — cor sólida, flat, confiante.
8. **Elementos decorativos minimalistas** (sparkles, burst/estrela) usados com moderação, só em contexto de apresentação — não fazem parte do vocabulário de UI funcional.

---

## 2. Tokens Primitivos

Tokens primitivos são os valores brutos — nunca usados diretamente em componentes, apenas referenciados pelos tokens semânticos (seção 3).

### 2.1 Cor — Paleta de acento (extraída literalmente da referência)

| Token primitivo | Hex | Nome de uso |
|---|---|---|
| `color.purple.500` | `#7C55EE` | Violeta (acento primário/marca) |
| `color.cyan.400` | `#22D3EE` | Ciano (acento secundário, seleção dark mode) |
| `color.gold.400` | `#FFD726` | Dourado/Amarelo (destaque, alerta neutro) |
| `color.rose.500` | `#F43F5E` | Rosa/Vermelho (crítico, prioridade alta) |
| `color.orange.500` | `#E96E2B` | Laranja (aviso, prioridade média) |
| `color.ink.900` | `#1E1D1D` | Preto-tinta (base do dark canvas) |

Tons complementares gerados a partir do hue de cada acento (para hover, disabled, backgrounds tintados):

| Token | Hex | Uso |
|---|---|---|
| `color.purple.100` | `#EAE2FD` | fundo tintado sobre superfícies claras |
| `color.purple.300` | `#B29CF6` | ícones/texto de suporte sobre dark |
| `color.purple.700` | `#5B3AC2` | hover/pressed |
| `color.cyan.100` | `#D3F7FC` | fundo tintado |
| `color.cyan.300` | `#7EE6F5` | texto/ícone sobre dark |
| `color.cyan.700` | `#0E93AC` | hover/pressed |
| `color.rose.100` | `#FDE1E6` | fundo tintado |
| `color.rose.700` | `#C22643` | hover/pressed |
| `color.gold.100` | `#FFF4CC` | fundo tintado |
| `color.gold.700` | `#C79800` | hover/pressed |
| `color.orange.100` | `#FCE4D3` | fundo tintado |
| `color.orange.700` | `#B4530F` | hover/pressed |

**Verde de sistema** (observado em uso — chip de data selecionada e rating positivo — mas fora da paleta oficial de 6 cores; inferido para completar os estados de sucesso):

| Token | Hex | Uso |
|---|---|---|
| `color.green.400` | `#8BC53F` | sucesso, rating positivo, seleção (light mode) |
| `color.green.100` | `#E6F4D2` | fundo tintado |
| `color.green.700` | `#5C8A22` | hover/pressed |

### 2.2 Cor — Escala neutra

Gerada a partir da âncora `#1E1D1D` (ink.900) até branco puro, para suportar dark canvas e light surfaces com a mesma consistência.

| Token | Hex | Descrição |
|---|---|---|
| `color.neutral.0` | `#FFFFFF` | Branco puro |
| `color.neutral.50` | `#F7F7F7` | Superfície clara (fundo light mode) |
| `color.neutral.100` | `#EDEDED` | Superfície clara elevada |
| `color.neutral.200` | `#DCDCDC` | Divisores em light mode |
| `color.neutral.300` | `#B8B8B8` | Texto terciário em light mode |
| `color.neutral.400` | `#8F8F8F` | Texto secundário / ícones inativos |
| `color.neutral.500` | `#6B6B6B` | Texto secundário sobre dark |
| `color.neutral.600` | `#4A4A4A` | Divisores em dark mode |
| `color.neutral.700` | `#333333` | Superfície dark elevada (cards sobre preto) |
| `color.neutral.800` | `#262626` | Superfície dark base alternativa |
| `color.neutral.900` | `#1E1D1D` | **Ink** — fundo dark canvas (âncora da paleta) |
| `color.neutral.950` | `#000000` | Preto absoluto (fundo de tabela/hero) |

### 2.3 Tipografia

**Família:** `SF Pro` (fallback: `-apple-system, "Segoe UI", Roboto, sans-serif` para ambientes não-Apple/web).

| Token | Peso |
|---|---|
| `font.weight.regular` | 400 |
| `font.weight.medium` | 500 |
| `font.weight.semibold` | 600 |
| `font.weight.bold` | 700 |

**Escala de tamanho** (idêntica à escala observada na referência — corresponde à escala tipográfica do Apple HIG):

| Token | Tamanho | Equivalente HIG |
|---|---|---|
| `font.size.xs` | 11px | Caption 2 |
| `font.size.sm` | 15px | Subheadline |
| `font.size.md` | 17px | Body / Callout |
| `font.size.lg` | 20px | Title 3 |
| `font.size.xl` | 22px | Title 2 |
| `font.size.2xl` | 28px | Title 1 |
| `font.size.3xl` | 34px | Large Title |

| Token | Line-height | Uso |
|---|---|---|
| `font.lineheight.tight` | 1.1 | títulos grandes (2xl, 3xl) |
| `font.lineheight.snug` | 1.25 | títulos médios (lg, xl) |
| `font.lineheight.normal` | 1.4 | corpo de texto (md, sm) |
| `font.lineheight.relaxed` | 1.5 | texto longo/legenda |

| Token | Letter-spacing | Uso |
|---|---|---|
| `font.tracking.tight` | -0.02em | títulos grandes |
| `font.tracking.normal` | 0em | corpo |
| `font.tracking.wide` | 0.04em | labels em caixa alta (ex: dias da semana) |

### 2.4 Espaçamento (grid de 4pt, base Apple/iOS)

| Token | Valor |
|---|---|
| `space.0` | 0px |
| `space.1` | 4px |
| `space.2` | 8px |
| `space.3` | 12px |
| `space.4` | 16px |
| `space.5` | 20px |
| `space.6` | 24px |
| `space.8` | 32px |
| `space.10` | 40px |
| `space.12` | 48px |
| `space.16` | 64px |

### 2.5 Raio de borda (radius)

| Token | Valor | Referência visual |
|---|---|---|
| `radius.xs` | 6px | chip pequeno, badge de tag |
| `radius.sm` | 10px | input, botão retangular pequeno |
| `radius.md` | 14px | chip de data (estado "MAR 13") |
| `radius.lg` | 20px | card padrão |
| `radius.xl` | 28px | card grande (painéis de tipografia/paleta) |
| `radius.full` | 999px | pills, botões cápsula, avatar |
| `radius.circle` | 50% | avatar, progress ring, dot de seleção |

### 2.6 Traço / borda (stroke)

| Token | Valor | Uso |
|---|---|---|
| `stroke.hairline` | 0.5px solid | divisores de linha em tabelas dark |
| `stroke.thin` | 1px solid | bordas de card em light mode |
| `stroke.dashed` | 1px dashed | contornos de anotação/especificação (não usar em UI final de produto) |
| `stroke.focus` | 2px solid | anel de foco em elementos interativos |

### 2.7 Elevação (shadow)

| Token | Valor | Uso |
|---|---|---|
| `elevation.0` | `none` | superfícies dark (cor já cria contraste) |
| `elevation.1` | `0 2px 8px rgba(0,0,0,0.06)` | card leve em light mode |
| `elevation.2` | `0 8px 24px rgba(0,0,0,0.10)` | card elevado, popover |
| `elevation.3` | `0 16px 40px rgba(0,0,0,0.16)` | modal, overlay |

### 2.8 Opacidade

| Token | Valor | Uso |
|---|---|---|
| `opacity.disabled` | 0.4 | elementos desabilitados |
| `opacity.muted` | 0.6 | texto/ícone secundário sobre imagem |
| `opacity.overlay` | 0.7 | scrim sobre conteúdo (modal backdrop) |

---

## 3. Tokens Semânticos

Tokens semânticos mapeiam os primitivos para **intenção de uso**. Todo componente deve consumir apenas tokens semânticos.

### 3.1 Cor — Dark mode (tema padrão)

| Token semântico | Referencia primitivo | Uso |
|---|---|---|
| `bg.canvas` | `color.neutral.950` / `color.neutral.900` | fundo geral da aplicação |
| `bg.surface` | `color.neutral.800` | cards, painéis |
| `bg.surface-raised` | `color.neutral.700` | cards sobre cards, popovers |
| `bg.surface-inverse` | `color.neutral.0` | superfícies claras dentro do dark mode |
| `text.primary` | `color.neutral.0` | títulos, texto principal |
| `text.secondary` | `color.neutral.400` | subtítulos, metadados |
| `text.tertiary` | `color.neutral.600` | placeholders, texto desabilitado |
| `text.inverse` | `color.neutral.900` | texto sobre fundos claros/coloridos |
| `border.default` | `color.neutral.700` | divisores padrão |
| `border.subtle` | `color.neutral.800` | divisores discretos (linhas de tabela) |
| `accent.primary` | `color.purple.500` | marca, CTA principal, seleção de destaque |
| `accent.secondary` | `color.cyan.400` | seleção ativa (ex: data selecionada em calendário dark) |
| `accent.success` | `color.green.400` | rating positivo, confirmação |
| `accent.warning` | `color.gold.400` / `color.orange.500` | prioridade média, alerta |
| `accent.critical` | `color.rose.500` | prioridade alta, erro |

### 3.2 Cor — Light mode

| Token semântico | Referencia primitivo | Uso |
|---|---|---|
| `bg.canvas` | `color.neutral.50` | fundo geral |
| `bg.surface` | `color.neutral.0` | cards, painéis |
| `bg.surface-raised` | `color.neutral.0` + `elevation.1` | cards elevados |
| `text.primary` | `color.neutral.900` | texto principal |
| `text.secondary` | `color.neutral.500` | metadados |
| `text.tertiary` | `color.neutral.300` | desabilitado |
| `border.default` | `color.neutral.200` | divisores |
| `accent.primary` | `color.purple.500` | marca, CTA |
| `accent.secondary` | `color.green.400` | seleção ativa (ex: data selecionada em calendário light) |
| `accent.critical` | `color.rose.500` | ação destrutiva/prioridade alta (ex: pills "Personalizar") |

> **Nota de padrão observado:** o acento de "seleção ativa" muda contextualmente entre ciano (dark mode, calendário "Agenda") e verde (light mode, chip "MAR 13"). Ambos são válidos; a escolha entre `accent.secondary` ciano ou verde deve ser consistente por tema, não misturada dentro do mesmo modo.

### 3.3 Tipografia semântica

| Token | Composição | Uso |
|---|---|---|
| `type.display` | `3xl` / `bold` / `tracking.tight` / `lineheight.tight` | título de tela (ex: "Agenda") |
| `type.title` | `2xl` / `semibold` / `lineheight.tight` | título de seção |
| `type.heading` | `xl` / `semibold` / `lineheight.snug` | cabeçalho de card |
| `type.subheading` | `lg` / `medium` / `lineheight.snug` | subtítulo, data ("Miércoles, 15 de Abril") |
| `type.body` | `md` / `regular` / `lineheight.normal` | texto corrido |
| `type.label` | `sm` / `medium` / `lineheight.normal` | labels de campo, botão |
| `type.caption` | `xs` / `regular` / `lineheight.relaxed` | metadados, legenda |
| `type.data-lg` | `xl` / `bold` / `tracking.tight` | números grandes (ratings, percentuais) |
| `type.data-sm` | `sm` / `bold` | ratings inline ("9/10") |
| `type.eyebrow` | `xs` / `semibold` / `tracking.wide` / uppercase | labels de dia da semana, tags de categoria |

### 3.4 Raio semântico

| Token | Referencia primitivo | Componente |
|---|---|---|
| `radius.button` | `radius.full` | botões e pills |
| `radius.chip` | `radius.md` | chips de data, tags |
| `radius.card` | `radius.lg` | cards padrão |
| `radius.card-feature` | `radius.xl` | cards de destaque/hero |
| `radius.input` | `radius.sm` | campos de formulário |
| `radius.avatar` | `radius.circle` | avatares, progress rings |

### 3.5 Elevação semântica

| Token | Uso |
|---|---|
| `surface.flat` | `elevation.0` — usado em dark mode por padrão |
| `surface.raised` | `elevation.1` — cards em light mode |
| `surface.overlay` | `elevation.2` — dropdowns, popovers |
| `surface.modal` | `elevation.3` — modais |

---

## 4. Padrões de Componente Observados

Referência rápida de como os tokens acima se combinam nos exemplos visuais (documentação, não implementação):

- **Pill badge de destaque** (headers "Typography"/"Color Palett"): `bg = accent.success (verde-lima)`, `text = text.inverse`, `radius = radius.button`, `type = type.label bold`.
- **Chip de data — estado padrão**: `bg = bg.surface-inverse`, `text = text.inverse`, `radius = radius.chip`.
- **Chip de data — estado selecionado**: `bg = accent.secondary`, `text = text.inverse`, `radius = radius.chip`.
- **Célula de rating em tabela**: fundo `bg.canvas` (preto), número em `type.data-sm`, cor variável conforme faixa de valor (`accent.success` alto, `accent.warning` médio, `accent.critical` baixo).
- **Coluna de critério (label)**: `bg = accent.primary (roxo)`, `text = text.inverse`, alinhado à esquerda, sem radius nas bordas internas da tabela.
- **Progress ring**: traço `accent.primary` ou `accent.secondary`, espessura ~4–6px, texto central em `type.data-lg`.
- **Avatar circular**: `bg = accent.primary tint (color.purple.100/300)`, iniciais em `type.label semibold`, `radius = radius.avatar`.
- **Botão de ação secundária ("Personalizar")**: `bg = accent.critical`, `text = text.inverse`, `radius = radius.button`, padding horizontal generoso (`space.5`+).
- **Segmented control (Alta/Media/Baja)**: `bg = bg.surface-inverse`, item ativo com `bg.surface` + `elevation.1`, `radius = radius.button` no container e no item ativo.
- **Container de anotação/spec**: `border = stroke.dashed`, sem preenchimento — reservado para documentação, não para produto final.

---

## 5. Modo de uso

- Tokens primitivos (seção 2) nunca são referenciados diretamente por componentes de UI — apenas por tokens semânticos.
- Tokens semânticos (seção 3) são a interface pública consumida por componentes.
- Dark mode é o tema de referência primário; light mode é um tema irmão com paridade total, não um fallback.
- Cor vibrante é reservada para *sinal* (seleção, status, prioridade, marca) — nunca para preenchimento decorativo de grandes áreas fora dos cards de paleta/apresentação.
- Formas: preferir cápsula/círculo sobre retângulo de raio pequeno sempre que o componente for interativo (botão, chip, avatar). Retângulos com raio maior (`radius.lg`/`xl`) ficam reservados para containers/cards.

---

## 6. Próximos passos

Este documento cobre exclusivamente a fundação estética. Pendente para etapas futuras:

- `designsystem-content.md` — tokens e componentes específicos para os temas de criação/organização de posts do TikTok Shop.
- Definição de breakpoints e comportamento responsivo (mobile-first, já que o sistema precisa funcionar completamente no mobile).
- Especificação de componentes funcionais (cards de conteúdo, kanban/lista de organização, filtros, etc.) uma vez que as funcionalidades forem definidas.
