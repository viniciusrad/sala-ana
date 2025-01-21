'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { Person } from '@mui/icons-material'

type TipoUsuario = 'aluno' | 'professor' | 'admin'

interface UserProfile {
  id: string
  nome_completo?: string
  telefone?: string
  tipo_usuario?: TipoUsuario
  nome_responsavel?: string
  telefone_responsavel?: string
  email?: string
}

interface FormData {
  nome_completo: string
  telefone: string
  tipo_usuario: TipoUsuario
  nome_responsavel: string
  telefone_responsavel: string
}

export default function PerfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<FormData>({
    nome_completo: '',
    telefone: '',
    tipo_usuario: 'aluno',
    nome_responsavel: '',
    telefone_responsavel: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError
        if (!session) {
          router.push('/login')
          return
        }

        // Buscar perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        const userProfile = profileData || {
          id: session.user.id,
          email: session.user.email,
        }

        setProfile(userProfile)
        setFormData({
          nome_completo: userProfile.nome_completo || '',
          telefone: userProfile.telefone || '',
          tipo_usuario: (userProfile.tipo_usuario as TipoUsuario) || 'aluno',
          nome_responsavel: userProfile.nome_responsavel || '',
          telefone_responsavel: userProfile.telefone_responsavel || '',
        })
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Erro ao carregar perfil')
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleSave = async () => {
    if (!profile?.id) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          ...formData,
          updated_at: new Date().toISOString(),
        })

      if (upsertError) throw upsertError

      setSuccess('Perfil atualizado com sucesso!')
      setProfile(prev => {
        if (!prev) return null
        return {
          ...prev,
          ...formData,
        }
      })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao atualizar perfil')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}>
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                Meu Perfil
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {profile?.email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={formData.nome_completo}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Usuário</InputLabel>
                <Select
                  value={formData.tipo_usuario}
                  label="Tipo de Usuário"
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tipo_usuario: e.target.value as TipoUsuario
                  }))}
                >
                  <MenuItem value="aluno">Aluno</MenuItem>
                  <MenuItem value="professor">Professor</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Informações do Responsável
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Responsável"
                value={formData.nome_responsavel}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_responsavel: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone do Responsável"
                value={formData.telefone_responsavel}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone_responsavel: e.target.value }))}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{ minWidth: 120 }}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push('/')}
              sx={{ minWidth: 120 }}
            >
              Voltar
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
} 