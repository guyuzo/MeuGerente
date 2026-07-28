import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseConfigurado } from '../../../lib/supabaseClient'

const AuthContext = createContext(null)

// Sessao do Supabase Auth. Nome do usuario fica em user_metadata.nome
// (definido no cadastro) e alimenta a saudacao personalizada do Dashboard.
export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null)
  const [carregando, setCarregando] = useState(supabaseConfigurado)
  const [bypassDev, setBypassDev] = useState(
    () => sessionStorage.getItem('meu-gerente:bypass-dev') === '1',
  )

  function continuarSemLogin() {
    sessionStorage.setItem('meu-gerente:bypass-dev', '1')
    setBypassDev(true)
  }

  useEffect(() => {
    if (!supabaseConfigurado) return

    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      setCarregando(false)
    })

    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao)
    })

    return () => assinatura.subscription.unsubscribe()
  }, [])

  async function entrar({ email, senha }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw error
  }

  async function cadastrar({ nome, email, senha }) {
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    })
    if (error) throw error
  }

  async function sair() {
    if (supabaseConfigurado) await supabase.auth.signOut()
    sessionStorage.removeItem('meu-gerente:bypass-dev')
    setBypassDev(false)
  }

  const usuario = sessao?.user ?? null
  const nome = usuario?.user_metadata?.nome || usuario?.email?.split('@')[0] || ''
  const autenticado = Boolean(usuario) || bypassDev

  return (
    <AuthContext.Provider
      value={{
        configurado: supabaseConfigurado,
        sessao,
        usuario,
        nome,
        autenticado,
        carregando,
        entrar,
        cadastrar,
        sair,
        continuarSemLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
