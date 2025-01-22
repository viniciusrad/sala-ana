"use client";

import { useEffect, useState } from "react";
import {
  Button,
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
  FormHelperText,
} from "@mui/material";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Agendamento = {
  aluno: string;
  horarios: { [dia: string]: string[] };
};

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const horariosDisponiveis = ["14:00", "15:00", "16:00", "17:00"];

export default function AgendamentoReforco() {
  const router = useRouter();
  const maxAlunos = 8;
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [novosDias, setNovosDias] = useState<string[]>([]);
  const [novosHorarios, setNovosHorarios] = useState<{
    [dia: string]: string[];
  }>({});
  const [usuario, setUsuario] = useState<{
    id: string;
    email?: string;
    nome_completo?: string;
    tipo_usuario?: "aluno" | "professor" | "admin";
  } | null>(null);

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push("/login");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("nome_completo, tipo_usuario, email")
          .eq("id", session.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Erro ao carregar perfil:", profileError);
          return;
        }

        setUsuario({
          id: session.user.id,
          email: session.user.email,
          ...profileData,
        });
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      }
    };

    carregarUsuario();
  }, []);

  const toggleDia = (dia: string) => {
    setNovosDias((prev) => {
      if (prev.includes(dia)) {
        const newDias = prev.filter((d) => d !== dia);
        setNovosHorarios((prevHorarios) => {
          const rest = { ...prevHorarios }
          delete rest[dia]
          return rest
        });
        return newDias;
      } else if (prev.length < 3) {
        return [...prev, dia];
      }
      return prev;
    });
  };

  const toggleHorario = (dia: string, horario: string) => {
    setNovosHorarios((prev) => {
      const diaHorarios = prev[dia] || [];
      if (diaHorarios.includes(horario)) {
        return {
          ...prev,
          [dia]: diaHorarios.filter((h) => h !== horario),
        };
      } else {
        return {
          ...prev,
          [dia]: [...diaHorarios, horario],
        };
      }
    });
  };

  const adicionarAgendamento = async () => {
    if (!usuario?.id || Object.keys(novosHorarios).length === 0) {
      alert("Por favor, selecione pelo menos um dia e horário.");
      return;
    }

    try {
      // Para cada dia e horário selecionado, criar um registro na tabela
      const registros = Object.entries(novosHorarios).flatMap(([dia, horarios]) =>
        horarios.map((horario) => ({
          id_aluno: usuario.id,
          dia_semana: dia,
          horario,
          recorrente: false, // Por padrão, os agendamentos não são recorrentes
          ativo: true,
        }))
      );

      const { data, error } = await supabase
        .from('horarios')
        .insert(registros)
        .select();

      if (error) {
        console.error('Erro ao agendar horários:', error);
        alert('Erro ao agendar horários. Por favor, tente novamente.');
        return;
      }

      alert('Horários agendados com sucesso!');
      
      // Limpa os campos após o agendamento
      setNovosDias([]);
      setNovosHorarios({});
      
      // Atualiza a lista de agendamentos
      if (data) {
        setAgendamentos([
          ...agendamentos,
          {
            aluno: usuario.nome_completo || usuario.email || '',
            horarios: novosHorarios,
          },
        ]);
      }
    } catch (err) {
      console.error('Erro ao processar agendamento:', err);
      alert('Erro ao processar agendamento. Por favor, tente novamente.');
    }
  };

  // Função para carregar os agendamentos existentes
  const carregarAgendamentos = async () => {
    if (!usuario?.id) return;

    try {
      const { data, error } = await supabase
        .from('horarios')
        .select('*')
        .eq('id_aluno', usuario.id)
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao carregar agendamentos:', error);
        return;
      }

      if (data) {
        // Agrupa os horários por dia da semana
        const agendamentosAgrupados = data.reduce((acc: { [key: string]: string[] }, item) => {
          if (!acc[item.dia_semana]) {
            acc[item.dia_semana] = [];
          }
          acc[item.dia_semana].push(item.horario);
          return acc;
        }, {});

        setAgendamentos([
          {
            aluno: usuario.nome_completo || usuario.email || '',
            horarios: agendamentosAgrupados,
          },
        ]);
      }
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    }
  };

  // Carrega os agendamentos quando o usuário é carregado
  useEffect(() => {
    if (usuario?.id) {
      carregarAgendamentos();
    }
  }, [usuario?.id]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* <Typography variant="h4" component="h1" gutterBottom>
        Agendamento de Reforço Educacional
      </Typography> */}

      <Box mb={4}>
        <FormControl fullWidth>
          <Box
            display="flex"
            gap={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <FormHelperText>
              Máximo de alunos por horário: {maxAlunos}
            </FormHelperText>
            <FormHelperText>
              Usuário:{" "}
              {usuario?.nome_completo || usuario?.email || "Carregando..."}
            </FormHelperText>
          </Box>
        </FormControl>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Agendamento Semanal
        </Typography>
        <Grid container spacing={4}>
          {/* <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome do Aluno"
              value={novoAluno}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoAluno(e.target.value)}
              variant="outlined"
            />
          </Grid> */}
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
                      variant={
                        novosHorarios[dia]?.includes(horario)
                          ? "contained"
                          : "outlined"
                      }
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

        <Button
          variant="contained"
          onClick={adicionarAgendamento}
          sx={{ mt: 4 }}
        >
          Agendar
        </Button>
        <Button
          variant="contained"
          onClick={adicionarAgendamento}
          sx={{ mt: 4, marginLeft: "1rem" }}
        >
          Reservar Horários
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
          Meus Agendamentos
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
                      {Object.entries(agendamento.horarios).map(
                        ([dia, horarios]) => (
                          <TableRow key={dia}>
                            <TableCell>{dia}</TableCell>
                            <TableCell>{horarios.join(", ")}</TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
