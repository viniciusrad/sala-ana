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
import { CloudUpload, CameraAlt } from '@mui/icons-material'
import { uploadRelatorioPhoto } from '@/lib/upload'

export type UploadFotoHandle = {
  upload: () => Promise<string | null>
}

interface UploadFotoProps {
  relatorioId: number
}

const UploadFoto = forwardRef<UploadFotoHandle, UploadFotoProps>(
  ({ relatorioId }, ref) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imgFile, setImgFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      async upload() {
        if (!imgFile) {
          setError('Nenhuma imagem selecionada')
          return null
        }
        return await processarArquivo(imgFile)
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
      const file = event.target.files?.[0]
      if (file) {
        setImgFile(file)
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)
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
                border: '1px solid #ddd',
              }}
            />
          </Box>
        )}
      </Box>
    )
  }
)

export default UploadFoto
