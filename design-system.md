# Design System Overview

> Sistema extraído de 5 telas de um produto de gestão financeira pessoal (Home, Planejamento, Fluxo de Caixa, Endividamento, Metas).
> Cores obtidas por leitura de pixel das imagens. São aproximações fiéis, mas podem variar alguns pontos do arquivo original.

## 1. Conceito e estilo

Interface de dados densa que se comporta como um painel neutro: quase tudo é cinza e preto, e a cor só aparece quando existe um número que exige reação do usuário. A lógica central é **contraste por escassez**. O fundo é cinza médio, os cartões são quase brancos e flutuam sobre ele sem sombra, apenas pela diferença de tom. Isso cria separação visual sem ruído e permite empilhar muitos blocos de informação na mesma tela sem cansar. O verde limão funciona como marca e como sinal de "positivo", nunca como decoração de fundo; o magenta carrega o peso emocional do dinheiro que sai. Superfícies pretas são reservadas para o dado mais importante de cada tela (saldo do mês, saldo disponível), funcionando como ponto de parada visual. O resultado é um produto sério em estrutura e leve em temperatura, o oposto de um banco tradicional.

**Palavras-chave:** neutro-dominante, alto contraste pontual, cartão flutuante sem sombra, denso mas respirado, sinalização por cor, soft-fintech

---

## 2. Sistema de cores

### Cores primitivas

#### Escala neutra

| Token | HEX | Uso |
|---|---|---|
| `neutral-50` | `#FFFFFF` | Sidebar, cartões internos de destaque, superfície de nível 2 |
| `neutral-75` | `#FAFAFA` | Superfície padrão de cartão (a mais usada de todo o sistema) |
| `neutral-100` | `#F3F3F3` | Cartão dentro de cartão, faixa de tabela alternada |
| `neutral-150` | `#F0F1F1` | Botão secundário, campo de input, chip inativo |
| `neutral-200` | `#ECECED` | Trilho de barra de progresso vazia, divisória suave |
| `neutral-300` | `#E2E3E4` | Fundo da aplicação (a "mesa" onde os cartões pousam) |
| `neutral-400` | `#C9CBCD` | Bordas de baixo destaque, estados desabilitados |
| `neutral-500` | `#9BA0A5` | Ícones inativos, placeholder |
| `neutral-600` | `#7E858B` | Texto secundário, rótulo de card, subtítulo |
| `neutral-700` | `#575C61` | Texto de apoio que precisa ser lido de fato |
| `neutral-800` | `#34393D` | Estado hover de superfície escura |
| `neutral-900` | `#222528` | Texto primário, superfície escura de destaque, sidebar ativa |
| `neutral-950` | `#101010` | Player de vídeo, áreas de mídia, fundo mais profundo |

#### Cores base

| Token | HEX | Uso |
|---|---|---|
| `lime-500` | `#9AE600` | Cor de marca. Marca-texto em título, barra preenchida, destaque único por bloco |
| `lime-600` | `#A6C035` | Versão de dado: barras de gráfico e séries em superfície clara |
| `lime-900` | `#497D00` | Verde de texto, para valores positivos em fundo claro |
| `magenta-500` | `#E91E92` | Legenda e marcadores de série negativa |
| `magenta-700` | `#C6005C` | Magenta de texto, para valores de saída e alerta |
| `magenta-100` | `#FBC4DC` | Preenchimento de gráfico de rosca e áreas grandes de cor negativa |
| `ink` | `#222528` | Tinta única do sistema, também usada como superfície |

> Roxo `#820AD1` e laranja `#EC7000` aparecem nas telas, mas são **cores de terceiros** (bandeiras de cartão). Ficam fora da paleta: entram só como dado do usuário, nunca como cor de interface.

### Cores semânticas

