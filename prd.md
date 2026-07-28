# PRD — Meu Gerente

> Product Requirements Document
> Sistema de organização de criação de conteúdo para afiliados do TikTok Shop.

---

## 1. Visão Geral

**Meu Gerente** é um sistema web responsivo (mobile-first) para organizar toda a operação de criação de conteúdo de um afiliado do TikTok Shop: o que gravar, quando gravar, quais ganchos usar, quais produtos/marcas trabalhar, e como cada vídeo performou depois de publicado.

O sistema centraliza em um único lugar o que hoje normalmente fica espalhado entre notas soltas, planilhas e a memória do criador: calendário de gravação/postagem, banco de ganchos testados e validados, catálogo de marcas/produtos por categoria, análise de métricas via integração com o TikTok, e um modelador de vídeo que usa IA para "desmontar" vídeos de referência em insights reaproveitáveis.

A base visual do produto (cores, tipografia, formas) está definida em [`designsystem.md`](designsystem.md) e deve ser seguida por toda implementação de UI.

---

## 2. Contexto e Problema

Afiliados do TikTok Shop precisam manter um ritmo constante de gravação e postagem para manter relevância no algoritmo e em vendas. Esse processo hoje é fragmentado:

- Não há um lugar único que diga "o que eu preciso gravar hoje".
- Ganchos que funcionaram em vídeos anteriores se perdem — não existe um banco de ganchos validados vs. ganchos a testar.
- Produtos e marcas de interesse não têm uma organização por categoria que facilite decidir "o que gravar para qual nicho".
- Vídeos de referência de terceiros (que estão performando bem) são analisados manualmente, sem sistematização de gancho visual, gancho falado, gancho escrito e transcrição.
- Amostras de produtos recebidas não têm rastreamento de status (postado, vendeu, parado).
- Métricas de performance dos próprios vídeos não estão cruzadas com os ganchos/categorias usados, dificultando entender **o que realmente funciona**.

## 3. Objetivos

1. Dar visibilidade diária clara do que precisa ser gravado e do que já está agendado/publicado.
2. Criar um banco de ganchos reutilizável, validado por performance real e alimentado por sugestões de IA.
3. Organizar marcas e produtos de interesse por categoria/subcategoria para facilitar o planejamento de pauta.
4. Conectar métricas reais do TikTok aos vídeos organizados no sistema, permitindo identificar padrões de sucesso.
5. Automatizar a extração de insights de vídeos de referência (próprios ou de terceiros) via IA.
6. Rastrear o ciclo de vida de amostras de produto, do recebimento até a venda.

## 4. Público-alvo / Persona

**Persona primária:** criador de conteúdo afiliado do TikTok Shop, que grava e posta vídeos regularmente promovendo produtos, atuando sozinho ou com uma pequena equipe (editor, social media).

- Uso majoritariamente mobile (grava e organiza pelo celular), com necessidade eventual de uso em desktop para planejamento mais denso (calendário, análise de métricas).
- Não é necessariamente técnico — a interface precisa ser simples mesmo com bastante dado organizado por trás.

> **Assunção a validar:** este PRD assume uso individual (um usuário/uma operação). Suporte a múltiplos usuários/equipe (permissões, atribuição de tarefas) é tratado como fora do escopo do MVP — ver seção 12.

## 5. Escopo

### Dentro do escopo (v1)

- Calendário de conteúdo (gravação + postagem)
- Aba de Ganchos (testar / validados / sugestões IA)
- Marcas & Categorias de produto
- Integração com API/MCP do TikTok para métricas
- Integração com API de IA (Gemini como principal candidato) para sugestões e análises
- Modelagem de vídeo via link do TikTok
- Organização de amostras

### Fora do escopo (v1)

- Multiusuário/equipe com permissões
- Edição de vídeo dentro do sistema
- Publicação automática direto para o TikTok (agendar ≠ postar automaticamente, ao menos no MVP)
- Gestão financeira/comissões de afiliado
- Aplicativo mobile nativo (o sistema é web responsivo, não app de loja)

---

## 6. Funcionalidades

### 6.1 Calendário de Conteúdo

