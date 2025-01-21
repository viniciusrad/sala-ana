'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Avatar,
  Chip,
  Skeleton,
} from '@mui/material'
import { CalendarMonth, Schedule, Person } from '@mui/icons-material'

interface UserProfile {
  nome_completo?: string
  tipo_usuario?: 'aluno' | 'professor' | 'admin'
  email?: string
}

export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Erro ao verificar sessão:', sessionError)
          return
        }

        if (!session?.user) {
          return
        }

        // Buscar perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('nome_completo, tipo_usuario, email')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Erro ao carregar perfil:', profileError)
          return
        }

        setProfile(profileData || { email: session.user.email })
      } catch (err) {
        console.error('Erro ao carregar perfil:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

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
      case 'aluno': return 'Aluno'
      case 'professor': return 'Professor'
      case 'admin': return 'Administrador'
      default: return 'Usuário'
    }
  }

  const menuItems = [
    {
      title: 'Agendamentos',
      description: 'Gerencie seus horários de reforço',
      icon: <CalendarMonth sx={{ fontSize: 40 }} />,
      path: '/agendamento'
    },
    {
      title: 'Horários',
      description: 'Visualize a grade de horários',
      icon: <Schedule sx={{ fontSize: 40 }} />,
      path: '/horarios'
    },
    {
      title: 'Perfil',
      description: 'Gerencie suas informações',
      icon: <Person sx={{ fontSize: 40 }} />,
      path: '/perfil'
    }
  ]

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                <Person sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                {loading ? (
                  <>
                    <Skeleton width={200} height={32} />
                    <Skeleton width={150} height={24} />
                  </>
                ) : (
                  <>
                    <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                      {profile?.nome_completo || 'Bem-vindo'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" color="text.secondary">
                        {profile?.email}
                      </Typography>
                      <Chip
                        label={getTipoUsuarioLabel(profile?.tipo_usuario)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </>
                )}
              </Box>
            </Box>
            <Button variant="outlined" onClick={handleLogout}>
              Sair
            </Button>
          </Box>
        </Paper>

        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Sistema de Reforço Escolar
        </Typography>

        <Grid container spacing={4}>
          {menuItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.title}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => router.push(item.path)}
              >
                {item.icon}
                <Typography variant="h6" component="h2" sx={{ mt: 2 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {item.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  )
}
