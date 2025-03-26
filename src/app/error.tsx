'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Ops! Algo deu errado</h2>
      <p>{error.message || 'Ocorreu um erro inesperado'}</p>
      <button
        onClick={reset}
        style={{
          padding: '10px 20px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Tentar novamente
      </button>
    </div>
  )
} 