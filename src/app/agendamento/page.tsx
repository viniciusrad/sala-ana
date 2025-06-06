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
  professor: string;
};

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const horariosDisponiveis = [{ text: "14:00/16:00", value: "14:00" }, { text: "16:00/18:00", value: "16:00" }];

export default function AgendamentoReforco() {
  const router = useRouter();
  const maxAlunos = 8;
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [agendamentosPessoais, setAgendamentosPessoais] = useState<Agendamento[]>([]);
  const [novosDias, setNovosDias] = useState<string[]>([]);
  const [novosHorarios, setNovosHorarios] = useState<{
    [dia: string]: string[];
  }>({});
  const [usuario, setUsuario] = useState<{
    id: string;
    email?: string;
    nome_completo?: string;
    tipo_usuario?: "aluno" | "professor" | "admin" | "responsavel"; // TODO: criar interface para o tipo de usuario,
    professor_id?: string;
  } | null>(null);
  const [professores, setProfessores] = useState<{ id: string; nome: string }[]>([]);
  const [professorAgendadoHorario, setProfessorAgendadoHorario] = useState<{
    [dia: string]: {
      [horario: string]: string;
    };
  }>({});
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
    carregarProfessores();
  }, [router]);


  const carregarProfessores = async () => {
    const { data, error } = await supabase.from('professor').select('id, nome');
    if (error) {
      console.error('Erro ao carregar professores:', error);
    }
    setProfessores(data || []);
  }


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

  const toggleProfessor = (dia: string, horario: string, professorId: string) => {
    setProfessorAgendadoHorario((prev) => {
      const diaAtual = prev[dia] || {};
      return {
        ...prev,
        [dia]: {
          ...diaAtual,
          [horario]: professorId
        }
      };
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
          recorrente: false,
          ativo: true,
          professor: professorAgendadoHorario[dia]?.[horario] || null
        }))
      );

      const { data, error } = await supabase
        .from('agendamentos')
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
      setProfessorAgendadoHorario({});

      // Atualiza a lista de agendamentos
      if (data) {
        setAgendamentos([
          ...agendamentos,
          {
            aluno: usuario.nome_completo || usuario.email || '',
            horarios: novosHorarios,
            professor: professores.find(p => p.id === professorAgendadoHorario[Object.keys(novosHorarios)[0]]?.[Object.values(novosHorarios)[0][0]])?.nome || 'Professor não definido'
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
      // Primeiro, carregamos os agendamentos com as informações do aluno
      const { data: agendamentosData, error: agendamentosError } = await supabase
        .from('agendamentos')
        .select(`
          *,
          profiles!horarios_id_aluno_fkey (
            nome_completo,
            email
          )
        `)
        .eq('ativo', true);

      if (agendamentosError) {
        console.error('Erro ao carregar agendamentos:', agendamentosError);
        return;
      }

      if (agendamentosData) {
        // Obtemos todos os IDs de professores únicos
        const professorIds = [...new Set(agendamentosData.map(a => a.professor_id).filter(Boolean))];

        // Carregamos as informações dos professores
        const { data: professoresData, error: professoresError } = await supabase
          .from('professor')
          .select('id, nome')
          .in('id', professorIds);

        if (professoresError) {
          console.error('Erro ao carregar professores:', professoresError);
          return;
        }

        // Criamos um mapa de professores para fácil acesso
        const professoresMap = new Map(
          professoresData?.map(p => [p.id, p.nome]) || []
        );

        // Agrupa os horários por aluno e dia da semana
        const agendamentosAgrupados = agendamentosData.reduce((acc: Agendamento[], item) => {
          const alunoEmail = item.profiles?.email || '';
          const alunoNome = item.profiles?.nome_completo || alunoEmail;
          const professorNome = item.professor_id ? professoresMap.get(item.professor_id) || 'Professor não definido' : 'Professor não definido';

          const alunoExistente = acc.find(a => a.aluno === alunoNome);

          if (alunoExistente) {
            if (!alunoExistente.horarios[item.dia_semana]) {
              alunoExistente.horarios[item.dia_semana] = [];
            }
            if (!alunoExistente.horarios[item.dia_semana].includes(item.horario)) {
              alunoExistente.horarios[item.dia_semana].push(item.horario);
            }
            if (!alunoExistente.professor) {
              alunoExistente.professor = professorNome;
            }
          } else {
            acc.push({
              aluno: alunoNome,
              horarios: {
                [item.dia_semana]: [item.horario]
              },
              professor: professorNome
            });
          }

          return acc;
        }, []);

        setAgendamentos(agendamentosAgrupados);

        // Filtra os agendamentos para mostrar apenas os do aluno logado
        if (usuario?.tipo_usuario === 'aluno') {
          const agendamentosFiltrados = agendamentosAgrupados.filter(
            agendamento => agendamento.aluno === usuario.nome_completo
          );
          setAgendamentosPessoais(agendamentosFiltrados);
        } else {
          setAgendamentosPessoais(agendamentosAgrupados);
        }
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

            {novosDias.map((dia) => (
              <Box key={dia} mt={2}>
                <Typography variant="h4" gutterBottom>
                  {dia}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Horários
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <div>
                    {horariosDisponiveis.map((horario) => (
                      <Box key={`${dia}-${horario.value}`} mb={2}>
                        <Button
                          variant={
                            novosHorarios[dia]?.includes(horario.value)
                              ? "contained"
                              : "outlined"
                          }
                          onClick={() => toggleHorario(dia, horario.value)}
                          sx={{ flex: 1, mb: 1 }}
                        >
                          {horario.text}
                        </Button>
                        {novosHorarios[dia]?.includes(horario.value) && (
                          <Box mt={1}>
                            <Typography variant="subtitle2" gutterBottom>
                              Professor para {horario.text}
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                              {professores.map((professor) => (
                                <Button
                                  key={professor.id}
                                  variant={
                                    professorAgendadoHorario[dia]?.[horario.value] === professor.id
                                      ? "contained"
                                      : "outlined"
                                  }
                                  sx={{ flex: 1 }}
                                  onClick={() => toggleProfessor(dia, horario.value, professor.id)}
                                >
                                  {professor.nome}
                                </Button>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </div>
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
          {(usuario?.tipo_usuario === 'aluno' ? agendamentosPessoais : agendamentos).map((agendamento, index) => (
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
                        <TableCell>Professor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(agendamento.horarios).map(
                        ([dia, horarios]) => (
                          <TableRow key={dia}>
                            <TableCell>{dia}</TableCell>
                            <TableCell>{horarios.join(", ")}</TableCell>
                            <TableCell>{agendamento.professor}</TableCell>
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
