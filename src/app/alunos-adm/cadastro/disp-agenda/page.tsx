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
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material'

interface FormData {
  horario_inicio: string
  horario_fim: string
  dias_semana: number[]
  max_alunos: number
  status: 'ativo' | 'inativo'
}

const diasSemana = ['Domingo', 'Segunda', 'Ter\xE7a', 'Quarta', 'Quinta', 'Sexta', 'S\xE1bado']

export default function CadastroDispAgenda() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    horario_inicio: '',
    horario_fim: '',
    dias_semana: [],
    max_alunos: 1,
    status: 'ativo',
  })

  useEffect(() => {
    const verificarAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('tipo_usuario')
        .eq('id', session.user.id)
        .single()
      if (!profile || profile.tipo_usuario !== 'admin') {
        router.push('/')
        return
      }
      setLoading(false)
    }

    verificarAdmin()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { dias_semana, ...baseData } = formData
      if (dias_semana.length === 0) {
        throw new Error('Selecione ao menos um dia da semana')
      }
      const registros = dias_semana.map((dia) => ({ ...baseData, dia_semana: dia }))

      const { error: insertError } = await supabase
        .from('disp_agenda')
        .insert(registros)

      if (insertError) throw insertError

      setSuccess('Hor\xE1rio cadastrado com sucesso!')
      setFormData({
        horario_inicio: '',
        horario_fim: '',
        dias_semana: [],
        max_alunos: 1,
        status: 'ativo',
      })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao cadastrar hor\xE1rio')
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
            <Typography variant="h4" gutterBottom>
              Cadastro de Hor\xE1rio Dispon\xEDvel
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Hor\xE1rio In\xEDcio"
                  type="time"
                  value={formData.horario_inicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, horario_inicio: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Hor\xE1rio Fim"
                  type="time"
                  value={formData.horario_fim}
                  onChange={(e) => setFormData(prev => ({ ...prev, horario_fim: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Dias da Semana
                </Typography>
                <FormGroup row>
                  {diasSemana.map((dia, index) => (
                    <FormControlLabel
                      key={dia}
                      control={
                        <Checkbox
                          checked={formData.dias_semana.includes(index)}
                          onChange={() => {
                            setFormData((prev) => {
                              const dias = prev.dias_semana.includes(index)
                                ? prev.dias_semana.filter((d) => d !== index)
                                : [...prev.dias_semana, index]
                              return { ...prev, dias_semana: dias }
                            })
                          }}
                        />
                      }
                      label={dia}
                    />
                  ))}
                </FormGroup>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="M\xE1x. de Alunos"
                  type="number"
                  value={formData.max_alunos}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_alunos: Number(e.target.value) }))}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'ativo' | 'inativo' }))}
                  >
                    <MenuItem value="ativo">Ativo</MenuItem>
                    <MenuItem value="inativo">Inativo</MenuItem>
                  </Select>
                </FormControl>
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
