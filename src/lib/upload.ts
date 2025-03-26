import { supabase } from './supabase'

export async function uploadRelatorioPhoto(file: File, relatorioId: number) {
  try {
    // Gera um nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${relatorioId}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    // Faz o upload do arquivo
    const { error: uploadError, data } = await supabase.storage
      .from('relatorio-photo')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    // Gera a URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from('relatorio-photo')
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath
    }
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error)
    throw error
  }
} 