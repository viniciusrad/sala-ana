'use client'

import { useEffect } from 'react'

export default function PWAInstaller() {
    useEffect(() => {
        const checkPWARequirements = async () => {
            // 1. Verificar se está em HTTPS

            // 2. Verificar se Service Worker é suportado
            const hasServiceWorker = 'serviceWorker' in navigator;

            // 3. Registrar Service Worker
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