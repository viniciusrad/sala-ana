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
} from '@mui/material'
import { Person } from '@mui/icons-material'

interface FormData {
  nome: string
  data_nascimento: string
  genero: string
  telefone: string
  aluno_id: string
  data_pagamento: string
  data_registro: string
}

export default function CadastroResponsavel() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [alunos, setAlunos] = useState<Array<{ id: string; nome: string }>>([])
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    data_nascimento: '',
    genero: '',
    telefone: '',
    aluno_id: '',
    data_pagamento: '',
    data_registro: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    const carregarAlunos = async () => {
      try {
        const { data, error } = await supabase
          .from('alunos')
          .select('id, nome')
          .order('nome')

        if (error) throw error

        setAlunos(data || [])
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Erro ao carregar lista de alunos')
        }
      } finally {
        setLoading(false)
      }
    }

    carregarAlunos()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: insertError } = await supabase
        .from('responsaveis')
        .insert([formData])

      if (insertError) throw insertError

      setSuccess('Responsável cadastrado com sucesso!')
      setFormData({
        nome: '',
        data_nascimento: '',
        genero: '',
        telefone: '',
        aluno_id: '',
        data_pagamento: '',
        data_registro: new Date().toISOString().split('T')[0],
      })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao cadastrar responsável')
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
            <Person sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" gutterBottom>
              Cadastro de Responsável
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
                  label="Nome do Responsável"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Data de Nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Gênero</InputLabel>
                  <Select
                    value={formData.genero}
                    label="Gênero"
                    onChange={(e) => setFormData(prev => ({ ...prev, genero: e.target.value }))}
                  >
                    <MenuItem value="masculino">Masculino</MenuItem>
                    <MenuItem value="feminino">Feminino</MenuItem>
                    <MenuItem value="outro">Outro</MenuItem>
                  </Select>
                </FormControl>
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
                  <InputLabel>Aluno</InputLabel>
                  <Select
                    value={formData.aluno_id}
                    label="Aluno"
                    onChange={(e) => setFormData(prev => ({ ...prev, aluno_id: e.target.value }))}
                  >
                    {alunos.map((aluno) => (
                      <MenuItem key={aluno.id} value={aluno.id}>
                        {aluno.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Data do Pagamento"
                  type="date"
                  value={formData.data_pagamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_pagamento: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data de Registro"
                  type="date"
                  value={formData.data_registro}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_registro: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
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
