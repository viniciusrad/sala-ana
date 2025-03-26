'use client'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import { StyledEngineProvider } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider } from '@/contexts/AuthContext'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StyledEngineProvider injectFirst>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </AuthProvider>
    </StyledEngineProvider>
  )
} 