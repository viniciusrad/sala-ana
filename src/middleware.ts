// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define as rotas que requerem autenticação
const protectedRoutes = [
  '/agendamento',
  '/alunos-adm'
]

// Define as rotas públicas (que não requerem autenticação)
// const publicRoutes = [
//   '/login',
//   '/register',
//   '/forgot-password'
// ]

export async function middleware(req: NextRequest) {
  console.log("🚀 Iniciando middleware para:", req.nextUrl.pathname)
  console.log("🍪 Cookies presentes:", req.cookies.getAll())
  
  // Se for uma rota protegida, verifica a autenticação
  const { pathname } = req.nextUrl
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Redireciona para login se não houver token
    const hasToken = req.cookies.get('sb-access-token')
    if (!hasToken) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

// Corrigindo o matcher para não usar spread operator
export const config = {
  matcher: [
    '/agendamento',
    '/alunos-adm',
    '/alunos-adm/:path*',
    '/login',
    '/register',
    '/forgot-password'
  ]
}