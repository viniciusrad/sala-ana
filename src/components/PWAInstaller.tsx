'use client'

import { useEffect } from 'react'

export default function PWAInstaller() {
  useEffect(() => {
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registrado com sucesso:', registration);
          
          // Verifica se o PWA pode ser instalado
          if ('beforeinstallprompt' in window) {
            console.log('PWA pode ser instalado');
          } else {
            console.log('PWA não pode ser instalado - verifique os critérios');
          }
          
        } catch (error) {
          console.error('Erro ao registrar Service Worker:', error);
        }
      } else {
        console.log('Service Worker não é suportado');
      }
    };

    // Aguarda o carregamento completo da página
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', registerSW);
    } else {
      registerSW();
    }
  }, []);

  return null;
} 