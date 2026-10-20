# PRD, MEU GERENTE

**Produto:** MEU GERENTE
**Versão do documento:** 1.1
**Data:** 16/09/2026
**Responsável:** Yuzo
**Status:** Rascunho para validação

---

## 1. Resumo

MEU GERENTE é um painel de trabalho para afiliados de TikTok Shop. Ele reúne em um só lugar o que hoje vive espalhado em planilha, bloco de notas, print de WhatsApp e memória: quais produtos estão no radar, quais amostras foram pedidas e onde estão, o que precisa ser gravado essa semana, qual roteiro usar e o que de fato está vendendo.

A diferença para uma planilha é que o sistema **conecta esses blocos**. O produto sabe qual amostra gerou, a amostra sabe qual conteúdo cobra, o conteúdo sabe quanto vendeu. E a IA (Gemini) lê esse conjunto para escrever roteiro e apontar o que está funcionando.

---

## 2. Problema

O afiliado de TikTok Shop opera com volume alto e memória curta:

| Dor | Consequência hoje |
|---|---|
| Pede amostra e esquece de gravar | Queima relação com o vendedor e perde acesso a amostra futura |
| Não sabe qual produto rende mais por hora de trabalho | Continua gravando o produto errado |
| Roteiro é feito do zero toda vez | Gasta a energia criativa na estrutura, não no gancho |
| Dados de venda ficam presos no painel do TikTok | Só olha o total, nunca o padrão |
| Calendário mora na cabeça | Publica em rajada e some por três dias |

**Hipótese central:** o gargalo do afiliado não é criatividade, é operação. Quem organiza o fluxo grava mais, atrasa menos e escolhe melhor.

---

## 3. Usuário

**Perfil primário:** afiliado de TikTok Shop no Brasil, trabalhando sozinho ou com um editor, entre 10 e 100 produtos ativos, gravando de 3 a 15 vídeos por semana.

**Perfil secundário (fase 2):** consultor ou agência que acompanha vários afiliados.

**Não é para:** seller (dono da loja). O sistema olha pelo lado de quem divulga, não de quem vende o estoque.

---

## 4. Objetivos e não-objetivos

### Objetivos do MVP

1. Centralizar produtos, amostras e conteúdo em um fluxo único e rastreável.
2. Nunca deixar uma amostra recebida sem conteúdo produzido.
3. Reduzir o tempo de criação de roteiro para menos de 2 minutos.
4. Mostrar em uma tela qual produto compensa continuar gravando.

### Não-objetivos (ficam de fora do MVP, explicitamente)

- Autenticação e múltiplos usuários.
- Edição ou upload de vídeo.
- Publicação automática no TikTok.
- Controle financeiro completo (imposto, nota, retirada).
- App mobile nativo.

---

## 5. Escopo do MVP

Seis módulos, todos acessíveis pelo menu fixo:

| # | Módulo | Entrega |
|---|---|---|
| 1 | Dashboard | Visão do dia: pendências, amostras em risco, próximas gravações, números do período |
| 2 | Produtos | Cadastro, status no funil de trabalho, comissão, avaliação de potencial |
| 3 | Amostras | Ciclo de vida da amostra, do pedido ao conteúdo entregue, com prazo |
| 4 | Calendário | Grade de conteúdo por data e status de produção |
| 5 | Roteiros | Geração e edição de roteiro por produto, público e formato, via Gemini |
| 6 | Análise de vendas | Sincronização com a API oficial do TikTok Shop, ranking de produtos, diagnóstico escrito pela Gemini |

A base de produtos e de vendas é alimentada pela **API oficial do TikTok Shop**, com importação manual de arquivo mantida apenas como plano B.

---

## 6. Arquitetura

