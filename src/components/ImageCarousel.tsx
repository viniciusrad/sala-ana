'use client'

import { useState } from 'react'
import { Box, IconButton } from '@mui/material'
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material'

interface ImageCarouselProps {
  urls: string[]
  height?: number
}

export default function ImageCarousel({ urls, height = 300 }: ImageCarouselProps) {
  const [index, setIndex] = useState(0)

  if (urls.length === 0) return null

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? urls.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setIndex((prev) => (prev === urls.length - 1 ? 0 : prev + 1))
  }

  return (
    <Box sx={{ position: 'relative', mt: 1 }}>
      <Box
        component='img'
        src={urls[index]}
        alt={`Imagem ${index + 1}`}
        sx={{ width: '100%', maxHeight: height, objectFit: 'cover', borderRadius: 1 }}
      />
      {urls.length > 1 && (
        <>
          <IconButton
            size='small'
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 8,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.4)',
              color: '#fff',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' }
            }}
          >
            <ArrowBackIos fontSize='inherit' />
          </IconButton>
          <IconButton
            size='small'
            onClick={handleNext}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 8,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.4)',
              color: '#fff',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' }
            }}
          >
            <ArrowForwardIos fontSize='inherit' />
          </IconButton>
        </>
      )}
    </Box>
  )
}