| Papel | Token | Quando usar |
|---|---|---|
| **Primary** | `neutral-900` `#222528` | Ação principal, texto primário e superfície de destaque. É a cor que carrega peso. Botão primário é preto, não colorido, porque a cor de marca já está ocupada sinalizando valor positivo |
| **Secondary** | `neutral-150` `#F0F1F1` | Ações repetidas e de baixo risco (adicionar ganho, adicionar despesa, filtros). Cinza para que dez botões iguais na tela não briguem entre si |
| **Accent** | `lime-500` `#9AE600` | Identidade da marca e reforço de um único elemento por bloco. Regra rígida: no máximo um uso de acento por cartão |
| **Success / Positivo** | `lime-900` `#497D00` (texto), `lime-600` `#A6C035` (gráfico) | Entradas, saldo positivo, meta atingida. Nunca use `lime-500` como texto: ele não tem contraste suficiente |
| **Warning** | `#B26A00` | Vencimento próximo, limite de cartão acima de 80%, meta atrasada. Tom âmbar escuro, derivado do mesmo nível de luminância do verde de texto |
| **Error / Negativo** | `magenta-700` `#C6005C` | Saídas, saldo negativo, dívida em atraso. O sistema evita vermelho puro para que "gastar" não pareça "erro do sistema" |
| **Info** | `neutral-600` `#7E858B` | Texto explicativo, tooltips, ícones de ajuda. Informação neutra não ganha cor |

**Proporção de uso:** 80% neutro, 12% preto de tinta e superfície, 8% cor de sinal (verde + magenta somados). O acento limão sozinho não passa de 2% da área da tela.

---

## 3. Tipografia

**Categoria:** grotesk geométrica de x-height alto, com terminações retas e números levemente condensados. Não é identificável com certeza pelas imagens. Alternativas compatíveis: **Satoshi** ou **General Sans**. Para uso livre e sem risco de licença, **Inter** com `font-feature-settings: "cv05", "ss01"` chega perto.

**Distribuição de pesos:** o sistema usa só três pesos (400, 500, 700). Hierarquia é feita por **tamanho e cor**, não por peso. Nada de 600 e 800 no meio, porque em tela de dados a variação fina de peso vira ruído.

**Números:** sempre em `font-variant-numeric: tabular-nums`. Valores em coluna precisam alinhar na vírgula ou a tabela perde a leitura de varredura.

| Nível | Tamanho | Peso | Line-height | Letter-spacing |
|---|---|---|---|---|
| **Display** (valor principal, saldo do mês) | 32px | 700 | 1.15 | -0.02em |
| **H1** (título de página) | 28px | 700 | 1.2 | -0.02em |
| **H2** (título de cartão) | 18px | 700 | 1.3 | -0.01em |
| **H3** (subtítulo interno, nome de categoria) | 15px | 500 | 1.4 | 0 |
| **Body** | 14px | 400 | 1.5 | 0 |
| **Body-strong** (valor dentro de tabela) | 14px | 500 | 1.5 | 0 |
| **Caption** (rótulo de card, eixo de gráfico, legenda) | 12px | 400 | 1.35 | 0.01em |
| **Micro** (final do cartão, bandeira, metadado) | 11px | 400 | 1.3 | 0.02em |

**Regra de par:** todo bloco de número segue o padrão `Caption em neutral-600` acima + `Display ou Body-strong em neutral-900` abaixo. O rótulo nunca compete com o valor.

**Título com destaque:** palavras podem receber fundo `lime-500` com texto `neutral-900`, padding de 2px 8px e radius 6px. É o único momento em que a tipografia carrega cor de fundo. Máximo de duas palavras por título.

---

## 4. Espaçamento e layout

### Escala

