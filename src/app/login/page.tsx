'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Container,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { useRouter } from 'next/navigation'

type TipoUsuario = 'aluno' | 'professor' | 'admin'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function AuthPage() {
  const [tab, setTab] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>('aluno')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()


  // Verificar se já está autenticado
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log("🔑 Verificando sessão:", session)

      if (session?.user) {
        router.push('/')
      }
    }
    checkSession()
  }, [])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
    setError(null)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setTipoUsuario('aluno')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!email || !password) {
      setError('Por favor, preencha todos os campos')
      setLoading(false)
      return
    }

    try {
      // Primeiro, tenta fazer o login
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })


      console.log("🔑 authData", authData)

      console.log('Login response:', { authData, error: signInError })

      if (signInError) {
        throw signInError
      }

      if (authData?.user) {
        // Verifica se a sessão foi estabelecida
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log('Sessão após login:', sessionData)

        if (sessionError) {
          throw sessionError
        }

        // Atualiza o perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: authData.user.email,
            ...(authData.user.user_metadata?.tipo_usuario && {
              tipo_usuario: authData.user.user_metadata.tipo_usuario as TipoUsuario,
            }),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          console.error('Erro ao atualizar perfil:', profileError)
        }

        // Força uma atualização do estado da sessão
        await supabase.auth.refreshSession()

        // Obtém o tipo de usuário para definir o redirecionamento
        const { data: perfil } = await supabase
          .from('profiles')
          .select('tipo_usuario')
          .eq('id', authData.user.id)
          .single()

        // Log dos cookies disponíveis
        console.log('Cookies após login:', document.cookie)

        // Redireciona conforme o tipo do usuário

        
        window.location.href = '/'

      }
    } catch (error) {
      console.error('Erro completo:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Erro ao fazer login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // emailRedirectTo: `${window.location.origin}/auth/callback`,
          emailRedirectTo: `${window.location.origin}/`,
          data: { tipo_usuario: tipoUsuario },
        },
      })

      if (signUpError) throw signUpError

      setError('Verifique seu email para confirmar o cadastro')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao criar conta')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Login" />
            <Tab label="Cadastro" />
          </Tabs>

          {error && (
            <Alert severity={error.includes('Verifique seu email') ? 'success' : 'error'} sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
            <img src="./logo-app.png" alt="Logo" style={{ maxWidth: '50%', height: 'auto' }} />
          </Box>

          <TabPanel value={tab} index={0}>
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email-login"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Senha"
                type="password"
                id="password-login"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Box component="form" onSubmit={handleSignUp}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email-signup"
                label="Email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Senha"
                type="password"
                id="password-signup"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirmar Senha"
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="tipo-usuario-label">Tipo de Usuário</InputLabel>
                <Select
                  labelId="tipo-usuario-label"
                  value={tipoUsuario}
                  label="Tipo de Usuário"
                  onChange={(e) => setTipoUsuario(e.target.value as TipoUsuario)}
                >
                  <MenuItem value="aluno">Aluno</MenuItem>
                  <MenuItem value="professor">Professor</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  )
} 