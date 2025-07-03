'use client'

import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme } from '@mui/material'
import { AuthProvider } from '@/contexts/AuthContext'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ff1744',
    },
    secondary: {
      main: '#2979ff',
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), sans-serif',
    h1: {
      fontFamily: 'var(--font-bangers)',
      letterSpacing: 1,
    },
    h2: {
      fontFamily: 'var(--font-bangers)',
      letterSpacing: 1,
    },
    h3: {
      fontFamily: 'var(--font-bangers)',
      letterSpacing: 1,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>

    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
    </AuthProvider>
  )
} 