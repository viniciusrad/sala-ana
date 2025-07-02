import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Função utilitária para concatenar classes CSS de forma segura
 * @param inputs Classes CSS a serem combinadas
 * @returns String com as classes CSS combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte possíveis strings ou arrays vindos do banco
 * em uma lista de URLs de imagem. Valores inválidos são
 * ignorados.
 */
export function parseImageUrls(value: unknown): string[] {
  if (!value) return []

  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === 'string')
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.filter((v) => typeof v === 'string')
      }
      if (typeof parsed === 'string') {
        return [parsed]
      }
    } catch {
      // não é JSON, possivelmente uma única URL
    }
  }

  return []
}