### 6.1 Stack recomendada

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Next.js (App Router) | Entrega front e back no mesmo projeto, resolve o proxy da Gemini sem servidor separado |
| Linguagem | TypeScript | O modelo de dados aqui tem muito relacionamento, tipagem evita erro bobo em produção |
| UI | React + Tailwind CSS | Os tokens do design system viram configuração do Tailwind direto |
| Banco | PostgreSQL via Supabase | Conecta em minutos, tem REST pronto e já traz autenticação para quando você precisar na fase 2 |
| ORM | Prisma ou Drizzle | Migração versionada, porque o schema vai mudar |
| IA | Google Gemini API | Chamada sempre pelo servidor, nunca pelo navegador |
| Dados do TikTok | TikTok Shop Open API (Partner Center) | Fonte oficial de produtos, pedidos e comissão. Elimina digitação manual |
| Fila de sincronização | Vercel Cron ou Supabase Edge Functions agendadas | A sincronização é periódica, não pode depender de alguém abrir a tela |
| Deploy | Vercel | Integra com Next.js e com as variáveis de ambiente sem configuração |

### 6.2 Banco desconectado na fase inicial

O banco entra depois, então o código precisa nascer pronto para a troca:

- Toda leitura e escrita passa por uma **camada de repositório** (`/lib/repositories/*`), nunca direto do componente.
- Na fase 1 o repositório lê de um arquivo JSON local ou de memória, respeitando exatamente a mesma interface.
- Quando o banco chegar, troca-se apenas a implementação do repositório. Nenhuma tela muda.

Sem essa camada, conectar o banco depois vira reescrita.

### 6.3 Ponto crítico, a chave da Gemini

A chave da API **nunca** pode ir para o navegador. Sistema publicado com chave no front significa qualquer pessoa usando sua cota.

**Regra obrigatória:** toda chamada à Gemini passa por uma rota de servidor (`/api/ia/*`). A chave vive em variável de ambiente no servidor. O front só conhece a rota interna.

### 6.4 Integração com a API oficial do TikTok Shop

O sistema usa a **TikTok Shop Open API**, registrada pelo TikTok Shop Partner Center, como fonte oficial de dados. Nada de produto, pedido ou comissão é digitado à mão quando a API consegue trazer.

#### Pré-requisitos (antes de escrever a primeira linha de código)

1. Conta de desenvolvedor aprovada no TikTok Shop Partner Center.
2. App criado, com `app_key` e `app_secret` emitidos.
3. Escopos solicitados e aprovados para produto, pedido e dados de afiliado.
4. Autorização da conta pelo fluxo OAuth, que devolve `access_token` e `refresh_token`.
5. Ambiente de sandbox validado antes de apontar para produção.

Esses cinco itens são bloqueadores. Enquanto não estiverem prontos, o sistema roda com a importação de arquivo como fonte de dados.

#### Camadas da integração

| Camada | Responsabilidade |
|---|---|
| `lib/tiktok/auth.ts` | Fluxo OAuth, renovação automática do token antes de expirar |
| `lib/tiktok/client.ts` | Assinatura da requisição, timestamp, controle de limite de chamadas, retentativa com espera crescente |
| `lib/tiktok/sync/*.ts` | Um sincronizador por domínio: produtos, pedidos, comissão, amostras |
| `lib/tiktok/mapper.ts` | Traduz o formato da API para o modelo interno do sistema |

#### Rotas internas

| Rota | Função |
|---|---|
| `GET /api/tiktok/auth/iniciar` | Redireciona para a autorização do TikTok |
| `GET /api/tiktok/auth/retorno` | Recebe o código, troca por token e grava |
| `POST /api/tiktok/sync/produtos` | Sincroniza catálogo e comissões |
| `POST /api/tiktok/sync/vendas` | Sincroniza pedidos e comissão do período |
| `GET /api/tiktok/status` | Estado da conexão, data da última sincronização, erros recentes |
| `POST /api/cron/sync` | Chamada agendada, roda os sincronizadores em sequência |

#### Regras de sincronização

