// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define as rotas que requerem autenticação
const protectedRoutes = [
  '/dashboard',
  '/agendamento',
  '/alunos-adm'  // Adicionando rota de admin
]

// Define as rotas públicas (que não requerem autenticação)
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password'
]

export async function middleware(req: NextRequest) {
  console.log("🚀 Iniciando middleware para:", req.nextUrl.pathname)
  console.log("🍪 Cookies presentes:", req.cookies.getAll())
  
  const res = NextResponse.next()
  
  const supabase = createMiddlewareClient({ 
    req, 
    res,
    options: {
      cookies: {
        name: "sb-auth",
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7
      }
    }
  })

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log("🔑 Session no middleware:", session)
    console.log("❌ Erro se houver:", error)

    // Obtém o pathname da URL atual
    const { pathname } = req.nextUrl

    // Verifica se a rota atual é protegida
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    // Verifica se a rota atual é pública
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Se for uma rota protegida e não houver sessão, redireciona para o login
    if (isProtectedRoute && !session) {
      console.log("🚫 Acesso negado - Redirecionando para login")
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Se houver sessão e o usuário tentar acessar rotas públicas, redireciona para o dashboard
    if (session && isPublicRoute) {
      console.log("👤 Usuário já autenticado - Redirecionando para dashboard")
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Verificação especial para rota de admin
    if (pathname.startsWith('/alunos-adm')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tipo_usuario')
        .eq('id', session?.user?.id)
        .single()

      if (!profile || profile.tipo_usuario !== 'admin') {
        console.log("🚫 Acesso negado - Usuário não é admin")
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return res

  } catch (error) {
    console.error("❌ Erro no middleware:", error)
    return res
  }
}

// Define em quais paths o middleware será executado
export const config = {
  matcher: [
    // Aplica o middleware em todas as rotas protegidas
    ...protectedRoutes,
    // Aplica o middleware em todas as rotas públicas
    ...publicRoutes,
  ]
}