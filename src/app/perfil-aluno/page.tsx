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
  FormGroup,
  FormControlLabel,
} from '@mui/material'
import { Person } from '@mui/icons-material'

interface FormData {
  nome: string
  data_nascimento: string
  genero: string
  telefone: string
  responsavel_id: string | null
  endereco: string
  escola: string
  serie: string
  materia_preferencial: string
  data_cadastro: string
  dias_preferenciais: string[]
}

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const series = ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano']
const materias = ['Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Inglês']

export default function PerfilAluno() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [responsaveis, setResponsaveis] = useState<Array<{ id: string; nome: string }>>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    data_nascimento: '',
    genero: '',
    telefone: '',
    responsavel_id: '',
    endereco: '',
    escola: '',
    serie: '',
    materia_preferencial: '',
    data_cadastro: new Date().toISOString().split('T')[0],
    dias_preferenciais: [],
  })

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      try {
        const { data, error } = await supabase
          .from('responsavel')
          .select('id, nome')
          .order('nome')

        if (error) throw error

        setResponsaveis(data || [])

        setUserId(session.user.id)

        const { data: alunoData, error: alunoError } = await supabase
          .from('aluno')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (alunoError && alunoError.code !== 'PGRST116') {
          throw alunoError
        }

        if (alunoData) {
          setFormData({
            nome: alunoData.nome || '',
            data_nascimento: alunoData.data_nascimento
              ? new Date(alunoData.data_nascimento).toISOString().split('T')[0]
              : '',
            genero: alunoData.genero || '',
            telefone: alunoData.telefone || '',
            responsavel_id: alunoData.responsavel_id || '',
            endereco: alunoData.endereco || '',
            escola: alunoData.escola || '',
            serie: alunoData.serie || '',
            materia_preferencial: alunoData.materia_preferencial || '',
            data_cadastro: alunoData.data_cadastro
              ? new Date(alunoData.data_cadastro).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            dias_preferenciais: alunoData.dias_preferenciais
              ? Array.isArray(alunoData.dias_preferenciais)
                ? alunoData.dias_preferenciais
                : String(alunoData.dias_preferenciais)
                    .split(',')
                    .map((d: string) => d.trim())
              : [],
          })
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Erro ao carregar lista de responsáveis')
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user && !userId) {
        throw new Error('Usuário não autenticado')
      }

      const id = userId || session!.user.id

      const dataToUpsert = {
        id,
        ...formData,
        responsavel_id: formData.responsavel_id || null,
      }

      const { error: upsertError } = await supabase
        .from('aluno')
        .upsert(dataToUpsert, { onConflict: 'id' })

      if (upsertError) throw upsertError

      setSuccess('Dados salvos com sucesso!')
      router.push('/')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao salvar dados')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDiaPreferencialChange = (dia: string) => {
    setFormData(prev => {
      const dias = prev.dias_preferenciais.includes(dia)
        ? prev.dias_preferenciais.filter(d => d !== dia)
        : [...prev.dias_preferenciais, dia]
      return { ...prev, dias_preferenciais: dias }
    })
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
              Meu Perfil de Aluno
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
                  label="Nome"
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
                <FormControl fullWidth>
                  <InputLabel>Responsável</InputLabel>
                  <Select
                    value={formData.responsavel_id ?? ''}
                    label="Responsável"
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, responsavel_id: e.target.value as string }))
                    }
                  >
                    <MenuItem value="">
                      <em>Nenhum</em>
                    </MenuItem>
                    {responsaveis.map((responsavel) => (
                      <MenuItem key={responsavel.id} value={responsavel.id}>
                        {responsavel.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Endereço"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Escola"
                  value={formData.escola}
                  onChange={(e) => setFormData(prev => ({ ...prev, escola: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Série</InputLabel>
                  <Select
                    value={formData.serie}
                    label="Série"
                    onChange={(e) => setFormData(prev => ({ ...prev, serie: e.target.value }))}
                  >
                    {series.map((serie) => (
                      <MenuItem key={serie} value={serie}>
                        {serie}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Matéria Preferencial</InputLabel>
                  <Select
                    value={formData.materia_preferencial}
                    label="Matéria Preferencial"
                    onChange={(e) => setFormData(prev => ({ ...prev, materia_preferencial: e.target.value }))}
                  >
                    {materias.map((materia) => (
                      <MenuItem key={materia} value={materia}>
                        {materia}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data de Cadastro"
                  type="date"
                  value={formData.data_cadastro}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_cadastro: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Dias Preferenciais
                </Typography>
                <FormGroup row>
                  {diasSemana.map((dia) => (
                    <FormControlLabel
                      key={dia}
                      control={
                        <Checkbox
                          checked={formData.dias_preferenciais.includes(dia)}
                          onChange={() => handleDiaPreferencialChange(dia)}
                        />
                      }
                      label={dia}
                    />
                  ))}
                </FormGroup>
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
                onClick={() => router.push('/')}
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
