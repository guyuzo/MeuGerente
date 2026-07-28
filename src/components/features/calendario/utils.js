import { STATUS, STATUS_SEQUENCE } from './constants'

export function todayISO() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

// "Atrasado" e derivado, nao um status gravado: um item so fica atrasado
// se a data prevista ja passou e ele ainda nao foi publicado.
export function isAtrasado(item, hojeISO) {
  return item.status !== STATUS.PUBLICADO && item.data < hojeISO
}

export function nextStatus(status) {
  const idx = STATUS_SEQUENCE.indexOf(status)
  if (idx === -1 || idx === STATUS_SEQUENCE.length - 1) return status
  return STATUS_SEQUENCE[idx + 1]
}

const MESES_LONGO = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

export function formatarDataCurta(iso) {
  const [, mes, dia] = iso.split('-')
  return `${dia}/${mes}`
}

export function formatarDataLonga(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return `${dia} de ${MESES_LONGO[mes - 1]} de ${ano}`
}

function paraDate(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

function paraISO(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function adicionarDias(iso, delta) {
  const data = paraDate(iso)
  data.setDate(data.getDate() + delta)
  return paraISO(data)
}

// Domingo da semana que contem a data (convencao Dom-Sab, igual a grade
// mensal ja usa em CalendarioMensal).
export function inicioDaSemana(iso) {
  const data = paraDate(iso)
  data.setDate(data.getDate() - data.getDay())
  return paraISO(data)
}

export function formatarDiaCurto(iso) {
  const [DIAS] = [['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']]
  const data = paraDate(iso)
  return { diaSemana: DIAS[data.getDay()], dia: data.getDate() }
}

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function formatarIntervalo(isoInicio, isoFim) {
  const inicio = paraDate(isoInicio)
  const fim = paraDate(isoFim)
  const mesmoMes = inicio.getMonth() === fim.getMonth() && inicio.getFullYear() === fim.getFullYear()
  if (mesmoMes) {
    return `${inicio.getDate()}–${fim.getDate()} de ${MESES_ABREV[fim.getMonth()]} de ${fim.getFullYear()}`
  }
  return `${inicio.getDate()} de ${MESES_ABREV[inicio.getMonth()]} – ${fim.getDate()} de ${MESES_ABREV[fim.getMonth()]} de ${fim.getFullYear()}`
}