1. **Frequência:** produtos uma vez por dia, vendas a cada 6 horas. Pedido recente ainda muda de status, então o sistema reprocessa os últimos 7 dias em toda rodada.
2. **Sincronização incremental.** Guardar o `update_time` da última leitura e pedir só o que mudou. Puxar tudo toda vez estoura o limite de chamadas.
3. **Idempotência.** Todo registro entra por `upsert` usando o ID do TikTok como chave única. Rodar duas vezes não pode duplicar venda.
4. **A API é a dona do dado.** Campos vindos do TikTok (preço, comissão, status do pedido) são somente leitura na interface. Campos do usuário (nota, observação, status de trabalho, prazo de conteúdo) nunca são sobrescritos pela sincronização.
5. **Falha não apaga nada.** Erro de sincronização registra log e mantém o dado anterior. Nunca limpar a base antes de confirmar que a carga nova veio completa.
6. **Limite de chamadas.** Respeitar o teto da API com fila e espera crescente. Estourar limite repetidamente pode suspender o app.

#### Segurança dos tokens

`app_secret`, `access_token` e `refresh_token` ficam **apenas no servidor**, em variável de ambiente ou em tabela com acesso restrito. Nenhum deles pode chegar ao navegador, pelo mesmo motivo da chave da Gemini. Aqui o risco é maior: um token vazado dá acesso a uma conta comercial real.

---

## 7. Modelo de dados

### `produtos`

| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid | PK |
| `tiktok_product_id` | text | Chave única vinda da API, usada no `upsert`. Nulo quando cadastrado à mão |
| `fonte` | enum | `api`, `manual`. Define quais campos são editáveis na interface |
| `sincronizado_em` | timestamp | Última vez que a API atualizou este registro |
| `nome` | text | |
| `loja` | text | Nome do seller |
| `categoria` | text | |
| `link_tiktok` | text | Link do produto na vitrine |
| `imagem_url` | text | |
| `preco` | numeric | Preço de venda atual |
| `comissao_pct` | numeric | Percentual do afiliado |
| `comissao_valor` | numeric | Calculado, mas gravado para histórico |
| `status` | enum | `radar`, `solicitado`, `ativo`, `pausado`, `descartado` |
| `nota_potencial` | int | 0 a 100, atribuído pela IA ou manual |
| `observacao` | text | |
| `criado_em` / `atualizado_em` | timestamp | |

### `amostras`

| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid | PK |
| `produto_id` | uuid | FK produtos |
| `status` | enum | `solicitada`, `aprovada`, `enviada`, `recebida`, `recusada`, `devolvida` |
| `origem` | enum | `gratuita`, `comprada`, `parceria` |
| `custo` | numeric | Zero quando gratuita |
| `data_solicitacao` | date | |
| `data_recebimento` | date | |
| `prazo_conteudo` | date | Data limite acordada para publicar |
| `codigo_rastreio` | text | |
| `observacao` | text | |

**Regra de negócio:** amostra com status `recebida` e sem conteúdo publicado até `prazo_conteudo` entra automaticamente no bloco "Em risco" do Dashboard.

### `conteudos`

| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid | PK |
| `produto_id` | uuid | FK produtos |
| `amostra_id` | uuid | FK amostras, opcional |
| `titulo` | text | |
| `formato` | enum | `video_curto`, `live`, `carrossel`, `unboxing` |
| `status` | enum | `ideia`, `roteiro_pronto`, `gravado`, `editado`, `publicado` |
| `data_prevista` | date | Entra no calendário |
| `data_publicacao` | date | |
| `link_publicacao` | text | |

### `roteiros`

| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid | PK |
| `conteudo_id` | uuid | FK conteudos |
| `produto_id` | uuid | FK produtos |
| `publico` | enum | `frio`, `morno`, `quente` |
| `gancho` | text | Primeiros 3 segundos, campo separado de propósito |
| `corpo` | text | |
| `cta` | text | |
| `versao` | int | Permite gerar variação sem perder a anterior |
| `gerado_por_ia` | boolean | |
| `modelo_ia` | text | Qual modelo gerou |
| `editado_manualmente` | boolean | |

