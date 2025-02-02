'use client'

import { useEffect, useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Container
} from '@mui/material'
import { AccessTime, Email } from '@mui/icons-material'
import { supabase } from '@/lib/supabase'

interface Cliente {
  id: string
  email: string
  tipo_usuario: string
  updated_at: string
  quantidade_horas: number
}

export default function ListaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        // Primeiro verifica se o usuário atual é admin
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          window.location.href = '/login'
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('tipo_usuario')
          .eq('id', session.user.id)
          .single()

        if (!profile || profile.tipo_usuario !== 'admin') {
          window.location.href = '/'
          return
        }

        // Carrega a lista de clientes
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, tipo_usuario, updated_at, quantidade_horas')
          .eq('tipo_usuario', 'aluno')
          .order('updated_at', { ascending: false })

        if (error) throw error

        setClientes(data || [])
      } catch (err) {
        console.error('Erro:', err)
        setError('Falha ao carregar a lista de clientes')
      } finally {
        setLoading(false)
      }
    }

    carregarClientes()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ m: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Lista de Alunos
        </Typography>

        <Grid container spacing={2}>
          {clientes.map((cliente) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={cliente.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cliente.email}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime sx={{ fontSize: 20, mr: 1, color: 'secondary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      {cliente.quantidade_horas || 0}h disponíveis
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Última atualização:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(cliente.updated_at).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    <Chip 
                      label="Segunda" 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <Chip 
                      label="Quarta" 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <Chip 
                      label="Sexta" 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {clientes.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">
                Nenhum aluno cadastrado
              </Alert>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  )
} 