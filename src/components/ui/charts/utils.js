import { useEffect, useRef, useState } from 'react'

/**
 * Largura real, em pixels, do container do grafico.
 *
 * Os graficos desenham em coordenadas de pixel em vez de um viewBox esticado
 * porque `preserveAspectRatio="none"` deformaria o texto dos eixos junto com
 * o desenho quando o card muda de largura.
 */
export function useLarguraElemento() {
  const ref = useRef(null)
  const [largura, setLargura] = useState(0)

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return undefined

    const observador = new ResizeObserver(([entrada]) => {
      setLargura(entrada.contentRect.width)
    })
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  return [ref, largura]
}

/**
 * Arredonda o topo do eixo para um numero "limpo" (10, 25, 50, 100...) para
 * os ticks nao sairem como 3,7 / 7,4 / 11,1.
 *
 * `inteiro` e para grandezas contaveis (videos, amostras): sem ele uma serie
 * que vai ate 1 recebe ticks 0 / 0,5 / 1, e "meio video" nao existe.
 */
export function escalaLimpa(maxValor, divisoes = 4, inteiro = false) {
  if (!Number.isFinite(maxValor) || maxValor <= 0) return { max: 1, passo: 1 }

  const bruto = maxValor / divisoes
  const magnitude = 10 ** Math.floor(Math.log10(bruto))
  const normalizado = bruto / magnitude
  const passoNormalizado = normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 5 ? 5 : 10
  const passo = passoNormalizado * magnitude

  if (inteiro) {
    const passoInteiro = Math.max(1, Math.round(passo))
    return { max: Math.ceil(maxValor / passoInteiro) * passoInteiro, passo: passoInteiro }
  }

  return { max: passo * divisoes, passo }
}

export function listaDeTicks(topo, passo) {
  const ticks = []
  for (let valor = 0; valor <= topo + 1e-9; valor += passo) ticks.push(valor)
  return ticks
}

/**
 * Barra com topo arredondado e base reta (spec de marca: a ponta que carrega
 * o dado e arredondada, a que encosta na linha de base fica quadrada).
 */
export function caminhoBarra(x, y, largura, altura, raio = 4) {
  const r = Math.max(0, Math.min(raio, largura / 2, altura))
  const base = y + altura
  return [
    `M${x} ${base}`,
    `L${x} ${y + r}`,
    `Q${x} ${y} ${x + r} ${y}`,
    `L${x + largura - r} ${y}`,
    `Q${x + largura} ${y} ${x + largura} ${y + r}`,
    `L${x + largura} ${base}`,
    'Z',
  ].join(' ')
}

export const ESPESSURA_MAX_BARRA = 24