**Descrição:** visão central do sistema. Mostra o que precisa ser gravado hoje, o que já está agendado para gravação/postagem futura, e o que já foi publicado — com status visual claro de cada item.

**User stories:**
- Como criador, quero ver logo ao abrir o sistema quais vídeos preciso gravar hoje, para não perder o ritmo de postagem.
- Como criador, quero visualizar meu calendário em modo mensal, semanal e diário, para planejar tanto o dia a dia quanto o mês.
- Como criador, quero associar a cada item do calendário um produto/marca e um gancho, para já sair da etapa de planejamento com o roteiro pronto.
- Como criador, quero identificar visualmente o que está atrasado (não gravado na data prevista), para agir rápido.
- Como criador, quero marcar um vídeo como gravado, editado, agendado para postagem ou publicado, para acompanhar o pipeline completo, não só a data.

**Requisitos funcionais:**
- Status do item de calendário: `Não gravado`, `Gravado`, `Em edição`, `Agendado para postagem`, `Publicado`, `Atrasado` (derivado automaticamente quando a data prevista passa sem o status avançar).
- Cada item de calendário referencia: data prevista, produto/marca (opcional), categoria/subcategoria (herdada do produto), gancho utilizado (opcional, vínculo com o banco de Ganchos), status, e após publicação, vínculo com as métricas retornadas pela integração TikTok.
- Destaque explícito para "o que precisa ser gravado hoje" (view/filtro dedicado, não apenas o dia no calendário).
- Filtros por categoria, marca e status.
- Criação rápida de item (data + o que gravar), sem exigir preencher todos os campos de uma vez.

### 6.2 Ganchos (Hooks)

**Descrição:** banco central de ganchos, organizado em três status e, adicionalmente, por tipo/formato do gancho.

**Estrutura de dados do gancho (dois eixos independentes):**

| Eixo | Valores |
|---|---|
| **Status** | `Para Testar` · `Validado (já vendeu)` · `Sugestão de IA` |
| **Formato** | `Visual` · `Escrito` (texto na tela) · `Falado` (roteiro/fala) |

Um gancho pode ser, por exemplo, "Falado + Validado" ou "Visual + Sugestão de IA".

**User stories:**
- Como criador, quero registrar um gancho novo que quero testar, para não depender da memória.
- Como criador, quero promover um gancho de "Para Testar" para "Validado" quando ele performar bem em um vídeo publicado, para construir um banco confiável de ganchos que vendem.
- Como criador, quero pedir sugestões de gancho para a IA com base em uma categoria/produto, para ter ponto de partida quando estou sem ideia.
- Como criador, quero ver, para cada gancho validado, quais vídeos o usaram e como performaram, para saber se ainda vale repetir.
- Como criador, quero filtrar ganchos por formato (visual/escrito/falado) e por categoria de produto associada.

**Requisitos funcionais:**
- CRUD completo de ganchos.
- Campo de texto/roteiro do gancho, formato, status, categoria/subcategoria de produto associada (opcional), origem (`Manual` ou `Extraído de Modelagem de Vídeo` — ver 6.5).
- Promoção de status deve ser manual (o criador decide quando um gancho "já vendeu"), mas o sistema deve sugerir a promoção automaticamente quando detectar boa performance via métricas (ver 6.4), a confirmar pelo usuário.
- Geração de sugestões de gancho via IA: input de categoria/produto/contexto → output de N sugestões de gancho já classificadas por formato, entrando no sistema como status `Sugestão de IA`.

### 6.3 Marcas & Categorias

**Descrição:** organização hierárquica de marcas e produtos de interesse, em duas camadas: categoria máxima e subcategoria.

**Exemplo dado pelo usuário:** Categoria máxima `Moda Feminina` → Subcategoria `Blusas`.

**User stories:**
- Como criador, quero cadastrar categorias e subcategorias, para estruturar meu catálogo de nichos de trabalho.
- Como criador, quero associar marcas/produtos a uma subcategoria, para saber rapidamente "o que tenho disponível" dentro de um nicho.
- Como criador, quero marcar marcas como favoritas, para priorizar quem eu gosto de trabalhar.
- Como criador, quero ver, ao abrir uma marca ou categoria, quais vídeos/ganchos/amostras estão vinculados a ela, para ter visão 360° do nicho.

