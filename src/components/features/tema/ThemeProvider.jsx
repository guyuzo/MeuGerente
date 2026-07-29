import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'meu-gerente:tema'

// Dark e o tema padrao do produto (designsystem.md 3.1 — "tema de referencia
// primario"), nao um espelho da preferencia do sistema: quem abre o app pela
// primeira vez ve o visual que o produto foi desenhado para ter. A partir da
// primeira troca manual, a escolha do usuario vence e persiste.
function temaInicial() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY)
    if (salvo === 'light' || salvo === 'dark') return salvo
  } catch {
    /* localStorage indisponivel — cai no padrao abaixo */
  }
  return 'dark'
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(temaInicial)

  useEffect(() => {
    // O dark nao usa atributo (e o :root padrao do CSS); so o light carimba
    // data-theme, entao a folha de estilo continua com dark como default.
    if (tema === 'light') document.documentElement.setAttribute('data-theme', 'light')
    else document.documentElement.removeAttribute('data-theme')

    try {
      localStorage.setItem(STORAGE_KEY, tema)
    } catch {
      /* sem persistencia — o tema ainda vale para esta sessao */
    }
  }, [tema])

  function alternarTema() {
    setTema((atual) => (atual === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>{children}</ThemeContext.Provider>
  )
}

export function useTema() {
  return useContext(ThemeContext)
}
