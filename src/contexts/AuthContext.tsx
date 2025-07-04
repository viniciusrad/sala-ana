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
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, tipo_usuario, quantidade_horas')
            .eq('id', session.user.id)
            .single()

          let profile = profileData

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError
          }

          if (!profile) {
            const { data: newProfile, error: upsertError } = await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                email: session.user.email,
                tipo_usuario: 'aluno',
                updated_at: new Date().toISOString(),
              }, { onConflict: 'id' })
              .select()
              .single()

            if (upsertError) throw upsertError
            profile = newProfile
          }

          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              tipo_usuario: profile.tipo_usuario,
              quantidade_horas: profile.quantidade_horas,
            })
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
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