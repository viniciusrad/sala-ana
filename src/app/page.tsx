'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,

} from '@mui/material'
import { CalendarMonth, Schedule, Person } from '@mui/icons-material'


export default function HomePage() {
  const router = useRouter()

  // Verificar se existe sessão
  useEffect(() => {
    const verificarSessao = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
      }
    }

    verificarSessao()
  }, [])

  // const [profile, setProfile] = useState<UserProfile | null>(null)
  // const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Erro ao verificar sessão:', sessionError)
          return
        }

        if (!session?.user) {
          return
        }

        // Buscar perfil do usuário
        // const { data: profileData, error: profileError } = await supabase
        //   .from('profiles')
        //   .select('nome_completo, tipo_usuario, email')
        //   .eq('id', session.user.id)
        //   .single()

        // if (profileError && profileError.code !== 'PGRST116') {
        //   console.error('Erro ao carregar perfil:', profileError)
        //   return
        // }

        // setProfile(profileData || { email: session.user.email })
      } catch (err) {
        console.error('Erro ao carregar perfil:', err)
      } finally {
        // setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  // const handleLogout = async () => {
  //   try {
  //     await supabase.auth.signOut()
  //     router.push('/login')
  //     router.refresh()
  //   } catch (error) {
  //     console.error('Erro ao fazer logout:', error)
  //   }
  // }

  // const getTipoUsuarioLabel = (tipo?: string) => {
  //   switch (tipo) {
  //     case 'aluno':
  //       return 'Aluno'
  //     case 'professor':
  //       return 'Professor'
  //     case 'admin':
  //       return 'Administrador'
  //     default:
  //       return 'Usuário'
  //   }
  // }

  const menuItems = [
    {
      title: 'Agendamentos',
      description: 'Gerencie seus horários de reforço',
      icon: <CalendarMonth sx={{ fontSize: 40 }} />,
      path: '/agendamento',
    },
    {
      title: 'Horários',
      description: 'Visualize a grade de horários',
      icon: <Schedule sx={{ fontSize: 40 }} />,
      path: '/horarios',
    },
    {
      title: 'Perfil',
      description: 'Gerencie suas informações',
      icon: <Person sx={{ fontSize: 40 }} />,
      path: '/perfil',
    },
  ]

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mt: 4, mb: 8 }}>

        <Typography variant='h4' component='h1' gutterBottom sx={{ mb: 4 }}>
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
                <Typography variant='h6' component='h2' sx={{ mt: 2 }}>
                  {item.title}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 1 }}
                >
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