**Requisitos funcionais:**
- Estrutura de 2 níveis: `Categoria` (ex: Moda Feminina) contém N `Subcategorias` (ex: Blusas, Vestidos, Calças).
- `Marca` pertence a uma ou mais subcategorias; `Produto` pertence a uma marca.
- Flag de "marca favorita".
- Categoria/subcategoria é o eixo de cruzamento usado pelos módulos de Calendário, Ganchos e Amostras (todos referenciam essa taxonomia, evitando categorização duplicada).

### 6.4 Integração TikTok (API / MCP) — Métricas e Performance

**Descrição:** conexão com a API oficial do TikTok (e, quando aplicável, via MCP) para trazer métricas reais dos vídeos publicados e permitir análise de performance dentro do sistema.

**User stories:**
- Como criador, quero que o sistema puxe automaticamente as métricas (views, curtidas, comentários, compartilhamentos, e dados de venda do TikTok Shop quando disponíveis) dos vídeos que publiquei, para não ter que checar manualmente.
- Como criador, quero ver um ranking dos vídeos que mais performaram, cruzado com o gancho e a categoria usados, para identificar padrões.
- Como criador, quero que a IA analise essas métricas e me traga insights em linguagem natural (ex: "vídeos com gancho falado em Moda Feminina performam 30% acima da média"), não só números crus.

**Requisitos funcionais:**
- Sincronização periódica (e sob demanda) de métricas dos vídeos publicados vinculados no Calendário.
- Métricas mínimas: visualizações, curtidas, comentários, compartilhamentos, taxa de retenção (se disponível via API), e indicadores de venda do TikTok Shop (GMV, unidades vendidas — se o escopo de API permitir).
- Vínculo automático de métrica → item de calendário → gancho/categoria/produto usados, para permitir os cruzamentos de análise.
- Painel de ranking (top vídeos por métrica, filtrável por período/categoria/gancho).
- Camada de análise via IA sobre esses dados (ver 6.6).

> **Risco/premissa a validar tecnicamente:** o escopo exato de dados acessíveis via API oficial do TikTok (Content Posting API / TikTok Shop Partner API) e a existência/maturidade de um servidor MCP oficial ou de terceiros para TikTok precisam ser validados na fase de descoberta técnica — nem todo dado de venda do TikTok Shop necessariamente é exposto via a mesma API de métricas de conteúdo. Isso pode limitar quais campos de performance de venda ficam disponíveis para cruzamento no MVP.

### 6.5 Modelagem de Vídeo

**Descrição:** o criador cola o link de um vídeo do TikTok (próprio ou de referência/concorrência) e o sistema usa IA para decompor o vídeo em insights estruturados e reaproveitáveis.

**User stories:**
- Como criador, quero colar o link de um vídeo do TikTok e receber automaticamente a transcrição completa, para entender o roteiro sem assistir múltiplas vezes.
- Como criador, quero que o sistema identifique separadamente o gancho visual (o que aparece na tela nos primeiros segundos), o gancho escrito (texto sobreposto) e o gancho falado (a fala inicial), para poder estudar cada camada isoladamente.
- Como criador, quero receber uma sugestão de qual produto/categoria esse formato de vídeo combinaria melhor, para saber se vale adaptar essa estrutura para o meu catálogo.
- Como criador, quero poder salvar os ganchos identificados diretamente no banco de Ganchos (como `Sugestão de IA` ou `Para Testar`), para não ter que recadastrar manualmente.

**Requisitos funcionais:**
- Input: URL de vídeo do TikTok.
- Pipeline de processamento: obtenção do vídeo/áudio → transcrição via IA → análise estruturada retornando:
  - Gancho visual (descrição do que aparece nos primeiros segundos)
  - Gancho escrito (texto na tela, se houver)
  - Gancho falado (transcrição da fala de abertura)
  - Transcrição completa do vídeo
  - Sugestão de produto/categoria compatível com o formato analisado
