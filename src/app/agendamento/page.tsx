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
const horariosDisponiveis = [{text: "14:00/16:00", value: "14:00"}, {text: "16:00/18:00", value: "16:00"}];

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
    tipo_usuario?: "aluno" | "professor" | "admin" | "responsavel"; // TODO: criar interface para o tipo de usuario
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
  }, [router]);

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
      let query = supabase
        .from('horarios')
        .select(`
          *,
          profiles:id_aluno (
            nome_completo,
            email
          )
        `)
        .eq('ativo', true);

      // Se não for admin, filtra apenas os agendamentos do usuário
      if (usuario.tipo_usuario !== 'admin') {
        query = query.eq('id_aluno', usuario.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar agendamentos:', error);
        return;
      }

      if (data) {
        // Agrupa os horários por aluno e dia da semana
        const agendamentosAgrupados = data.reduce((acc: Agendamento[], item) => {
          const alunoEmail = item.profiles?.email || '';
          const alunoNome = item.profiles?.nome_completo || alunoEmail;
          
          const alunoExistente = acc.find(a => a.aluno === alunoNome);
          
          if (alunoExistente) {
            if (!alunoExistente.horarios[item.dia_semana]) {
              alunoExistente.horarios[item.dia_semana] = [];
            }
            if (!alunoExistente.horarios[item.dia_semana].includes(item.horario)) {
              alunoExistente.horarios[item.dia_semana].push(item.horario);
            }
          } else {
            acc.push({
              aluno: alunoNome,
              horarios: {
                [item.dia_semana]: [item.horario]
              }
            });
          }
          
          return acc;
        }, []);

        setAgendamentos(agendamentosAgrupados);
      }
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    }
  };

  // Função para calcular total de alunos por horário
  const calcularTotalAlunosPorHorario = (dia: string, horario: string) => {
    let total = 0;
    
    agendamentos.forEach(agendamento => {
      // Verifica se existem horários para o dia específico
      const horariosNoDia = agendamento.horarios[dia];
      
      // Se houver horários no dia, verifica se o horário específico está incluído
      if (Array.isArray(horariosNoDia)) {
        // Compara apenas as horas e minutos, ignorando os segundos
        const horarioExiste = horariosNoDia.some(h => h.startsWith(horario));
        if (horarioExiste) {
          total += 1;
        }
      }
    });

    return total;
  };

  // Carrega os agendamentos quando o usuário é carregado
  useEffect(() => {
    if (usuario?.id) {
      carregarAgendamentos();
    }
  }, [usuario?.id]);

  // Efeito para debug dos agendamentos
  useEffect(() => {
  }, [agendamentos]);

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
              {usuario?.tipo_usuario === 'admin' ? 'Administrador' : 'Aluno'}:{" "}
              {usuario?.nome_completo || usuario?.email || "Carregando..."}
            </FormHelperText>
          </Box>
        </FormControl>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          {usuario?.tipo_usuario === 'admin' ? 'Gerenciar Agendamentos' : 'Agendamento Semanal'}
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
                        novosHorarios[dia]?.includes(horario.value)
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => toggleHorario(dia, horario.value)}
                      sx={{ flex: 1 }}
                    >
                      {horario.text}
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
                  <TableRow key={`horario - ${horarios.join(", ")}`}>
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
        {/* Resumo de alunos por horário */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Total de Alunos por Horário
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Dia</TableCell>
                  {horariosDisponiveis.map((horario) => (
                    <TableCell key={horario.value} align="center">{horario.text}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {diasSemana.map((dia) => (
                  <TableRow key={dia}>
                    <TableCell>{dia}</TableCell>
                    {horariosDisponiveis.map((horario) => {
                      const total = calcularTotalAlunosPorHorario(dia, horario.value);
                      const lotado = total >= maxAlunos;
                      return (
                        <TableCell 
                          key={`${dia}-${horario.value}`} 
                          align="center"
                          sx={{
                            bgcolor: lotado ? 'error.main' : total > 0 ? 'success.light' : 'inherit',
                            color: lotado ? 'white' : 'inherit',
                            fontWeight: total > 0 ? 'bold' : 'normal'
                          }}
                        >
                          {total}/{maxAlunos}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Typography variant="h5" gutterBottom>
          {usuario?.tipo_usuario === 'admin' ? 'Todos os Agendamentos' : 'Meus Agendamentos'}
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
