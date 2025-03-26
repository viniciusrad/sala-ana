'use client'

import { useState } from 'react'
import { Box, Button, CircularProgress, Alert } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import { uploadRelatorioPhoto } from '@/lib/upload'

interface UploadFotoProps {
  relatorioId: number
  onUploadComplete: (url: string) => void
}

export default function UploadFoto({ relatorioId, onUploadComplete }: UploadFotoProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Verifica se é uma imagem
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Verifica o tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { url } = await uploadRelatorioPhoto(file, relatorioId)
      onUploadComplete(url)
    } catch (err) {
      console.error('Erro ao fazer upload:', err)
      setError('Erro ao fazer upload da imagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="upload-foto"
        type="file"
        onChange={handleFileChange}
        disabled={loading}
      />
      <label htmlFor="upload-foto">
        <Button
          component="span"
          variant="outlined"
          startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar Foto'}
        </Button>
      </label>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
} 