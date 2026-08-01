import 'dotenv/config'
import crypto from 'node:crypto'
import express from 'express'
import cors from 'cors'
import {
  analisarArquivo,
  analisarPorUrl,
  modelagemConfigurada,
  LIMITE_VIDEO_BYTES,
} from './modelagem.js'

const app = express()
const PORT = process.env.PORT || 3001
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const { TIKTOK_APP_KEY, TIKTOK_APP_SECRET, TIKTOK_REDIRECT_URI } = process.env
const tiktokConfigurado = Boolean(TIKTOK_APP_KEY && TIKTOK_APP_SECRET && TIKTOK_REDIRECT_URI)

// Guardado em memoria do processo por enquanto — uso individual (prd.md
// secao 4), sem multiusuario. Reiniciar o servidor derruba a conexao e
// exige clicar em "Conectar com TikTok" de novo.
let tokenTikTok = null
let perfilTikTok = null

// Usa o escopo user.info.basic (o unico solicitado) so para confirmar a
// conexao e mostrar nome/foto no painel — nenhum outro dado de perfil e
// pedido ou guardado.
async function buscarPerfilTikTok(accessToken) {
  const url = new URL('https://open.tiktokapis.com/v2/user/info/')
  url.searchParams.set('fields', 'display_name,avatar_url')
  const resposta = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const dados = await resposta.json()
  if (!resposta.ok || dados.error?.code !== 'ok') {
    throw new Error(dados.error?.message || 'Falha ao buscar perfil do TikTok')
  }
  return dados.data.user
}

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
app.use(express.json({ limit: '1mb' }))

app.get('/api/tiktok/status', (_req, res) => {
  res.json({
    configurado: tiktokConfigurado,
    conectado: Boolean(tokenTikTok),
    perfil: perfilTikTok,
  })
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
    perfilTikTok = await buscarPerfilTikTok(dados.access_token).catch((excecao) => {
      console.error('Erro ao buscar perfil TikTok:', excecao.message)
      return null
    })
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
  perfilTikTok = null
  res.json({ ok: true })
})

// Modelagem de Video (prd.md 6.5) — a chave do Gemini fica so aqui no
// servidor, nunca no navegador (requisito nao-funcional, prd.md secao 7).
app.get('/api/modelagem/status', (_req, res) => {
  res.json({ configurado: modelagemConfigurada() })
})

const ERRO_SEM_CHAVE =
  'Gemini ainda não configurado neste servidor. Preencha GEMINI_API_KEY em ' +
  'server/.env (a chave sai de aistudio.google.com/apikey).'

app.post('/api/modelagem/analisar', async (req, res) => {
  const { url, transcricaoManual } = req.body ?? {}

  if (!url || !/^https?:\/\//i.test(url)) {
    res.status(400).json({ erro: 'Informe a URL completa do vídeo no TikTok.' })
    return
  }
  if (!modelagemConfigurada()) {
    res.status(503).json({ erro: ERRO_SEM_CHAVE })
    return
  }

  try {
    res.json(await analisarPorUrl({ url, transcricaoManual }))
  } catch (excecao) {
    console.error('Erro na modelagem por link:', excecao.message)
    res.status(502).json({ erro: excecao.message })
  }
})

// Upload do arquivo de video — o caminho completo (audio + frames).
// Recebe o binario cru em vez de multipart/base64: base64 dentro de JSON
// infla o corpo em ~33% e exigiria uma dependencia de parser so para isso.
// Metadados vao em headers, ja que o corpo inteiro e o video.
app.post(
  '/api/modelagem/analisar-arquivo',
  express.raw({ type: ['video/*', 'application/octet-stream'], limit: LIMITE_VIDEO_BYTES }),
  async (req, res) => {
    if (!modelagemConfigurada()) {
      res.status(503).json({ erro: ERRO_SEM_CHAVE })
      return
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      res.status(400).json({ erro: 'Nenhum vídeo recebido.' })
      return
    }

    const mimeType = req.get('content-type')?.split(';')[0] || 'video/mp4'
    // Nome do arquivo pode ter acento/emoji, que nao passa em header cru.
    const nomeArquivo = decodeURIComponent(req.get('x-nome-arquivo') || '') || 'video'
    const transcricaoManual = decodeURIComponent(req.get('x-transcricao') || '')

    try {
      res.json(
        await analisarArquivo({ bytes: req.body, mimeType, nomeArquivo, transcricaoManual }),
      )
    } catch (excecao) {
      console.error('Erro na modelagem por arquivo:', excecao.message)
      res.status(502).json({ erro: excecao.message })
    }
  },
)

// Corpo maior que o limite chega aqui como erro do express.raw.
app.use((erro, _req, res, proximo) => {
  if (erro?.type === 'entity.too.large') {
    res.status(413).json({
      erro: `Vídeo acima do limite de ${Math.round(LIMITE_VIDEO_BYTES / 1024 / 1024)} MB.`,
    })
    return
  }
  proximo(erro)
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
  console.log(`TikTok: ${tiktokConfigurado ? 'configurado' : 'AGUARDANDO chaves em server/.env'}`)
  console.log(`Gemini: ${modelagemConfigurada() ? 'configurado' : 'AGUARDANDO GEMINI_API_KEY em server/.env'}`)
})