### `vendas`

| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid | PK |
| `tiktok_order_id` | text | Chave única do pedido na API, base do `upsert` |
| `produto_id` | uuid | FK produtos |
| `conteudo_id` | uuid | FK conteudos, quando a API identificar o vídeo de origem |
| `data` | date | |
| `origem` | enum | `video`, `live`, `vitrine`, `outro` |
| `status_pedido` | enum | `pendente`, `enviado`, `concluido`, `cancelado`, `devolvido` |
| `pedidos` | int | |
| `itens` | int | |
| `gmv` | numeric | Valor bruto vendido |
| `comissao` | numeric | |
| `comissao_confirmada` | boolean | Comissão só conta como real depois do pedido concluído |
| `fonte` | enum | `api`, `importacao` |
| `sincronizado_em` | timestamp | |

**Regra:** pedido cancelado ou devolvido não some da base, muda de status. Comissão do mês soma apenas `comissao_confirmada = true`. Sem isso, o Dashboard mostra um número que depois encolhe.

### `integracoes`

Guarda a conexão com o TikTok Shop. Uma linha por conta conectada.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid | PK |
| `provedor` | text | `tiktok_shop` |
| `conta_nome` | text | Identificação legível da conta |
| `access_token` | text | Criptografado, acesso somente pelo servidor |
| `refresh_token` | text | Criptografado |
| `expira_em` | timestamp | Base para renovação automática |
| `escopos` | text[] | Permissões concedidas |
| `status` | enum | `conectada`, `expirada`, `erro`, `desconectada` |

### `sincronizacoes`

Log de cada rodada, para diagnosticar falha sem abrir o servidor.

| Campo | Tipo |
|---|---|
| `id` | uuid |
| `tipo` | enum `produtos`, `vendas`, `comissao` |
| `iniciada_em` / `concluida_em` | timestamp |
| `registros_criados` / `registros_atualizados` | int |
| `status` | enum `sucesso`, `parcial`, `erro` |
| `mensagem_erro` | text |

### `importacoes`

Plano B, mantido para quando a API estiver fora do ar ou algum dado não vier por ela.

| Campo | Tipo |
|---|---|
| `id` | uuid |
| `arquivo_nome` | text |
| `periodo_inicio` / `periodo_fim` | date |
| `linhas_importadas` | int |
| `status` | enum `processando`, `concluida`, `erro` |

### `analises_ia`

Guarda o que a IA produziu, para não pagar duas vezes pela mesma pergunta e para comparar diagnósticos ao longo do tempo.

| Campo | Tipo |
|---|---|
| `id` | uuid |
| `tipo` | enum `roteiro`, `analise_vendas`, `potencial_produto` |
| `referencia_id` | uuid |
| `entrada_resumo` | jsonb |
| `saida` | text |
| `modelo` | text |
| `criado_em` | timestamp |

---

## 8. Módulos em detalhe

### 8.1 Dashboard

Primeira tela ao abrir. Responde a pergunta "o que eu preciso fazer agora".

**Faixa de métricas (4 cartões):**

1. Amostras aguardando conteúdo (número + quantas vencem em 3 dias)
2. Conteúdos previstos para esta semana
3. GMV do mês, com carimbo de horário da última sincronização
4. Comissão confirmada do mês, em cartão de superfície escura, seguindo a regra do design system de destacar o dado principal

Se a conexão com o TikTok estiver com erro ou o token expirado, aparece uma faixa de aviso no topo do Dashboard, acima das métricas. Número desatualizado sem aviso é pior do que número nenhum.

**Bloco principal (2/3 + 1/3):**

- Esquerda: gráfico de comissão por dia no mês corrente, linha em `neutral-900` sobre área cinza, conforme seção 6 do design system.
- Direita: lista "Precisa da sua atenção", com amostras em risco e conteúdos atrasados. Cada linha leva direto ao registro.

