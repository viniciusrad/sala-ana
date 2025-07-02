'use client'

import {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material'
import { CameraAlt } from '@mui/icons-material'
import { uploadRelatorioPhoto } from '@/lib/upload'

export type UploadFotoHandle = {
  upload: () => Promise<string[]>
}

interface UploadFotoProps {
  relatorioId: number
}

const UploadFoto = forwardRef<UploadFotoHandle, UploadFotoProps>(
  ({ relatorioId }, ref) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imgFiles, setImgFiles] = useState<File[]>([])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])
    const cameraInputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      async upload() {
        if (imgFiles.length === 0) {
          setError('Nenhuma imagem selecionada')
          return []
        }
        const urls: string[] = []
        for (const file of imgFiles) {
          const url = await processarArquivo(file)
          if (url) urls.push(url)
        }
        setImgFiles([])
        setPreviewUrls([])
        return urls
      },
    }))

    const processarArquivo = async (file: File): Promise<string | null> => {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem')
        return null
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB')
        return null
      }

      try {
        setLoading(true)
        setError(null)
        const { url } = await uploadRelatorioPhoto(file, relatorioId)
        return url
      } catch (err) {
        console.error('Erro ao fazer upload:', err)
        setError('Erro ao fazer upload da imagem. Tente novamente.')
        return null
      } finally {
        setLoading(false)
      }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || [])
      if (files.length > 0) {
        setImgFiles(files)
        const urls = files.map((file) => URL.createObjectURL(file))
        setPreviewUrls(urls)
      }
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="capturar-foto"
            type="file"
            multiple
            onChange={handleFileChange}
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

        {error && <Alert severity="error">{error}</Alert>}

        {previewUrls.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Prévia das fotos:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {previewUrls.map((url, index) => (
                <Box
                  key={index}
                  component="img"
                  src={url}
                  alt={`Prévia ${index + 1}`}
                  sx={{
                    width: 100,
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid #ddd',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    )
  }
)

UploadFoto.displayName = 'UploadFoto'

export default UploadFoto
