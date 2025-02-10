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
  Chip,
  CircularProgress,
} from '@mui/material'

interface AlunoHorario {
  nome_completo: string
  email: string
  tipo_usuario: string
}

interface HorarioAgrupado {
  [dia: string]: {
    [horario: string]: AlunoHorario[]
  }
}

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
const horariosDisponiveis = ["14:00", "15:00", "16:00", "17:00"]

export default function AlunosHorariosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [horariosAgrupados, setHorariosAgrupados] = useState<HorarioAgrupado>({})

  useEffect(() => {
    const carregarHorarios = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        const { data: horarios, error } = await supabase
          .from('horarios')
          .select(`
            *,
            profiles:id_aluno (
              nome_completo,
              email,
              tipo_usuario
            )
          `)
          .eq('ativo', true)
          .order('dia_semana')

        if (error) {
          console.error('Erro ao carregar horários:', error)
          return
        }

        console.log(horarios)

        // Agrupa os horários por dia e horário, removendo duplicatas por email
        const agrupados: HorarioAgrupado = {}
        
        horarios.forEach(horario => {
          const horarioFormatado = horario.horario.substring(0, 5) // Converte "HH:MM:SS" para "HH:MM"
          
          if (!agrupados[horario.dia_semana]) {
            agrupados[horario.dia_semana] = {}
          }
          if (!agrupados[horario.dia_semana][horarioFormatado]) {
            agrupados[horario.dia_semana][horarioFormatado] = []
          }

          // Verifica se já existe um aluno com o mesmo email neste horário
          const alunoJaExiste = agrupados[horario.dia_semana][horarioFormatado]
            .some(aluno => aluno.email === horario.profiles.email)

          if (!alunoJaExiste && horario.profiles) {
            agrupados[horario.dia_semana][horarioFormatado].push({
              nome_completo: horario.profiles.nome_completo || horario.profiles.email,
              email: horario.profiles.email,
              tipo_usuario: horario.profiles.tipo_usuario || 'aluno'
            })
          }
        })

        setHorariosAgrupados(agrupados)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarHorarios()
  }, [router])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>


      <Typography variant="h4" gutterBottom>
        {/* Horários de Aula */}
      </Typography>


      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Dia/Horário</TableCell>
              {horariosDisponiveis.map(horario => (
                <TableCell key={horario} align="center">{horario}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {diasSemana.map(dia => (
              <TableRow key={dia}>
                <TableCell component="th" scope="row">
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {dia}
                  </Typography>
                </TableCell>
                {horariosDisponiveis.map(horario => (
                  <TableCell 
                    key={`${dia}-${horario}`} 
                    align="left"
                    sx={{ 
                      minWidth: 200,
                      backgroundColor: horariosAgrupados[dia]?.[horario]?.length ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                    }}
                  >
                    {horariosAgrupados[dia]?.[horario]?.map((aluno, index) => (
                      <Box 
                        key={`${aluno.email}-${index}`} 
                        sx={{ 
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: 'white'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {aluno.nome_completo}
                        </Typography>
                        <Chip
                          label={aluno.tipo_usuario}
                          size="small"
                          color={aluno.tipo_usuario === 'admin' ? 'secondary' : 'primary'}
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    ))}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
} 