**Bloco inferior:**

- Top 5 produtos por comissão no período, barra em `lime-600`.
- Caixa de diagnóstico escrito pela Gemini, com botão "Gerar análise do mês".

### 8.2 Produtos

**Origem dos dados:** o catálogo vem da API oficial. Produto sincronizado traz nome, loja, preço, comissão e imagem já preenchidos e **bloqueados para edição**, com um ícone indicando que o dado é oficial. O cadastro manual continua existindo para produto que ainda não está vinculado à sua conta.

Campos que continuam seus, mesmo em produto sincronizado: status de trabalho, nota de potencial e observação. A sincronização nunca toca neles.

**Visões:** tabela (padrão) e grade de cartões.

**Colunas da tabela:** imagem, nome, loja, preço, comissão (% e R$), status, nota de potencial, vendas no período, ações.

**Filtros:** status, categoria, faixa de comissão, com ou sem amostra.

**Ações por produto:**

- Solicitar amostra (cria registro em `amostras` e muda status para `solicitado`)
- Criar conteúdo (abre o calendário já com o produto preenchido)
- Gerar roteiro
- Avaliar potencial com IA

**Avaliação de potencial:** a IA recebe nome, categoria, preço, comissão e histórico de vendas do produto, e devolve nota de 0 a 100 mais três linhas de justificativa. A nota é sugestão, editável à mão. Se não houver histórico, a IA precisa dizer isso, não chutar.

### 8.3 Amostras

Duas visões: **quadro por status** (colunas arrastáveis) e **tabela**.

Colunas do quadro: Solicitada → Aprovada → Enviada → Recebida → Conteúdo publicado.

**Sinalização de prazo**, usando as cores semânticas do design system:

| Situação | Cor |
|---|---|
| Prazo confortável (mais de 5 dias) | `neutral-600` |
| Prazo apertado (1 a 5 dias) | Warning `#B26A00` |
| Vencido | Error `magenta-700` |

Cor nunca sozinha: ao lado vai sempre o texto "vence em X dias" ou "atrasado há X dias".

**Regra importante:** mover uma amostra para "Recebida" abre um aviso perguntando a data limite de conteúdo. Sem prazo, não existe cobrança.

### 8.4 Calendário

**Visões:** mês (padrão), semana e lista.

Cada evento é um `conteudo`, com cor de borda pelo status e miniatura do produto.

**Interações:** arrastar para mudar a data, clicar para abrir o painel lateral com detalhes, roteiro vinculado e botão de marcar como publicado.

**Indicador de ritmo:** contador de publicações por semana comparado com a meta definida nas configurações. Uma barra simples, não um gráfico.

### 8.5 Roteiros

**Fluxo:** escolher produto → escolher público (frio, morno, quente) → escolher formato e duração → gerar → editar → salvar e vincular a um conteúdo.

A estrutura segue a lógica de **gancho, corpo e CTA em campos separados**. Isso não é detalhe de tela: separar obriga a tratar o gancho como peça independente, que é onde o vídeo é ganho ou perdido.

**Funcionalidades:**

- Gerar 3 variações de gancho para o mesmo corpo
- Salvar versão e comparar com a anterior
- Biblioteca de roteiros filtrável por produto e por público
- Marcar roteiro como "funcionou", criando base para o sistema aprender o que repetir

### 8.6 Análise de vendas

**Entrada de dados (principal):** sincronização automática pela API oficial do TikTok Shop, a cada 6 horas, sem ação do usuário.

No topo da tela fica uma faixa de estado da conexão:

| Estado | Exibição |
|---|---|
| Conectada e atualizada | "Sincronizado há X minutos", texto `neutral-600` |
| Sincronizando | Indicador de progresso, sem travar a tela |
| Atrasada (mais de 12h) | Warning `#B26A00` + botão "Sincronizar agora" |
| Token expirado ou erro | Error `magenta-700` + botão "Reconectar conta" |

