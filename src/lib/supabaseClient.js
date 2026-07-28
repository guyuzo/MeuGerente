import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Sem credenciais reais (.env nao preenchido), o app roda normalmente mas o
// login fica desabilitado com uma mensagem explicando o que falta configurar.
export const supabaseConfigurado = Boolean(url && anonKey)

export const supabase = supabaseConfigurado ? createClient(url, anonKey) : null
