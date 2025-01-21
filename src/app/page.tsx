'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
} from '@mui/material'
import { CalendarMonth, Schedule, Person } from '@mui/icons-material'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    checkSession()
  }, [router])

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Sistema de Reforço Escolar
          </Typography>
          <Button variant="outlined" onClick={handleLogout}>
            Sair
          </Button>
        </Box>

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