**Entrada de dados (plano B):** upload de arquivo CSV ou XLSX exportado do painel de afiliado, usado quando a API estiver indisponível ou quando algum dado não for exposto por ela.

Fluxo de importação:

1. Upload do arquivo
2. Tela de mapeamento de colunas (o formato de exportação muda, então o mapeamento não pode ser fixo no código)
3. Pré-visualização das primeiras 10 linhas
4. Conferência de duplicidade contra o que já veio pela API, usando o ID do pedido
5. Confirmação e gravação, com registro em `importacoes`
6. Opção de desfazer a última importação

A importação manual nunca sobrescreve registro que veio da API. Em conflito, o dado da API vence.

**Telas de saída:**

- Evolução de GMV e comissão no período
- Ranking de produtos por comissão
- Comparação de origem (vídeo, live, vitrine)
- Produtos que caíram: vendiam antes e pararam
- Caixa de diagnóstico da Gemini

---

## 9. Integração com a Gemini

### 9.1 Rotas

| Rota | Função |
|---|---|
| `POST /api/ia/roteiro` | Gera roteiro a partir de produto, público, formato e duração |
| `POST /api/ia/ganchos` | Gera variações de gancho |
| `POST /api/ia/analise-vendas` | Diagnóstico escrito sobre um período |
| `POST /api/ia/potencial-produto` | Nota e justificativa de um produto |

### 9.2 Modelos

Usar a família Gemini mais recente disponível no momento da implementação: um modelo rápido e barato para roteiro e gancho, e um modelo de raciocínio mais forte para análise de vendas. Os identificadores exatos precisam ser conferidos na documentação do Google na hora de implementar, porque mudam com frequência.

### 9.3 Regras não negociáveis dos prompts

1. **A IA não inventa número.** Todo dado quantitativo vai no prompt vindo do banco. Se o dado não existe, a resposta precisa dizer "não há dado suficiente", nunca estimar.
2. **Saída estruturada.** Roteiro volta em JSON com os campos `gancho`, `corpo` e `cta`. Texto corrido quebra a interface.
3. **Português do Brasil, linguagem falada.** Roteiro é para ser lido em voz alta, não lido na tela.
4. **Sem promessa proibida.** O prompt de sistema veta promessa de resultado garantido, alegação de cura e superlativo sem base. Isso protege a conta do afiliado.
5. **Análise de vendas termina com ação.** No máximo três recomendações concretas, cada uma ligada a um número que apareceu na entrada.

### 9.4 Controle de custo

- Guardar toda resposta em `analises_ia`.
- Análise do mesmo período e mesmo recorte reusa o resultado gravado, com botão explícito "gerar de novo".
- Limite de chamadas por dia configurável, para o caso de um bug entrar em laço.

---

## 10. Layout e design

Segue integralmente o `design-system.md` já elaborado. Pontos de aplicação direta:

### Estrutura

| Elemento | Especificação |
|---|---|
| Menu lateral | Fixo, 288px, fundo `neutral-50` (`#FFFFFF`), sem scroll |
| Área de conteúdo | Fluida, scroll independente, fundo `neutral-300` (`#E2E3E4`) |
| Margem lateral do conteúdo | 32px |
| Grid | 12 colunas, gap 24px |
| Bloco principal | Divisão 2/3 + 1/3, repetida em todas as telas |

### Menu

Ordem fixa: Dashboard, Produtos, Amostras, Calendário, Roteiros, Análise de Vendas. No rodapé do menu, separado por respiro de 48px: Configurações.

Item ativo: fundo `neutral-150`, texto `neutral-900`, ícone `neutral-900`. Item inativo: texto `neutral-600`.

### Aplicação das cores semânticas

