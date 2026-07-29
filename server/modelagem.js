// Modelagem de Video (prd.md secao 6.5): decompoe um video em ganchos
// reaproveitaveis usando Gemini (candidato principal de IA no prd.md secao 8).
//
// Dois caminhos de entrada, com resultados MUITO diferentes:
//
// 1. ARQUIVO ENVIADO (`analisarArquivo`) — o caminho completo. O video vai
//    para a Files API do Gemini e o modelo processa audio e frames, entao
//    transcricao e os tres ganchos saem de observacao real.
//
// 2. LINK DO TIKTOK (`analisarPorUrl`) — o caminho parcial, e por um limite
//    que o proprio PRD listou como risco a validar: o TikTok nao expoe o MP4
//    publicamente, e o Gemini so le video que recebe em bytes/upload ou por
//    URL do YouTube — uma URL do TikTok como texto e so uma string pra ele.
//    Aproveitamos o que E publico: metadados via oEmbed oficial (legenda,
//    autor, URL da capa) + a CAPA baixada e enviada como imagem, que da visao
//    de verdade para o gancho visual e o texto na tela. O audio fica de fora,
//    a nao ser que o usuario cole a transcricao.
//
// Em qualquer caminho: campo que os dados nao sustentam volta vazio. Um
// gancho fabricado envenenaria o banco de Ganchos, que e onde o usuario
// decide o que gravar.

const OEMBED_TIKTOK = 'https://www.tiktok.com/oembed'
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta'
const GEMINI_UPLOAD = 'https://generativelanguage.googleapis.com/upload/v1beta/files'

export const LIMITE_VIDEO_BYTES = 100 * 1024 * 1024
// Capa de TikTok fica na casa de 50-150KB; 4MB e folga e ainda protege de uma
// URL que devolva algo enorme.
const LIMITE_CAPA_BYTES = 4 * 1024 * 1024
// Video na Files API entra como PROCESSING e vira ACTIVE. Video longo demora
// mais, entao a espera e generosa — mas nunca infinita.
const ESPERA_MAX_MS = 120_000
const INTERVALO_POLL_MS = 2_000

const ESQUEMA_RESPOSTA = {
  type: 'object',
  properties: {
    ganchoVisual: { type: 'string' },
    ganchoEscrito: { type: 'string' },
    ganchoFalado: { type: 'string' },
    transcricao: { type: 'string' },
    sugestaoCategoria: { type: 'string' },
    observacao: { type: 'string' },
  },
  required: [
    'ganchoVisual',
    'ganchoEscrito',
    'ganchoFalado',
    'transcricao',
    'sugestaoCategoria',
    'observacao',
  ],
  propertyOrdering: [
    'ganchoVisual',
    'ganchoEscrito',
    'ganchoFalado',
    'transcricao',
    'sugestaoCategoria',
    'observacao',
  ],
}

const TAREFA = `Você analisa vídeos curtos de afiliados do TikTok Shop e devolve os ganchos reaproveitáveis.

Preencha:
- ganchoVisual: o que aparece na tela nos primeiros segundos.
- ganchoEscrito: o texto sobreposto no vídeo, transcrito literalmente.
- ganchoFalado: a fala de abertura.
- transcricao: a transcrição completa da fala.
- sugestaoCategoria: que categoria/tipo de produto esse formato combina melhor.
- observacao: o que não foi possível determinar e por quê.

Escreva em português do Brasil.`

const REGRA_HONESTIDADE = `REGRA CRÍTICA: todo campo que os dados recebidos não permitem preencher com honestidade deve voltar como string vazia (""), com a lacuna explicada em "observacao".
Nunca invente fala, texto de tela ou descrição visual que você não tenha recebido — um gancho fabricado vai contaminar o banco de ganchos do usuário.`

const INSTRUCAO_VIDEO = `${TAREFA}

Você recebeu o ARQUIVO DE VÍDEO COMPLETO: tem áudio e todos os frames. Transcreva a fala do próprio áudio e descreva o visual do que você assiste.

${REGRA_HONESTIDADE}`

