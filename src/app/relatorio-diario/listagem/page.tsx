'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Chip
} from '@mui/material'
import { Assignment, ArrowBack } from '@mui/icons-material'

interface Relatorio {
  id: number
  data_relatorio: string
  conteudo: string
  dia_semana: string
  created_at: string
}

export default function ListagemRelatoriosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])

  useEffect(() => {
    const carregarRelatorios = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from('relatorios')
          .select('*')
          .eq('id_aluno', session.user.id)
          .order('data_relatorio', { ascending: false })

        if (error) throw error

        setRelatorios(data || [])
      } catch (err) {
        console.error('Erro ao carregar relatórios:', err)
        setError('Não foi possível carregar os relatórios')
      } finally {
        setLoading(false)
      }
    }

    carregarRelatorios()
  }, [router])

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/relatorio-diario')}
          variant="outlined"
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Meus Relatórios
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {relatorios.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Assignment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum relatório encontrado
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/relatorio-diario')}
            sx={{ mt: 2 }}
          >
            Criar Novo Relatório
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data do Relatório</TableCell>
                <TableCell>Dia da Semana</TableCell>
                <TableCell>Conteúdo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {relatorios.map((relatorio) => (
                <TableRow key={relatorio.id}>
                  <TableCell>
                    {formatarData(relatorio.data_relatorio)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={relatorio.dia_semana} 
                      color="primary" 
                      variant="outlined" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                    {relatorio.conteudo}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  )
}