| Situação | Token |
|---|---|
| Comissão, venda, meta batida | Success `#497D00` no texto, `lime-600` no gráfico |
| Prazo apertado | Warning `#B26A00` |
| Atraso, amostra vencida, queda de venda | Error `magenta-700` |
| Ação principal (salvar, gerar) | Primary `neutral-900` com texto branco |
| Ações repetidas (adicionar, filtrar) | Secondary `neutral-150` |
| Marca-texto em título de seção | `lime-500` com texto `neutral-900`, no máximo duas palavras |

### Correções de acessibilidade já mapeadas

- Texto secundário usa `#6B7076`, não `#7E858B`. O segundo reprova em contraste.
- `lime-500` nunca como texto sobre fundo claro.
- Toda sinalização por cor acompanhada de texto.

### Estados obrigatórios de cada tela

Não existe tela sem estes quatro estados desenhados: **vazio**, **carregando**, **erro** e **com dados**. Estado vazio precisa de uma ação, não só de uma frase.

---

## 11. Fluxos principais

### Fluxo 1, do radar ao conteúdo publicado

```
Cadastrar produto (status: radar)
  → Avaliar potencial com IA
  → Solicitar amostra (status: solicitado)
  → Registrar recebimento + definir prazo (status: ativo)
  → Gerar roteiro
  → Agendar no calendário
  → Marcar como publicado
  → Importar vendas
  → Ver retorno do produto
```

Esse é o fluxo que justifica o sistema. Cada passo grava dado que o passo seguinte usa.

### Fluxo 2, rotina semanal

```
Abrir Dashboard
  → Ver amostras em risco
  → Gerar roteiro do que está atrasado
  → Agendar gravação na semana
```

### Fluxo 3, fechamento de mês

```
Exportar relatório do TikTok Shop
  → Importar no sistema
  → Conferir ranking de produtos
  → Gerar diagnóstico com IA
  → Pausar produtos que não rendem
```

---

## 12. Requisitos não funcionais

| Requisito | Alvo |
|---|---|
| Carregamento inicial | Abaixo de 2 segundos em conexão 4G |
| Resposta da geração de roteiro | Abaixo de 8 segundos, com indicador de progresso visível |
| Importação | Até 5.000 linhas sem travar a interface |
| Responsivo | Desktop é prioridade. Abaixo de 1024px o menu vira gaveta |
| Navegação por teclado | Todas as ações principais acessíveis por tab, com foco visível |
| Backup | Exportação de todos os dados em CSV a qualquer momento |

---

## 13. Riscos e pontos que precisam de decisão

### Risco 1, sistema aberto e publicado

Sem autenticação e com URL pública, qualquer pessoa que descobrir o endereço vê e altera seus dados de produto, venda e comissão. Isso é informação comercial sensível.

**Mitigação mínima até a fase 2:** proteção por senha única no nível da hospedagem (Vercel Password Protection ou uma senha simples em middleware). Custa uma hora de trabalho e resolve o cenário mais provável, que é alguém achar o link por acaso.

Minha recomendação: não publique com dados reais enquanto não houver ao menos essa barreira.

### Risco 2, chave da Gemini exposta

Já tratado na seção 6.3, mas repito porque é o erro mais comum nesse tipo de projeto. Chave no front significa conta drenada por terceiros. Toda chamada pelo servidor, sem exceção.

### Risco 3, a aprovação da API não depende de você

A API oficial é a decisão certa: elimina digitação, mantém o dado confiável e é o que separa esse sistema de uma planilha bonita. Mas o acesso passa por aprovação do TikTok no Partner Center, e esse processo tem prazo incerto e pode ser negado. Além disso, os escopos liberados para conta de afiliado costumam ser mais restritos que os de seller, então nem todo dado que você espera pode estar disponível.

O erro a evitar não é usar a API. É deixar o projeto parado esperando a aprovação.

**Mitigação, em três partes:**

