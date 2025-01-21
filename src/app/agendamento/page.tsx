"use client"

import { useState } from "react"
import {
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Container,
  Grid,
  FormControl,
  Box,
} from "@mui/material"

type Agendamento = {
  aluno: string
  horarios: { [dia: string]: string[] }
}

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
const horariosDisponiveis = ["14:00", "15:00", "16:00", "17:00"]

export default function AgendamentoReforco() {
  const [maxAlunos, setMaxAlunos] = useState(5)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [novoAluno, setNovoAluno] = useState("")
  const [novosDias, setNovosDias] = useState<string[]>([])
  const [novosHorarios, setNovosHorarios] = useState<{ [dia: string]: string[] }>({})

  const toggleDia = (dia: string) => {
    setNovosDias((prev) => {
      if (prev.includes(dia)) {
        const newDias = prev.filter((d) => d !== dia)
        setNovosHorarios((prevHorarios) => {
          const { [dia]: _unused, ...rest } = prevHorarios
          return rest
        })
        return newDias
      } else if (prev.length < 3) {
        return [...prev, dia]
      }
      return prev
    })
  }

  const toggleHorario = (dia: string, horario: string) => {
    setNovosHorarios((prev) => {
      const diaHorarios = prev[dia] || []
      if (diaHorarios.includes(horario)) {
        return {
          ...prev,
          [dia]: diaHorarios.filter((h) => h !== horario),
        }
      } else {
        return {
          ...prev,
          [dia]: [...diaHorarios, horario],
        }
      }
    })
  }

  const adicionarAgendamento = () => {
    if (novoAluno && Object.keys(novosHorarios).length > 0) {
      setAgendamentos([...agendamentos, { aluno: novoAluno, horarios: novosHorarios }])
      setNovoAluno("")
      setNovosDias([])
      setNovosHorarios({})
    } else {
      alert("Por favor, preencha o nome do aluno e selecione pelo menos um dia e horário.")
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Agendamento de Reforço Educacional
      </Typography>

      <Box mb={4}>
        <FormControl fullWidth>
          <TextField
            label="Máximo de alunos por horário"
            type="number"
            value={maxAlunos}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxAlunos(Number(e.target.value))}
            variant="outlined"
          />
        </FormControl>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Novo Agendamento
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome do Aluno"
              value={novoAluno}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoAluno(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Dias da Semana (selecione até 3)
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {diasSemana.map((dia) => (
                <Button
                  key={dia}
                  variant={novosDias.includes(dia) ? "contained" : "outlined"}
                  onClick={() => toggleDia(dia)}
                  sx={{ flex: 1 }}
                >
                  {dia}
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>

        {novosDias.length > 0 && (
          <Box mt={4}>
            <Typography variant="subtitle1" gutterBottom>
              Horários Disponíveis
            </Typography>
            {novosDias.map((dia) => (
              <Box key={dia} mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  {dia}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {horariosDisponiveis.map((horario) => (
                    <Button
                      key={`${dia}-${horario}`}
                      variant={novosHorarios[dia]?.includes(horario) ? "contained" : "outlined"}
                      onClick={() => toggleHorario(dia, horario)}
                      sx={{ flex: 1 }}
                    >
                      {horario}
                    </Button>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <Button variant="contained" onClick={adicionarAgendamento} sx={{ mt: 4 }}>
          Agendar
        </Button>
      </Box>

      {Object.keys(novosHorarios).length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Horários Selecionados
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Dia</TableCell>
                  <TableCell>Horários</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(novosHorarios).map(([dia, horarios]) => (
                  <TableRow key={dia}>
                    <TableCell>{dia}</TableCell>
                    <TableCell>{horarios.join(", ")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Box mt={8}>
        <Typography variant="h5" gutterBottom>
          Agendamentos
        </Typography>
        <Grid container spacing={4}>
          {agendamentos.map((agendamento, index) => (
            <Grid item key={index} xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {agendamento.aluno}
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Dia</TableCell>
                        <TableCell>Horários</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(agendamento.horarios).map(([dia, horarios]) => (
                        <TableRow key={dia}>
                          <TableCell>{dia}</TableCell>
                          <TableCell>{horarios.join(", ")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  )
} 