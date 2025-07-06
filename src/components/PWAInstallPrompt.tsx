'use client'

import { useEffect, useState } from 'react'
import { Button, Snackbar, Alert } from '@mui/material'
import { Download } from '@mui/icons-material'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
      console.log('Evento beforeinstallprompt capturado')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'rejeitou'} a instalação`)
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleClose = () => {
    setShowInstallPrompt(false)
  }

  return (
    <Snackbar
      open={showInstallPrompt}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={handleClose} 
        severity="info" 
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={handleInstallClick}
            startIcon={<Download />}
          >
            Instalar App
          </Button>
        }
      >
        Instale o app Sala Ana para acesso mais rápido!
      </Alert>
    </Snackbar>
  )
} 