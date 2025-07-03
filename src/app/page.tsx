'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
} from '@mui/material'
import { CalendarMonth, Schedule, Person, Assignment } from '@mui/icons-material'
import ImageCarousel from '@/components/ImageCarousel'
import { parseImageUrls } from '@/lib/utils'

interface Relatorio {
  id: number
  data_relatorio: string
  conteudo: string
  dia_semana: string
  img_url?: string | null
  img_urls?: string[]
}

export default function HomePage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [tipoUsuario, setTipoUsuario] = useState<'aluno' | 'admin' | 'professor' | null>(null)
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])

  // Verificar se existe sessão
  useEffect(() => {
    const verificarSessao = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
      }
    }

    verificarSessao()
  }, [])

  useEffect(() => {
    const carregarDados = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('tipo_usuario')
        .eq('id', session.user.id)
        .single()

      const tipo = profile?.tipo_usuario as 'aluno' | 'admin' | 'professor' | null
      setIsAdmin(tipo === 'admin')
      setTipoUsuario(tipo)

      if (tipo === 'aluno') {
        const { data } = await supabase
          .from('relatorios')
          .select('id, data_relatorio, conteudo, dia_semana, img_url, img_urls')
          .eq('id_aluno', session.user.id)
          .order('data_relatorio', { ascending: false })
          .limit(3)

        const parsed = (data || []).map((r) => {
          let urls = parseImageUrls(r.img_urls)
          if (urls.length === 0) {
            urls = parseImageUrls(r.img_url)
          }
          return { ...r, img_urls: urls }
        })
        setRelatorios(parsed)
      }
    }

    carregarDados()
  }, [])

  const menuItems = [
    {
      title: 'Agendamentos',
      description: 'Gerencie seus horários de reforço',
      icon: <CalendarMonth sx={{ fontSize: 40 }} />,
      path: '/agendamento',
    },
    {
      title: 'Alunos por Horário',
      description: 'Visualize os alunos agrupados por horário',
      icon: <Schedule sx={{ fontSize: 40 }} />,
      path: '/alunos-horarios',
      admin: true,
    },
    {
      title: 'Relatório Diário',
      description: 'Registre o conteúdo visto nas aulas',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      path: '/relatorio-diario',
    },
    {
      title: 'Meus Relatórios',
      description: 'Visualize todos os relatórios enviados',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      path: '/meus-relatorios',
      aluno: true,
    },
    {
      title: 'Relatórios por Aluno',
      description: 'Veja quantos relatórios cada aluno possui',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      path: '/relatorios-alunos',
      admin: true,
    },
    {
      title: 'Perfil',
      description: 'Gerencie suas informações',
      icon: <Person sx={{ fontSize: 40 }} />,
      path: '/perfil',
    },
  ]

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant='h4' component='h1' gutterBottom sx={{ mb: 4 }}>
          Guia de Reforço
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => router.push('/agendamento')}
          >
            Agendar Horário
          </Button>

          {isAdmin && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push('/alunos-adm')}
            >
              Gerenciar Alunos
            </Button>
          )}
        </Box>

        <Grid container spacing={4} marginTop={2}>
          {menuItems.map((item) =>
            (!item.admin || isAdmin) && (!item.aluno || tipoUsuario === 'aluno') && (
              <Grid item xs={6} sm={6} key={item.title}>
                <Paper
                  className="comic-card"
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => router.push(item.path)}
                >
                  {item.icon}
                  <Typography variant='h6' component='h2' sx={{ mt: 2 }}>
                    {item.title}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mt: 1 }}
                  >
                    {item.description}
                  </Typography>
                </Paper>
              </Grid>
            )
          )}
        </Grid>

        {!isAdmin && tipoUsuario === 'aluno' && (
          <Box sx={{ mt: 4 }}>
            <Typography variant='h5' component='h2' gutterBottom>
              Meus Últimos Relatórios
            </Typography>
            {relatorios.map((rel) => (
              <Paper key={rel.id} sx={{ p: 2, mb: 2 }} className="comic-card">
                <Typography variant='subtitle2' color='text.secondary'>
                  {new Date(rel.data_relatorio).toLocaleDateString('pt-BR')} - {rel.dia_semana}
                </Typography>
                {rel.img_urls && rel.img_urls.length > 0 ? (
                  <ImageCarousel urls={rel.img_urls} height={300} />
                ) : (
                  rel.img_url && (
                    <Box
                      component='img'
                      src={rel.img_url}
                      alt='Imagem do relatório'
                      sx={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 1, mt: 1 }}
                    />
                  )
                )}
                <Typography variant='body1' sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                  {rel.conteudo}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  )
}