- Resultado da modelagem fica salvo como registro consultável (histórico de vídeos já modelados), não é descartado após a análise.
- Ação de "enviar para Ganchos" a partir de qualquer gancho identificado na modelagem, pré-preenchendo formato e origem.

> **Risco/premissa a validar tecnicamente:** acesso a download/leitura de vídeo de terceiros no TikTok tem restrições de ToS e disponibilidade de API que precisam ser confirmadas na fase de descoberta técnica — a viabilidade pode depender de o vídeo ser público e de qual API/serviço de transcrição for usado.

### 6.6 Organização de Amostras

**Descrição:** rastreamento do ciclo de vida das amostras de produto recebidas, da chegada até o resultado de venda, usando a mesma taxonomia de categorias/marcas do restante do sistema.

**User stories:**
- Como criador, quero registrar uma amostra recebida com sua marca/categoria, para saber o que tenho disponível para gravar.
- Como criador, quero marcar o status da amostra (recebida, postada, vendeu, parada), para acompanhar o funil de cada produto físico.
- Como criador, quero ver quais amostras ainda não foram postadas, para priorizar o que gravar.
- Como criador, quero ver, para amostras já postadas, o vínculo com o vídeo e a performance dele.

**Requisitos funcionais:**
- Status da amostra: `Recebida`, `Postada`, `Vendeu`, `Parada/Descartada`.
- Vínculo com marca, categoria/subcategoria.
- Vínculo opcional com item do Calendário (o vídeo em que a amostra foi usada), herdando as métricas de performance desse vídeo.
- Filtro por status e categoria (ex: "quais amostras de Moda Feminina > Blusas ainda não foram postadas").

---

## 7. Requisitos Não-Funcionais

- **Responsividade mobile-first:** toda tela deve ser 100% utilizável em smartphone, com desktop como camada de conforto adicional (principalmente para calendário e análise de métricas).
- **Design system:** toda UI segue os tokens definidos em [`designsystem.md`](designsystem.md) (cores, tipografia, raio, espaçamento, elevação).
- **Performance:** carregamento inicial do calendário e da aba "hoje" deve ser priorizado (é a tela de uso diário mais frequente).
- **Segurança:** credenciais de API (TikTok, IA) armazenadas de forma segura no backend, nunca expostas no client.
- **Disponibilidade de dados offline parcial:** não é requisito do MVP, mas o app deve degradar graciosamente se a API do TikTok ou da IA estiver indisponível (mostrar dado em cache/último sync, não quebrar a tela).

## 8. Arquitetura Técnica & Stack

Definido pelo usuário como direção inicial:

- **Frontend:** React
- **Backend/runtime:** Node.js
- **IA:** API de LLM externa — candidato principal **Gemini** (Google), com **Claude** (Anthropic) como alternativa
- **Integração de plataforma:** API oficial do TikTok (Content/Shop) + camada MCP para o TikTok, quando disponível

> Este PRD não define ainda banco de dados, hospedagem, autenticação ou detalhes de infraestrutura — ficam para o documento técnico/arquitetura, a ser derivado deste PRD.

## 9. Integrações Externas

| Integração | Finalidade | Módulo relacionado |
|---|---|---|
| API do TikTok (Content/Shop) + MCP | Métricas de vídeo publicado, dados de venda do TikTok Shop | 6.4 Métricas, 6.6 Amostras |
| API de IA (Gemini, alternativa Claude) | Sugestão de ganchos, análise de performance, modelagem de vídeo (transcrição + extração de insights) | 6.2 Ganchos, 6.4 Análise, 6.5 Modelagem de Vídeo |

## 10. Modelo de Dados — Entidades de Alto Nível

Não é o schema final, mas o mapa conceitual de entidades e relações que o produto precisa suportar:

