'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function AddToHomeScreen() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setPromptEvent(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  const handleClick = () => {
    promptEvent?.prompt()
    promptEvent?.userChoice.finally(() => setVisible(false))
  }

  if (!visible) return null

  return (
    <button onClick={handleClick} style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      Adicionar à Tela Inicial
    </button>
  )
}