const INSTRUCAO_LINK = `${TAREFA}

O QUE VOCÊ RECEBE: a legenda pública, o autor, a IMAGEM DE CAPA do vídeo e — quando o usuário colar — a transcrição da fala.
Você NÃO assistiu ao vídeo completo: não tem o áudio nem os frames além da capa.

Como usar a capa: descreva o que você realmente vê nela para "ganchoVisual" e transcreva literalmente qualquer texto sobreposto para "ganchoEscrito".
A capa é o frame de abertura na maioria dos vídeos, mas pode ser um frame escolhido — não afirme que é o primeiro segundo, descreva o que vê.
Sem transcrição colada você não tem acesso ao áudio: nesse caso "ganchoFalado" e "transcricao" devem vir vazios.

${REGRA_HONESTIDADE}`

export function modelagemConfigurada() {
  return Boolean(process.env.GEMINI_API_KEY)
}

function chaveEModelo() {
  return {
    chave: process.env.GEMINI_API_KEY,
    modelo: process.env.GEMINI_MODELO || 'gemini-3.5-flash',
  }
}

/** Chamada final ao Gemini. Compartilhada pelos dois caminhos de entrada. */
async function gerarAnalise({ instrucao, partes }) {
  const { chave, modelo } = chaveEModelo()

  const resposta = await fetch(`${GEMINI_BASE}/models/${modelo}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instrucao }] },
      contents: [{ parts: partes }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: ESQUEMA_RESPOSTA,
      },
    }),
  })

  const bruto = await resposta.json()

  if (!resposta.ok) {
    // Repassa a mensagem do Google em vez de mascarar: nome de modelo errado e
    // chave sem permissao sao os erros mais comuns, e os dois se resolvem no
    // server/.env.
    throw new Error(bruto?.error?.message || `Gemini respondeu ${resposta.status}`)
  }

  const texto = bruto?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!texto) throw new Error('Gemini não retornou conteúdo analisável.')

  try {
    return { analise: JSON.parse(texto), modelo }
  } catch {
    throw new Error('Gemini retornou um JSON inválido.')
  }
}

/* ------------------------------------------------------------------ */
/* Caminho 1 — arquivo enviado pelo usuario (completo)                */
/* ------------------------------------------------------------------ */

/**
 * Upload resumable da Files API. Video nao vai inline: o limite de request
 * inline (~20MB) nao cobre gravacao de celular.
 */
async function enviarParaFilesApi({ bytes, mimeType, nomeArquivo }) {
  const { chave } = chaveEModelo()

  const inicio = await fetch(`${GEMINI_UPLOAD}?key=${chave}`, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': String(bytes.byteLength),
      'X-Goog-Upload-Header-Content-Type': mimeType,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file: { display_name: nomeArquivo || 'video' } }),
  })

  if (!inicio.ok) {
    const erro = await inicio.json().catch(() => null)
    throw new Error(erro?.error?.message || `Falha ao iniciar upload (${inicio.status}).`)
  }

  const urlUpload = inicio.headers.get('x-goog-upload-url')
  if (!urlUpload) throw new Error('Google não devolveu a URL de upload.')

  const envio = await fetch(urlUpload, {
    method: 'POST',
    headers: {
      'Content-Length': String(bytes.byteLength),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
    },
    body: bytes,
  })

  const dados = await envio.json().catch(() => null)
  if (!envio.ok || !dados?.file) {
    throw new Error(dados?.error?.message || `Falha ao enviar o vídeo (${envio.status}).`)
  }

  return dados.file
}

/** Video entra PROCESSING; so pode ser referenciado quando vira ACTIVE. */
async function aguardarProcessamento(arquivo) {
  const { chave } = chaveEModelo()
  const limite = Date.now() + ESPERA_MAX_MS
  let atual = arquivo

  while (atual.state === 'PROCESSING') {
    if (Date.now() > limite) {
      throw new Error('O Gemini demorou demais para processar o vídeo. Tente um arquivo menor.')
    }
    await new Promise((resolver) => setTimeout(resolver, INTERVALO_POLL_MS))

    const resposta = await fetch(`${GEMINI_BASE}/${atual.name}`, {
      headers: { 'x-goog-api-key': chave },
    })
    if (!resposta.ok) throw new Error('Não foi possível consultar o processamento do vídeo.')
    atual = await resposta.json()
  }

  if (atual.state !== 'ACTIVE') {
    throw new Error(`O Gemini não conseguiu processar este vídeo (estado: ${atual.state}).`)
  }
  return atual
}

export async function analisarArquivo({ bytes, mimeType, nomeArquivo, transcricaoManual }) {
  const enviado = await enviarParaFilesApi({ bytes, mimeType, nomeArquivo })
  const pronto = await aguardarProcessamento(enviado)

  const partes = [
    {
      text: transcricaoManual?.trim()
        ? `Analise o vídeo anexado. O usuário também colou esta transcrição, use-a como apoio:\n${transcricaoManual.trim()}`
        : 'Analise o vídeo anexado.',
    },
    { fileData: { mimeType: pronto.mimeType || mimeType, fileUri: pronto.uri } },
  ]

  const { analise, modelo } = await gerarAnalise({ instrucao: INSTRUCAO_VIDEO, partes })

  return {
    origem: 'arquivo',
    nomeArquivo: nomeArquivo || 'vídeo enviado',
    videoCompleto: true,
    transcricaoManualUsada: Boolean(transcricaoManual?.trim()),
    modelo,
    ...analise,
  }
}

/* ------------------------------------------------------------------ */
/* Caminho 2 — link do TikTok (parcial: metadados + capa)             */
/* ------------------------------------------------------------------ */

async function buscarMetadados(url) {
  try {
    const resposta = await fetch(`${OEMBED_TIKTOK}?url=${encodeURIComponent(url)}`)
    if (!resposta.ok) return null
    const dados = await resposta.json()
    return {
      titulo: dados.title || '',
      autor: dados.author_name || '',
      thumbnail: dados.thumbnail_url || '',
    }
  } catch {
    // oEmbed indisponivel (video privado, removido, rede) — segue sem ele.
    return null
  }
}

async function baixarCapa(thumbnailUrl) {
  if (!thumbnailUrl) return null
  try {
    const resposta = await fetch(thumbnailUrl)
    if (!resposta.ok) return null

    const tipo = resposta.headers.get('content-type') || ''
    if (!tipo.startsWith('image/')) return null

    const bytes = await resposta.arrayBuffer()
    if (bytes.byteLength > LIMITE_CAPA_BYTES) return null

    return { mimeType: tipo.split(';')[0], data: Buffer.from(bytes).toString('base64') }
  } catch {
    return null
  }
}

function montarPromptLink({ url, metadados, transcricaoManual, temCapa }) {
  const partes = [`URL do vídeo: ${url}`]

  if (metadados?.titulo) partes.push(`Legenda/título público: ${metadados.titulo}`)
  if (metadados?.autor) partes.push(`Autor: @${metadados.autor}`)
  if (!metadados) {
    partes.push(
      'Não foi possível obter os metadados públicos deste vídeo (pode estar privado ou removido).',
    )
  }

  partes.push(
    temCapa
      ? 'A imagem de capa do vídeo está anexada — analise-a para o gancho visual e o texto na tela.'
      : 'A imagem de capa não pôde ser obtida, então você não tem nenhuma informação visual.',
  )

  partes.push(
    transcricaoManual?.trim()
      ? `Transcrição colada pelo usuário:\n${transcricaoManual.trim()}`
      : 'O usuário não forneceu transcrição. Você não tem acesso ao áudio.',
  )

  return partes.join('\n\n')
}

export async function analisarPorUrl({ url, transcricaoManual }) {
  const metadados = await buscarMetadados(url)
  const capa = await baixarCapa(metadados?.thumbnail)

  const partes = [
    { text: montarPromptLink({ url, metadados, transcricaoManual, temCapa: Boolean(capa) }) },
  ]
  if (capa) partes.push({ inlineData: capa })

  const { analise, modelo } = await gerarAnalise({ instrucao: INSTRUCAO_LINK, partes })

  return {
    origem: 'link',
    url,
    metadados,
    videoCompleto: false,
    capaAnalisada: Boolean(capa),
    transcricaoManualUsada: Boolean(transcricaoManual?.trim()),
    modelo,
    ...analise,
  }
}
