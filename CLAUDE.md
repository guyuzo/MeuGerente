# CLAUDE.md

Instruções de desenvolvimento para o projeto **Meu Gerente** — sistema de organização de criação de conteúdo para afiliados do TikTok Shop.

Documentos de referência do produto (ler antes de implementar qualquer funcionalidade):
- [`prd.md`](prd.md) — requisitos de produto, módulos, modelo de dados
- [`designsystem.md`](designsystem.md) — tokens visuais (cor, tipografia, espaçamento, raio, elevação)

---

## Stack de desenvolvimento

- **React** — biblioteca de UI
- **Vite** — build tool e dev server
- **Tailwind CSS** — estilização utilitária

Toda implementação de UI deve traduzir os tokens de [`designsystem.md`](designsystem.md) para `tailwind.config` (cores, `borderRadius`, `fontSize`, `spacing`, `boxShadow`) em vez de usar valores soltos (hex/px direto na classe). Se um valor visual não existir ainda como token, ele deve ser adicionado ao design system primeiro, não improvisado inline.

## Responsividade — mobile first

- Todo componente e toda tela são construídos primeiro para a viewport mobile; breakpoints maiores (`sm:`, `md:`, `lg:`, `xl:`) são adições, nunca o ponto de partida.
- Nenhuma tela pode depender de largura mínima de desktop para ser funcional — o sistema precisa ser 100% utilizável no celular, com desktop como camada de conforto adicional (conforme definido no PRD, seção 7).
- Ao revisar um componente, valide mentalmente o layout em 3 larguras: mobile (~375px), tablet (~768px) e desktop (~1280px) antes de considerar pronto.

## Componentização e reaproveitamento

O sistema é construído como biblioteca de componentes, não como telas isoladas.

**Antes de criar qualquer componente novo:**
1. Procure na árvore de componentes existente (`src/components/`) por algo que já resolva a mesma necessidade — por nome, por propósito, e por semelhança visual/estrutural (não só por nome exato).
2. Se existir um componente próximo mas não idêntico, prefira **estendê-lo** (props adicionais, variantes) a duplicá-lo.
3. Só crie um componente novo quando nenhuma variação de um existente resolver o caso.

**Estrutura de componentes esperada:**
```
src/
  components/
    ui/          # componentes de base reutilizáveis (Button, Card, Chip, Badge, ProgressRing, DateChip...)
    layout/       # estrutura de página (AppShell, Sidebar, MobileNav...)
    features/     # componentes específicos de módulo (CalendarioMensal, GanchoCard, MarcaCard...)
```

- Componentes de `ui/` não conhecem regra de negócio — recebem dados via props e emitem eventos. Regras específicas de módulo (Calendário, Ganchos, Marcas, Amostras, Modelagem de Vídeo) ficam em `features/`.
- Nomeie componentes pelo que representam no domínio do produto (`GanchoCard`, `AmostraStatusBadge`), não pela tela onde aparecem primeiro — isso facilita identificar reaproveitamento entre módulos.

## Otimização de contexto e tokens

- Ao implementar ou alterar algo, leia apenas os arquivos necessários para a tarefa — não releia o projeto inteiro por precaução.
- Prefira busca direcionada (grep/glob por nome de componente, hook ou token) a explorar pastas inteiras quando o alvo já é conhecido ou previsível.
- Reaproveitar componentes existentes (seção acima) é também uma medida de economia de tokens: menos código novo para gerar, revisar e manter contexto.
- Ao entregar uma implementação, não é necessário reler arquivos que acabaram de ser escritos/editados nesta mesma sessão para "confirmar" — assuma o resultado da escrita, a menos que haja motivo concreto para revalidar.
