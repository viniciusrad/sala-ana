'use client'

import { useState, useRef } from 'react'
import { Box, Button, CircularProgress, Alert, Typography } from '@mui/material'
import { CloudUpload, CameraAlt } from '@mui/icons-material'
import { uploadRelatorioPhoto } from '@/lib/upload'

interface UploadFotoProps {
  relatorioId: number
  onUploadComplete: (url: string) => void
}

export default function UploadFoto({ relatorioId, onUploadComplete }: UploadFotoProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const processarArquivo = async (file: File) => {
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

    // Cria uma prévia da imagem
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await processarArquivo(file)
  }

  const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await processarArquivo(file)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="upload-foto"
          type="file"
          onChange={handleFileChange}
          disabled={loading}
          ref={fileInputRef}
        />
        <label htmlFor="upload-foto">
          <Button
            component="span"
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Selecionar Foto'}
          </Button>
        </label>

        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="capturar-foto"
          type="file"
          onChange={handleCameraCapture}
          disabled={loading}
          capture="environment"
          ref={cameraInputRef}
        />
        <label htmlFor="capturar-foto">
          <Button
            component="span"
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <CameraAlt />}
            disabled={loading}
            color="primary"
          >
            {loading ? 'Enviando...' : 'Tirar Foto'}
          </Button>
        </label>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {previewUrl && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Prévia da foto:
          </Typography>
          <Box
            component="img"
            src={previewUrl}
            alt="Prévia da foto"
            sx={{
              width: '100%',
              maxWidth: 300,
              height: 'auto',
              objectFit: 'cover',
              borderRadius: 1,
              border: '1px solid #ddd'
            }}
          />
        </Box>
      )}
    </Box>
  )
} 