'use client'

import { useEffect, useState } from 'react'
import { Snackbar, Alert, Box, Typography } from '@mui/material'
import { AddToHomeScreen } from '@mui/icons-material'

export default function IOSInstallPrompt() {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
      // Mostrar prompt após 3 segundos
      setTimeout(() => {
        setShowIOSPrompt(true);
      }, 3000);
    }
  }, [])

  const handleClose = () => {
    setShowIOSPrompt(false);
  }

  return (
    <Snackbar
      open={showIOSPrompt}
      autoHideDuration={10000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={handleClose} 
        severity="info"
        icon={<AddToHomeScreen />}
        sx={{ width: '100%' }}
      >
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Para instalar o app no iPhone:
          </Typography>
          <Typography variant="caption" display="block">
            1. Toque no botão compartilhar
          </Typography>
          <Typography variant="caption" display="block">
            2. Selecione &quot;Adicionar à Tela Inicial&quot;
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  )
} 