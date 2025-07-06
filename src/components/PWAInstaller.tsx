'use client'

import { useEffect } from 'react'

export default function PWAInstaller() {
  useEffect(() => {
    const checkPWARequirements = async () => {
      console.log('=== Verificação de Requisitos PWA ===');
      
      // 1. Verificar se está em HTTPS
      const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      console.log('HTTPS/Localhost:', isHTTPS);
      
      // 2. Verificar se Service Worker é suportado
      const hasServiceWorker = 'serviceWorker' in navigator;
      console.log('Service Worker suportado:', hasServiceWorker);
      
      // 3. Verificar se manifest está sendo carregado
      try {
        const manifestResponse = await fetch('/manifest.json');
        const manifest = await manifestResponse.json();
        console.log('Manifest carregado:', manifest);
        
        // Verificar se os ícones existem
        for (const icon of manifest.icons) {
          try {
            const iconResponse = await fetch(icon.src);
            console.log(`Ícone ${icon.src} existe:`, iconResponse.ok);
          } catch (error) {
            console.error(`Ícone ${icon.src} não encontrado:`, error);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar manifest:', error);
      }
      
      // 4. Verificar se PWA pode ser instalado
      const canInstall = 'beforeinstallprompt' in window;
      console.log('PWA pode ser instalado:', canInstall);
      
      // 5. Registrar Service Worker
      if (hasServiceWorker) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registrado:', registration);
          
          // Verificar se o SW está ativo
          if (registration.active) {
            console.log('Service Worker ativo');
          } else {
            console.log('Service Worker não está ativo ainda');
          }
        } catch (error) {
          console.error('Erro ao registrar Service Worker:', error);
        }
      }
      
      console.log('=== Fim da Verificação ===');
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