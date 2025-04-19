'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
} from '@mui/material'
import { CalendarMonth, Schedule, Person, Assignment } from '@mui/icons-material'

export default function HomePage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

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

  useEffect(() => {
    const verificarAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('tipo_usuario')
          .eq('id', session.user.id)
          .single()

        setIsAdmin(profile?.tipo_usuario === 'admin')
      }
    }

    verificarAdmin()
  }, [])

  const menuItems = [
    {
      title: 'Agendamentos',
      description: 'Gerencie seus horários de reforço',
      icon: <CalendarMonth sx={{ fontSize: 40 }} />,
      path: '/agendamento',
    },
    {
      title: 'Alunos por Horário',
      description: 'Visualize os alunos agrupados por horário',
      icon: <Schedule sx={{ fontSize: 40 }} />,
      path: '/alunos-horarios',
    },
    {
      title: 'Relatório Diário',
      description: 'Registre o conteúdo visto nas aulas',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      path: '/relatorio-diario',
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
          Guia de Reforço
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => router.push('/agendamento')}
          >
            Agendar Horário
          </Button>

          {isAdmin && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push('/alunos-adm')}
            >
              Gerenciar Alunos
            </Button>
          )}
        </Box>

        <Grid container spacing={4} marginTop={2}>
          {menuItems.map((item) => (
            <Grid item xs={6} sm={6} key={item.title}>
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