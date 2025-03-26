"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { Assignment, CameraAlt } from "@mui/icons-material";
import UploadFoto from "@/components/UploadFoto";

interface Relatorio {
  id?: number;
  id_aluno: string;
  data_relatorio?: string;
  conteudo: string;
  dia_semana: string;
  foto_url?: string;
}

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

export default function RelatorioDiarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [relatorio, setRelatorio] = useState<Relatorio>({
    id_aluno: "",
    conteudo: "",
    dia_semana: "",
  });

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

        setRelatorio((prev) => ({
          ...prev,
          id_aluno: session.user.id,
        }));
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      } finally {
        setLoading(false);
      }
    };

    carregarUsuario();
  }, [router]);

  const handleSalvar = async () => {
    if (!relatorio.conteudo || !relatorio.dia_semana) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setSalvando(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.from("relatorios").insert([
        {
          ...relatorio,
          data_relatorio: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setSuccess("Relatório salvo com sucesso!");
      setRelatorio({
        ...relatorio,
        conteudo: "",
        dia_semana: "",
      });
    } catch (err) {
      console.error("Erro ao salvar relatório:", err);
      setError("Erro ao salvar relatório. Por favor, tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleUploadComplete = (url: string) => {
    setRelatorio((prev) => ({ ...prev, foto_url: url }));
    setSuccess("Foto enviada com sucesso!");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Relatório Diário
      </Typography>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          onClick={() => router.push("/relatorio-diario/listagem")}
          startIcon={<Assignment />}
        >
          Ver Meus Relatórios
        </Button>
      </Box>

      <Paper sx={{ p: 3, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Data do relatório: {new Date().toLocaleDateString("pt-BR")}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <FormControl fullWidth>
            <InputLabel>Dia da Semana</InputLabel>
            <Select
              value={relatorio.dia_semana}
              label="Dia da Semana"
              onChange={(e) =>
                setRelatorio((prev) => ({
                  ...prev,
                  dia_semana: e.target.value,
                }))
              }
            >
              {diasSemana.map((dia) => (
                <MenuItem key={dia} value={dia}>
                  {dia}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Conteúdo visto na aula"
            value={relatorio.conteudo}
            onChange={(e) =>
              setRelatorio((prev) => ({ ...prev, conteudo: e.target.value }))
            }
            placeholder="Descreva o que foi estudado na aula de hoje..."
          />

          {/* Componente de captura de foto - visível apenas em dispositivos móveis */}
          <Box
            sx={{
              display: { xs: "block", sm: "none" }, // Visível apenas em telas pequenas (mobile)
            }}
          >
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="foto-aula"
              type="file"
              capture="environment"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  // Aqui você pode adicionar a lógica para processar a foto
                  // Por exemplo, fazer upload para o Supabase Storage
                  console.log("Foto capturada:", e.target.files[0]);
                }
              }}
            />
            <label htmlFor="foto-aula">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<CameraAlt />}
                sx={{ mt: 1 }}
              >
                Tirar Foto da Aula
              </Button>
            </label>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Foto do Relatório
            </Typography>
            
            <UploadFoto
              relatorioId={relatorio.id || Date.now()} // Usar timestamp como ID temporário se não tiver ID
              onUploadComplete={handleUploadComplete}
            />
            
            {relatorio.foto_url && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Foto enviada com sucesso!
                </Typography>
                <Box
                  component="img"
                  src={relatorio.foto_url}
                  alt="Foto do relatório"
                  sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 'auto',
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid #ddd'
                  }}
                />
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleSalvar}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar Relatório"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
