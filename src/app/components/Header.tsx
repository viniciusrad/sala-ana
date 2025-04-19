'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Container,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { Person, Menu as MenuIcon } from '@mui/icons-material'

interface UserProfile {
  nome_completo?: string
  tipo_usuario?: 'aluno' | 'professor' | 'admin'
  email?: string
}

export default function Header() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    const carregarPerfil = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('nome_completo, tipo_usuario, email')
          .eq('id', session.user.id)
          .single()

        setProfile(profileData || { email: session.user.email })
      }
    }

    carregarPerfil()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setProfile(null)
      localStorage.clear() // Limpa todo o localStorage
      window.location.href = '/login'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      window.location.href = '/login'
    }
  }

  const getTipoUsuarioLabel = (tipo?: string) => {
    switch (tipo) {
      case 'aluno':
        return 'Aluno'
      case 'professor':
        return 'Professor'
      case 'admin':
        return 'Administrador'
      default:
        return 'Usuário'
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    handleMenuClose()
  }

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ paddingX: 0 }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {profile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, padding: ".5rem", paddingX: 0, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, paddingX: 0 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="body2">
                    {profile.nome_completo || profile.email}
                  </Typography>
                  <Chip
                    label={getTipoUsuarioLabel(profile.tipo_usuario)}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 20 }}
                  />
                </Box>
              </Box>

              <Box sx={{ marginLeft: 'auto' }}>
                {isMobile ? (
                  <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleMenuOpen}
                  >
                    <MenuIcon />
                  </IconButton>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="text"
                      onClick={() => router.push('/')}
                      sx={{ color: 'primary.main' }}
                    >
                      Início
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleLogout}
                    >
                      Sair
                    </Button>
                  </Box>
                )}
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => handleNavigation('/')}>
                  Início
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  Sair
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              color="inherit"
              onClick={() => router.push('/login')}
            >
              Entrar
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}
