'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface Usuario {
  id: string
  email: string
  tipo_usuario: 'admin' | 'aluno' | 'professor'
  quantidade_horas?: number
}

interface AuthContextType {
  user: Usuario | null
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, email, tipo_usuario, quantidade_horas')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              tipo_usuario: profile.tipo_usuario,
              quantidade_horas: profile.quantidade_horas
            })
          }
        }
      } catch (error) {
        setError('Erro ao carregar usuário')
      } finally {
        setLoading(false)
      }
    }

    carregarUsuario()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 