1. Abrir o cadastro no Partner Center **hoje**, antes de começar o desenvolvimento. É a tarefa com maior tempo de espera e menor esforço.
2. Construir a camada de dados atrás de uma interface única. Se o sincronizador da API ainda não estiver liberado, a mesma interface é alimentada pela importação de arquivo. Nenhuma tela precisa saber de onde veio o dado.
3. Manter a importação manual viva depois da API funcionando. Ela cobre queda de serviço, mudança de escopo e dado que a API não expõe.

### Risco 4, quebra de contrato da API

A API do TikTok Shop muda sem aviso longo, e app que estoura limite de chamadas pode ser suspenso.

**Mitigação:** versionar o mapeamento em `mapper.ts`, tratar campo ausente sem derrubar a sincronização, registrar toda rodada em `sincronizacoes` e alertar no Dashboard quando duas rodadas seguidas falharem.

### Risco 5, escopo grande demais para a fase 1

Seis módulos é bastante para uma primeira entrega. O risco real é o projeto ficar 80% pronto e nunca sair.

**Mitigação:** cortar a fase 1 em Produtos + Amostras + Calendário, que já formam um fluxo completo e útil sozinho. Roteiros e Análise entram na fase 2.

---

## 14. Fases

| Fase | Entrega | Critério de conclusão |
|---|---|---|
| **0. Credenciais** | Cadastro no TikTok Shop Partner Center, criação do app, pedido de escopos | `app_key` e `app_secret` em mãos |
| **1. Base** | Layout, design system aplicado, camada de repositório, Produtos, Amostras, Calendário | Você consegue rodar uma semana real de trabalho só no sistema |
| **2. Inteligência** | Banco conectado, Roteiros com Gemini, Dashboard completo | Roteiro gerado e usado em vídeo publicado de verdade |
| **3. Integração** | OAuth do TikTok, sincronizador de produtos e vendas, cron, tela de status | Uma venda aparece no sistema sem você digitar nada |
| **4. Retorno** | Análise de vendas, ranking, diagnóstico por IA | Você decide pausar um produto com base no que o sistema mostrou |
| **5. Escala** | Autenticação, múltiplos usuários, várias contas conectadas | Outra pessoa usa o sistema sem você do lado |

A fase 0 roda em paralelo com a 1 e a 2. Ela não bloqueia nada, mas precisa começar primeiro porque é a única que depende de terceiro.

---

## 15. Métricas de sucesso

| Métrica | Como medir | Alvo |
|---|---|---|
| Amostras entregues no prazo | Conteúdos publicados até `prazo_conteudo` dividido pelo total de amostras recebidas | Acima de 90% |
| Tempo até o roteiro pronto | Da abertura do produto até salvar o roteiro | Abaixo de 2 minutos |
| Uso contínuo | Dias com pelo menos uma ação no sistema | 5 de cada 7 dias |
| Decisão orientada por dado | Produtos pausados ou reativados com base na tela de análise | Pelo menos 3 por mês |

O sistema só está funcionando se você parar de usar a planilha. Essa é a métrica real, e ela é binária.

---

## 16. Perguntas em aberto

1. Quais escopos a API libera para conta de afiliado? Especificamente: ela devolve a venda separada por vídeo, ou só por produto? Isso define se o campo `conteudo_id` em `vendas` é preenchível ou decorativo, e é a resposta mais importante de todas para o modelo de dados.
2. O cadastro no TikTok Shop Partner Center já foi iniciado? Se não, é a primeira tarefa, porque o prazo de aprovação não está no seu controle.
3. A API expõe o fluxo de amostras (pedido, aprovação, envio), ou esse módulo continua manual? Se for manual, ele vira o principal trabalho de digitação do sistema.
4. Você quer registrar o custo das amostras compradas para calcular retorno real por produto, ou isso fica na sua planilha de precificação que já existe?
5. O calendário precisa considerar horário de publicação, ou basta a data?
6. Existe alguém além de você que vai usar o sistema na fase 1? Se sim, a autenticação sobe de prioridade.
