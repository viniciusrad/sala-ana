'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material'

interface AlunoRelatorio {
  id: string
  nome: string | null
  quantidade: number
}

export default function RelatoriosAlunosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [alunos, setAlunos] = useState<AlunoRelatorio[]>([])

  useEffect(() => {
    const carregar = async () => {
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

      const { data: alunosData } = await supabase
        .from('profiles')
        .select('id, nome_completo')
        .eq('tipo_usuario', 'aluno')
        .order('nome_completo')

      const list: AlunoRelatorio[] = []
      if (alunosData) {
        for (const aluno of alunosData) {
          const { count } = await supabase
            .from('relatorios')
            .select('*', { count: 'exact', head: true })
            .eq('id_aluno', aluno.id)
          list.push({ id: aluno.id, nome: aluno.nome_completo, quantidade: count || 0 })
        }
      }

      setAlunos(list)
      setLoading(false)
    }

    carregar()
  }, [router])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Relatórios por Aluno
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Aluno</TableCell>
              <TableCell align='right'>Qtd. de Relatórios</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alunos.map(aluno => (
              <TableRow key={aluno.id}>
                <TableCell>{aluno.nome}</TableCell>
                <TableCell align='right'>{aluno.quantidade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}