- **ConteudoCalendario**: data prevista, status, produtoRef, ganchoRef, métricas (após publicação)
- **Gancho**: texto, status (Para Testar / Validado / Sugestão IA), formato (Visual / Escrito / Falado), categoriaRef, origem (Manual / ModelagemDeVideo), vídeos onde foi usado
- **Categoria**: nome (ex: Moda Feminina)
- **Subcategoria**: nome (ex: Blusas), categoriaRef
- **Marca**: nome, favorita (bool), subcategoriasRef (N:N)
- **Produto**: nome, marcaRef
- **ModelagemDeVideo**: url origem, transcrição, ganchoVisual, ganchoEscrito, ganchoFalado, produtoSugeridoRef, data de análise
- **Amostra**: produtoRef, status (Recebida / Postada / Vendeu / Parada), conteudoCalendarioRef (opcional)
- **MetricaVideo**: conteudoCalendarioRef, visualizações, curtidas, comentários, compartilhamentos, GMV/vendas (se disponível), data de sync

Relações-chave: **Categoria → Subcategoria** é a taxonomia raiz, referenciada por Marca, Gancho, ConteudoCalendario e Amostra — garantindo que qualquer módulo possa ser filtrado/cruzado pelo mesmo eixo de nicho.

## 11. Métricas de Sucesso do Produto

- % de itens do calendário que saem de "Não gravado" para "Publicado" dentro do prazo previsto (indicador de consistência de postagem).
- Nº de ganchos promovidos de "Para Testar" para "Validado" ao longo do tempo (indicador de que o banco de ganchos está sendo alimentado por dados reais).
- % de vídeos publicados com métricas sincronizadas automaticamente (saúde da integração TikTok).
- Nº de vídeos modelados via IA reaproveitados como gancho no banco (indicador de valor do módulo de Modelagem de Vídeo).
- Tempo entre "amostra recebida" e "amostra postada" (indicador de gargalo operacional).

## 12. Roadmap / Fases Sugeridas

**Fase 1 — Fundação (MVP funcional sem IA/integrações externas)**
Calendário de conteúdo, Ganchos (CRUD manual, sem sugestão IA), Marcas & Categorias, Amostras. Objetivo: sistema utilizável no dia a dia mesmo sem nenhuma integração externa pronta.

**Fase 2 — Integração TikTok**
Sincronização de métricas, ranking de performance, vínculo métrica ↔ calendário ↔ gancho/categoria.

**Fase 3 — Inteligência Artificial**
Sugestão de ganchos via IA, análise de performance em linguagem natural, promoção assistida de status de gancho.

**Fase 4 — Modelagem de Vídeo**
Pipeline de leitura de link → transcrição → extração de ganchos (visual/escrito/falado) → sugestão de produto.

> Fases são sugeridas em ordem de dependência técnica crescente (a Modelagem de Vídeo depende da mesma camada de IA da Fase 3, por isso vem depois). Podem ser reordenadas por prioridade de negócio.

## 13. Riscos e Premissas

- Disponibilidade e escopo real da API/MCP do TikTok para métricas de conteúdo **e** dados de venda do TikTok Shop pode ser mais restrita do que o desejado — precisa validação técnica antes de comprometer prazo da Fase 2.
- Leitura/transcrição de vídeos de terceiros (não publicados pelo próprio usuário) pode esbarrar em restrições de ToS da plataforma — a Modelagem de Vídeo (6.5) deve ser validada quanto a essa limitação, especialmente para vídeos de concorrência.
- Custo de uso de API de IA (Gemini/Claude) escala com volume de sugestões e modelagens — deve ser considerado no desenho técnico (cache, limites de uso).
- Sistema assume uso individual (não multiusuário) — se a operação crescer para equipe, será necessário revisitar autenticação e permissões, hoje fora de escopo.

## 14. Questões em Aberto

1. O calendário deve suportar recorrência (ex: "gravar toda segunda") ou cada item é sempre criado manualmente?
2. Amostras têm rastreamento de estoque/quantidade, ou é só um registro binário de status?
3. A promoção de gancho para "Validado" tem um critério objetivo (ex: X vendas) ou é sempre decisão manual do criador?
4. Notificações (ex: lembrete do que gravar hoje) fazem parte do MVP ou de uma fase futura?
5. Histórico de modelagens de vídeo tem algum limite de retenção, ou fica indefinidamente salvo?

---

## 15. Referências

- Fundação visual: [`designsystem.md`](designsystem.md)
- Documento futuro (fora do escopo deste PRD): design system específico para os temas de criação de post.