Base 4px, progressão por dobra parcial. Só estes valores existem:

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`

Nada de 10, 18 ou 30. A restrição é o que faz a tela ficar previsível quando 15 blocos diferentes convivem.

### Papel de cada valor

| Valor | Onde se aplica |
|---|---|
| 4px | Rótulo para valor, ícone para texto |
| 8px | Entre itens de uma lista compacta, dentro de chip |
| 12px | Padding interno de botão e input |
| 16px | Padding de cartão pequeno, gap entre cartões de métrica |
| 24px | Padding de cartão padrão, gap entre blocos de conteúdo |
| 32px | Gap entre seções da página |
| 48px | Margem superior da área de conteúdo |
| 64px | Respiro de topo de página em telas largas |

### Grid

- **Shell:** sidebar fixa de 288px + área de conteúdo fluida.
- **Conteúdo:** grid de 12 colunas, gap de 24px, margem lateral de 32px.
- **Faixa de métricas:** 4 colunas iguais (3 quando há menos dados). Cada cartão é uma métrica, nunca duas.
- **Bloco principal:** divisão 2 terços (gráfico ou tabela) + 1 terço (resumo e ações). Essa proporção se repete nas cinco telas e é a espinha do layout.

### Densidade

Densidade média com respiro interno alto. A tela pode ter muitos cartões, mas **dentro** de cada cartão o conteúdo respira 24px. O ritmo é: fora comprimido, dentro folgado. É isso que impede um painel financeiro de parecer planilha.

---

## 5. Formas e linguagem de UI

### Border radius

| Token | Valor | Aplicação |
|---|---|---|
| `radius-sm` | 8px | Chip, tag, marca-texto, campo pequeno |
| `radius-md` | 12px | Botão, input, item de lista |
| `radius-lg` | 16px | Cartão de métrica, cartão interno |
| `radius-xl` | 24px | Cartão de conteúdo principal, painel |
| `radius-full` | 999px | Avatar, ícone circular, ponto de legenda, barra de progresso |

**Regra de aninhamento:** o filho tem sempre radius menor que o pai, com diferença mínima de 8px. Cartão 24px contém cartão 16px que contém botão 12px. Quebrar isso faz o canto interno "estourar" visualmente o externo.

### Estilo de componente

**Flat em camadas, sem elevação.** Não existe sombra nesse sistema. A profundidade vem exclusivamente da escala neutra: fundo `#E2E3E4` → cartão `#FAFAFA` → cartão interno `#F3F3F3` ou `#FFFFFF`. Três níveis, nunca mais.

### Traço

Bordas são a exceção, não a regra. Só aparecem em:
- Divisórias horizontais de tabela: 1px `neutral-200`
- Linhas tracejadas de eixo de gráfico: 1px dashed `neutral-300`
- Estado de foco: 2px `neutral-900` com offset de 2px

Cartão não tem borda. Se tiver borda **e** mudança de fundo, a separação fica dupla e suja.

### Botões

| Variante | Fundo | Texto | Uso |
|---|---|---|---|
| Primary | `neutral-900` | `#FFFFFF` | Uma por tela (adicionar meta, adicionar registro) |
| Secondary | `neutral-150` | `neutral-900` | Ações repetidas em grade |
| Tabs / Toggle | ativo `neutral-900` + branco; inativo transparente + `neutral-600` | Filtros de período e de visão |
| Icon | circular `neutral-150`, ícone `neutral-900` | Ações auxiliares dentro de cartão |

Altura padrão 40px, padding horizontal 16px, ícone de 16px com 8px de gap.

---

## 6. Detalhes visuais

| Detalhe | Existe? | Papel |
|---|---|---|
| **Sombra** | Não | Profundidade é feita por tom. Se um elemento precisa de sombra para se destacar, ele está no nível errado da escala neutra |
| **Gradiente** | Não na interface | Existe um toggle chamado "Gradiente", o que indica gradiente como **tema opcional do usuário**, não como parte do sistema base. O padrão é chapado |
| **Blur / glassmorphism** | Não | Nada de vidro fosco. Conflita com a lógica de camadas por tom |
| **Ruído / textura** | Não | Superfícies são lisas |
| **Glow** | Não | Nem no verde limão, que já é saturado o bastante |
| **Borda** | Restrita | Só divisória de tabela, eixo de gráfico e foco |
| **Ilustração** | Sim, contida | Mockups e imagens de banner ficam presos ao cartão promocional. Nunca invadem a área de dados |
| **Emoji** | Sim, funcional | Usado como ícone de categoria e como termômetro de estado (saldo negativo, streak). É rápido de escanear e barato de manter. Regra: emoji só em contexto de categoria ou humor, nunca em navegação ou ação |
| **Barra de progresso** | Sim | Trilho `neutral-200`, preenchimento `lime-500` (positivo) ou `magenta-100` (consumo). Altura 6px, radius full |

### Gráficos

