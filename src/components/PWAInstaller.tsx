'use client'

import { useEffect } from 'react'

export default function PWAInstaller() {
  useEffect(() => {
    const checkPWARequirements = async () => {
      // 1. Verificar se está em HTTPS
      const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      
      // 2. Verificar se Service Worker é suportado
      const hasServiceWorker = 'serviceWorker' in navigator;
      
      // 3. Verificar se manifest está sendo carregado
      try {
        const manifestResponse = await fetch('/manifest.json');
        const manifest = await manifestResponse.json();
        
        // Verificar se os ícones existem
        for (const icon of manifest.icons) {
          try {
            const iconResponse = await fetch(icon.src);
          } catch (error) {
            console.error(`Ícone ${icon.src} não encontrado:`, error);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar manifest:', error);
      }
      
      // 4. Verificar se PWA pode ser instalado
      const canInstall = 'beforeinstallprompt' in window;
      if (canInstall) {
        console.log('✅ PWA pode ser instalado');
      } else {
        console.log('❌ PWA não pode ser instalado - verifique os critérios');
      }
      
      // 5. Registrar Service Worker
      if (hasServiceWorker) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          
          // Verificar se o SW está ativo
          if (registration.active) {
            // Service Worker ativo
          } else {
            // Service Worker não está ativo ainda
          }
        } catch (error) {
          console.error('Erro ao registrar Service Worker:', error);
        }
      }
    };

    // Aguarda o carregamento completo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkPWARequirements);
    } else {
      checkPWARequirements();
    }
  }, []);

  return null;
} 