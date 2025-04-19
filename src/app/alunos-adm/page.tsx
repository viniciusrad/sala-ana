'use client'

import { Card, CardContent, Container, Grid, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function AlunosAdm() {
  const router = useRouter();
  return (
   <Container maxWidth="lg" sx={{ py: 4 }}>
    <Typography variant="h4" component="h1" gutterBottom>
      Alunos Adm
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Card sx={{ height: '100%' }} onClick={() => router.push('/alunos-adm/cadastro/aluno')}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Cadastramento de alunos
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card sx={{ height: '100%' }} onClick={() => router.push('/alunos-adm/cadastro/responsavel')}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Cadastramento de responsáveis
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card sx={{ height: '100%' }} onClick={() => router.push('/alunos-adm/cadastro/professor')}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Cadastramento de professores
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
   </Container>
  );
}
