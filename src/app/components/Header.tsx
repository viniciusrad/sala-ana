'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Container,
  Chip
} from '@mui/material'
import { Person } from '@mui/icons-material'

interface UserProfile {
  nome_completo?: string
  tipo_usuario?: 'aluno' | 'professor' | 'admin'
  email?: string
}

export default function Header() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const carregarPerfil = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('nome_completo, tipo_usuario, email')
          .eq('id', session.user.id)
          .single()

        setProfile(profileData || { email: session.user.email })
      }
    }

    carregarPerfil()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const getTipoUsuarioLabel = (tipo?: string) => {
    switch (tipo) {
      case 'aluno':
        return 'Aluno'
      case 'professor':
        return 'Professor'
      case 'admin':
        return 'Administrador'
      default:
        return 'Usuário'
    }
  }

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>

          {profile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, padding: ".5rem" }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="body2">
                    {profile.nome_completo || profile.email}
                  </Typography>
                  <Chip
                    label={getTipoUsuarioLabel(profile.tipo_usuario)}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 20 }}
                  />
                </Box>
              </Box>
              <Button 
              variant="text" 
              onClick={() => router.push('/')} 
              sx={{ color: 'primary.main' }}
            >
              Início
            </Button>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleLogout}
              >
                Sair
              </Button>
            </Box>
          ) : (
            <Button 
              color="inherit" 
              onClick={() => router.push('/login')}
            >
              Entrar
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}
