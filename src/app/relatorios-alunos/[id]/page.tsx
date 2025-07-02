'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  Chip,
  Dialog,
  DialogContent
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { parseImageUrls } from '@/lib/utils'
import ImageCarousel from '@/components/ImageCarousel'

interface Relatorio {
  id: number
  data_relatorio: string
  conteudo: string
  dia_semana: string
  img_url?: string | null
  img_urls?: string[]
}

export default function RelatoriosAlunoDetalhe() {
  const router = useRouter()
  const params = useParams()
  const alunoId = params.id as string | undefined

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alunoNome, setAlunoNome] = useState<string>('')
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [fotosSelecionadas, setFotosSelecionadas] = useState<string[]>([])

  useEffect(() => {
    const carregar = async () => {
      try {
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

        if (profile?.tipo_usuario !== 'admin') {
          router.push('/')
          return
        }

        if (!alunoId) {
          setError('Aluno não encontrado')
          return
        }

        const { data: aluno } = await supabase
          .from('profiles')
          .select('nome_completo')
          .eq('id', alunoId)
          .single()

        setAlunoNome(aluno?.nome_completo || '')

        const { data, error } = await supabase
          .from('relatorios')
          .select('id, data_relatorio, conteudo, dia_semana, img_url, img_urls')
          .eq('id_aluno', alunoId)
          .order('data_relatorio', { ascending: false })

        if (error) throw error

        const parsed = (data || []).map((r) => {
          let urls = parseImageUrls(r.img_urls)
          if (urls.length === 0) {
            urls = parseImageUrls(r.img_url)
          }
          return { ...r, img_urls: urls }
        })
        setRelatorios(parsed)
      } catch (err) {
        console.error('Erro ao carregar relatórios:', err)
        setError('Não foi possível carregar os relatórios')
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [router, alunoId])

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
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/relatorios-alunos')} variant='outlined'>
          Voltar
        </Button>
        <Typography variant='h4' component='h1'>
          Relatórios de {alunoNome}
        </Typography>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {relatorios.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant='h6' color='text.secondary'>Nenhum relatório encontrado</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data do Relatório</TableCell>
                <TableCell>Dia da Semana</TableCell>
                <TableCell>Conteúdo</TableCell>
                <TableCell>Foto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {relatorios.map((relatorio) => (
                <TableRow
                  key={relatorio.id}
                  hover
                  sx={{
                    cursor:
                      relatorio.img_urls && relatorio.img_urls.length > 0
                        ? 'pointer'
                        : relatorio.img_url
                        ? 'pointer'
                        : 'default',
                  }}
                  onClick={() => {
                    if (relatorio.img_urls && relatorio.img_urls.length > 0) {
                      setFotosSelecionadas(relatorio.img_urls)
                    } else if (relatorio.img_url) {
                      setFotosSelecionadas([relatorio.img_url])
                    } else {
                      setFotosSelecionadas([])
                    }
                  }}
                >
                  <TableCell>{formatarData(relatorio.data_relatorio)}</TableCell>
                  <TableCell>
                    <Chip label={relatorio.dia_semana} color='primary' variant='outlined' size='small' />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{relatorio.conteudo}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {relatorio.img_urls && relatorio.img_urls.length > 0 ? (
                        relatorio.img_urls.map((url, idx) => (
                          <Box
                            key={idx}
                            component='img'
                            src={url}
                            alt={`Miniatura ${idx + 1}`}
                            sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                          />
                        ))
                      ) : (
                        relatorio.img_url && (
                          <Box
                            component='img'
                            src={relatorio.img_url}
                            alt='Miniatura do relatório'
                            sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                          />
                        )
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={fotosSelecionadas.length > 0} onClose={() => setFotosSelecionadas([])} maxWidth='lg'>
        <DialogContent>
          {fotosSelecionadas.length > 0 && (
            <ImageCarousel urls={fotosSelecionadas} height={600} />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  )
}

