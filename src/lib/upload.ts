import { supabase } from './supabase'

export async function uploadRelatorioPhoto(file: File, relatorioId: number | string) {
  try {
    // Gera um nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${relatorioId}-${Date.now()}.${fileExt}`
    const filePath = `relatorios/${fileName}`

    // Faz o upload do arquivo
    const { error: uploadError } = await supabase.storage
      .from('relatorio-photo')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Erro de upload:', uploadError)
      throw uploadError
    }

    // Gera a URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from('relatorio-photo')
      .getPublicUrl(filePath)

    console.log('Upload bem-sucedido:', publicUrl)

    return {
      url: publicUrl,
      path: filePath
    }
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error)
    throw error
  }
} 