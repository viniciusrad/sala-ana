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
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
} from '@mui/material'
import { Person } from '@mui/icons-material'

interface FormData {
  nome: string
  telefone: string
  periodo: 'manha' | 'tarde' | 'ambos'
  materias: string
  data_registro: string
}

const periodos = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'ambos', label: 'Manhã e Tarde' }
]

const materiasDisponiveis = [
  'Matemática',
  'Português',
  'Ciências',
  'História',
  'Geografia',
  'Inglês',
  'Física',
  'Química',
  'Biologia'
]

export default function CadastroProfessor() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    telefone: '',
    periodo: 'manha',
    materias: '',
    data_registro: new Date().toISOString(),
  })

  useEffect(() => {
    // Simulando um carregamento inicial
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: insertError } = await supabase
        .from('professor')
        .insert([formData])

      if (insertError) throw insertError

      setSuccess('Professor cadastrado com sucesso!')
      setFormData({
        nome: '',
        telefone: '',
        periodo: 'manha',
        materias: '',
        data_registro: new Date().toISOString(),
      })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao cadastrar professor')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleMateriaChange = (materia: string) => {
    setFormData(prev => {
      const materiasAtuais = prev.materias.split(';').filter(Boolean)
      const novaMateria = materiasAtuais.includes(materia)
        ? materiasAtuais.filter(m => m !== materia)
        : [...materiasAtuais, materia]
      return { ...prev, materias: novaMateria.join(';') }
    })
  }

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Carregando...
        </Typography>
      </Box>
    )
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Person sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" gutterBottom>
              Cadastro de Professor
            </Typography>
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

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Nome do Professor"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={formData.periodo}
                    label="Período"
                    onChange={(e) => setFormData(prev => ({ ...prev, periodo: e.target.value as 'manha' | 'tarde' | 'ambos' }))}
                  >
                    {periodos.map((periodo) => (
                      <MenuItem key={periodo.value} value={periodo.value}>
                        {periodo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Matérias
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {materiasDisponiveis.map((materia) => {
                    const isSelected = formData.materias.split(';').includes(materia)
                    return (
                      <Chip
                        key={materia}
                        label={materia}
                        onClick={() => handleMateriaChange(materia)}
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        sx={{ m: 0.5 }}
                      />
                    )
                  })}
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                type="submit"
                disabled={saving}
                sx={{ minWidth: 120 }}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/alunos-adm')}
                sx={{ minWidth: 120 }}
              >
                Voltar
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
