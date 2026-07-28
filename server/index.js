import 'dotenv/config'
import crypto from 'node:crypto'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const { TIKTOK_APP_KEY, TIKTOK_APP_SECRET, TIKTOK_REDIRECT_URI } = process.env
const tiktokConfigurado = Boolean(TIKTOK_APP_KEY && TIKTOK_APP_SECRET && TIKTOK_REDIRECT_URI)

// Guardado em memoria do processo por enquanto — uso individual (prd.md
// secao 4), sem multiusuario. Reiniciar o servidor derruba a conexao e
// exige clicar em "Conectar com TikTok" de novo.
let tokenTikTok = null

// A API v2 do TikTok exige PKCE (code_challenge) mesmo com client_secret —
// sem isso a tela de autorizacao recusa com "code_challenge" no erro.
// O verifier fica em memoria, associado ao "state" de cada tentativa, e e
// consumido (deletado) na troca do code por token.
const pkceVerifierPorState = new Map()

function gerarPkce() {
  const verifier = crypto.randomBytes(32).toString('base64url')
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

app.use(cors({ origin: FRONTEND_URL }))

app.get('/api/tiktok/status', (_req, res) => {
  res.json({ configurado: tiktokConfigurado, conectado: Boolean(tokenTikTok) })
})

// Passo 1 do OAuth: manda o usuario pra tela de autorizacao do TikTok.
app.get('/auth/tiktok', (_req, res) => {
  if (!tiktokConfigurado) {
    res
      .status(503)
      .send(
        'TikTok ainda nao configurado neste servidor. Preencha server/.env ' +
          '(copie de server/.env.example) com TIKTOK_APP_KEY, TIKTOK_APP_SECRET ' +
          'e TIKTOK_REDIRECT_URI — essas chaves vem do app que voce registrar ' +
          'em developers.tiktok.com.',
      )
    return
  }

  const state = crypto.randomBytes(16).toString('hex')
  const { verifier, challenge } = gerarPkce()
  pkceVerifierPorState.set(state, verifier)

  const url = new URL('https://www.tiktok.com/v2/auth/authorize/')
  url.searchParams.set('client_key', TIKTOK_APP_KEY)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'user.info.basic')
  url.searchParams.set('redirect_uri', TIKTOK_REDIRECT_URI)
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  res.redirect(url.toString())
})

// Passo 2: TikTok redireciona de volta pra ca com um "code" de uso unico,
// que trocamos pelo access_token — essa troca so pode acontecer aqui no
// servidor, nunca no navegador, porque exige o TIKTOK_APP_SECRET.
app.get('/auth/tiktok/callback', async (req, res) => {
  const { code, error, state } = req.query
  const verifier = state ? pkceVerifierPorState.get(String(state)) : null
  if (state) pkceVerifierPorState.delete(String(state))

  if (error || !code || !verifier) {
    res.redirect(`${FRONTEND_URL}/?tiktok=erro`)
    return
  }

  try {
    const resposta = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: TIKTOK_APP_KEY,
        client_secret: TIKTOK_APP_SECRET,
        code: String(code),
        grant_type: 'authorization_code',
        redirect_uri: TIKTOK_REDIRECT_URI,
        code_verifier: verifier,
      }),
    })
    const dados = await resposta.json()
    if (!resposta.ok) throw new Error(dados.error_description || 'Falha ao trocar o code por token')

    tokenTikTok = dados
    res.redirect(`${FRONTEND_URL}/?tiktok=conectado`)
  } catch (excecao) {
    console.error('Erro na troca de token TikTok:', excecao.message)
    res.redirect(`${FRONTEND_URL}/?tiktok=erro`)
  }
})

// Dados do TikTok Shop (GMV, pedidos, produtos vendidos) NAO vem dessa
// mesma API de login — normalmente exigem cadastro proprio na TikTok Shop
// Partner Center (partner.tiktokshop.com), com fluxo de autorizacao e
// credenciais separados. Ver prd.md secao 6.4 (risco tecnico documentado).
// Este endpoint fica reservado ate isso ser confirmado/registrado.
app.get('/api/tiktok/loja', (_req, res) => {
  if (!tokenTikTok) {
    res.status(401).json({ erro: 'Ainda nao conectado ao TikTok.' })
    return
  }
  res.status(501).json({
    erro: 'Endpoint nao implementado — depende do cadastro na TikTok Shop Partner Center.',
  })
})

app.post('/api/tiktok/desconectar', (_req, res) => {
  tokenTikTok = null
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
  console.log(`TikTok: ${tiktokConfigurado ? 'configurado' : 'AGUARDANDO chaves em server/.env'}`)
})
