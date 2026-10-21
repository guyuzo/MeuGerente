# Plano — Multiusuário (abrir o MEU GERENTE para outros afiliados)

> **Status (21/10/2026): implementado.** Etapas 1–5 no código; migrations 0012 e 0013 aplicadas e
> dados existentes atribuídos a eugustavoyuzo@gmail.com. Testado: isolamento entre duas contas
> (43 checagens), redefinição de senha, freio de login e exclusão de conta em cascata.
> Pendente fora do código: configurar Resend (`RESEND_API_KEY`, `EMAIL_REMETENTE`) e `APP_URL`, e
> revisão jurídica dos textos de Termos/Privacidade (`apps/web/src/pages/legal/LegalPage.tsx`).
> Mudança em relação ao plano: conta nova **não** ganha colunas padrão de Amostras — o quadro já
> funciona sem coluna customizada (a conta original também não tem nenhuma).

Hoje o sistema é de um usuário só: nenhuma tabela tem dono, e qualquer conta logada vê e edita
tudo. Abrir cadastro sem este plano expõe produtos, vendas e comissões de todo mundo pra todo mundo.

Objetivo: cada afiliado cria a própria conta, vê **só** os próprios dados, e recupera a senha
sozinho por e-mail.

## Princípio de isolamento

- Toda tabela de dado ganha `usuario_id` (FK para `usuarios`, `on delete cascade`), inclusive as
  filhas (amostras, conteúdos, roteiros, vendas). Redundante de propósito: toda consulta filtra
  pela própria tabela, sem depender de join pra garantir isolamento.
- O `usuarioId` vem **só** da sessão (cookie assinado), nunca do corpo ou da URL da requisição.
- Os repositórios `*.pg.ts` passam a ser criados por requisição com o `usuarioId`
  (`new ProdutoRepositoryPg(usuarioId)`) e aplicam o filtro em todo select/update/delete. A
  interface de `packages/shared` **não muda**, então `apps/web` não muda nessa parte (PRD 6.2).
- Ao criar/atualizar algo que aponta pra outro registro (amostra → produto, conteúdo → amostra,
  roteiro → conteúdo, produto → categoria), o repositório confere que o alvo é do mesmo usuário.
  Id de outro usuário responde 404, igual a id inexistente.

## Etapas

### Etapa 1 — Dono em todas as tabelas (banco)

1. `schema.ts`: `usuarioId` **nullable** em categorias, produtos, amostra_colunas, amostras,
   conteudos, roteiros, vendas, metas, integracoes, sincronizacoes. `db:generate` + `db:migrate`.
2. Script `db/atribuir-dono.ts` (idempotente): atribui todas as linhas sem dono à conta existente
   (eugustavoyuzo@gmail.com). Não é migration — é dado, roda uma vez.
3. `schema.ts`: `usuarioId` vira `notNull()`; unicidades passam a ser por usuário:
   - `produtos.nome_importado` → único em (`usuario_id`, `nome_importado`)
   - `vendas.tiktok_order_id` → único em (`usuario_id`, `tiktok_order_id`)
   - `metas.mes` → único em (`usuario_id`, `mes`)
   `db:generate` + `db:migrate`.

Nenhum SQL escrito à mão: os dois passos de schema saem do `db:generate`.

### Etapa 2 — Repositórios e rotas escopados (server)

1. Cada `*.pg.ts` recebe `usuarioId` no construtor e filtra tudo por ele; `criar` grava o dono.
2. `repositories/index.ts` troca as instâncias únicas por `repositoriosDo(usuarioId)`.
3. `exigirLogin` coloca `usuarioId` em `res.locals`; rotas e services (importação de vendas,
   resumo, IA) usam `repositoriosDo(res.locals.usuarioId)`.
4. Teste de isolamento: duas contas, a B tenta ler/editar/apagar/referenciar cada recurso da A
   por id → sempre 404, e as listas da B vêm vazias.

**Só depois desta etapa o cadastro pode ser ligado.**

### Etapa 3 — Criar conta

1. `POST /api/auth/cadastro` (e-mail + senha, mínimo 8 caracteres), já inicia a sessão.
2. Limite de tentativas por IP (o mesmo freio do login).
3. Conta nova nasce com as colunas padrão do quadro de Amostras.
4. Tela `/cadastro` + link na tela de login. Aceite dos Termos e da Política de Privacidade
   (LGPD — o sistema guarda dado de venda e comissão de terceiros).
5. Front: limpar o cache do React Query no login/logout, pra uma conta nunca ver dado em cache
   da conta anterior no mesmo navegador.

### Etapa 4 — Esqueci a senha (e-mail)

1. Serviço de e-mail transacional no `apps/server` (Resend; `RESEND_API_KEY` e `EMAIL_REMETENTE`
   no `.env` e na Vercel — nunca no `apps/web`).
2. Tabela `redefinicoes_senha` (hash do token, usuário, expira em 1h, usado em).
   `POST /api/auth/esqueci-senha` responde igual exista ou não o e-mail (não vaza quem tem conta).
3. `POST /api/auth/redefinir-senha` com o token: troca a senha e derruba as sessões abertas
   (`usuarios.versao_sessao` entra no token assinado).
4. Telas `/esqueci-senha` e `/redefinir-senha?token=...`.

### Etapa 5 — Proteções de uso aberto

1. `/api/ia/*`: limite diário de gerações por usuário (a chave da Gemini é uma só e paga por todos).
2. Freios de login/cadastro hoje ficam em memória — na Vercel cada instância tem o seu; mover pra
   tabela no Postgres.
3. Excluir conta (LGPD): `DELETE /api/auth/conta` apaga o usuário e, por cascade, todos os dados.

## Fora deste plano

- Planos pagos/assinatura, times (vários usuários na mesma conta), login com Google.
- Verificação de e-mail no cadastro — fácil de somar depois da Etapa 4, que já traz o envio.