- **Barra:** `lime-600` sólido, cantos levemente arredondados (4px no topo), gap de 40% da largura da barra.
- **Área e linha:** linha `neutral-900` de 2px, preenchimento cinza a 8% de opacidade. Dado financeiro acumulado é informação estrutural, não sinal, por isso vem em neutro.
- **Rosca:** stroke largo (fatia de 32px), sem rótulo dentro, número central em Display. Cores de série saem de uma paleta pastel derivada (verde, rosa, lilás, azul, pêssego), todas com luminância parecida para que nenhuma categoria pareça mais importante que a outra.
- **Eixos:** rótulos em Caption `neutral-600`, linhas de grade tracejadas `neutral-300`. Sem eixo vertical sólido.

---

## 7. Contraste e acessibilidade

O sistema é **de alto contraste no texto e baixo contraste na estrutura**. Texto quase sempre em `neutral-900` sobre superfícies claras; separação de blocos em diferenças de 3 a 8 pontos de cinza. Isso é acertado: separar caixa é trabalho de forma, não de contraste.

### Pares verificados

| Par | Contraste | Veredito |
|---|---|---|
| `neutral-900` sobre `neutral-75` | 14.8:1 | Passa AAA |
| `neutral-900` sobre `neutral-300` | 12.0:1 | Passa AAA |
| `#FFFFFF` sobre `neutral-900` | 15.4:1 | Passa AAA |
| `lime-500` sobre `neutral-900` | 10.0:1 | Passa AAA (é assim que o marca-texto deve ser usado) |
| `neutral-700` sobre `neutral-75` | 6.5:1 | Passa AA |
| `magenta-700` sobre `neutral-75` | 5.7:1 | Passa AA |
| `lime-900` sobre `neutral-75` | 4.8:1 | Passa AA, com pouca folga |

### Reprovações e correções

| Par | Contraste | Problema | Ajuste |
|---|---|---|---|
| `neutral-600` `#7E858B` sobre `neutral-75` | **3.6:1** | Reprova para texto normal. É o rótulo de cartão, ou seja, um dos textos mais frequentes do produto | Escurecer o token de texto secundário para **`#6B7076`** (4.8:1). Mantém o mesmo papel visual e passa AA |
| `magenta-500` `#E91E92` sobre `neutral-75` | **4.0:1** | Reprova para texto normal, passa para ícone e legenda (3:1) | Restringir a marcadores e legendas. Para texto, usar sempre `magenta-700` |
| `lime-600` `#A6C035` sobre `neutral-75` | **2.0:1** | Reprova até para elemento gráfico isolado | Aceitável só como barra grande de gráfico com rótulo textual ao lado. Nunca como texto, ícone pequeno ou linha fina |
| `lime-500` `#9AE600` sobre `neutral-75` | **1.5:1** | Invisível em fundo claro | Só existe sobre `neutral-900`, ou como fundo com texto escuro em cima |
| `neutral-500` `#9BA0A5` sobre `neutral-75` | **2.5:1** | Reprova para ícone ativo | Válido apenas para estado desabilitado, onde a diretriz de contraste não se aplica |

### Regras de acessibilidade do sistema

1. **Cor nunca é o único sinal.** Entrada e saída são diferenciadas por cor **e** por sinal (`+` / `-`) **e** por posição na coluna.
2. **Nada de texto sobre imagem** sem uma camada sólida por baixo. O banner promocional já respeita isso.
3. **Área de toque mínima de 44px**, mesmo quando o botão desenhado tem 40px de altura. Compense com padding invisível.
4. **Foco sempre visível:** anel de 2px `neutral-900` com offset de 2px. Em superfície escura, anel `lime-500`.
5. **Emoji sempre com `aria-label`** ou texto ao lado. Um emoji de rosto sorridente ao lado de um saldo negativo é ambíguo até para quem enxerga.

---

O que foi descartado: roxo do Nubank e laranja do Itaú, porque são marcas de terceiros e não podem virar cor do sistema; também descartei o tema "Gradiente" do toggle, já que o padrão chapado é o que sustenta a lógica de camadas por tom.

Decisão que merece sua validação: o botão primário é preto e não verde limão. Se você quiser marca mais presente, a alternativa é limão com texto `neutral-900`, mas aí perde-se a exclusividade do acento e o verde deixa de significar "positivo".

Próximo passo prático: gerar as variáveis (CSS custom properties ou Figma Variables) a partir da tabela da seção 2 e aplicar em uma tela só, de preferência a de Fluxo de Caixa, que é a mais densa e vai expor qualquer regra frouxa.
