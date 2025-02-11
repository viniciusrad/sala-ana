// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
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
  

  const res = NextResponse.next()
  
  const supabase = createMiddlewareClient({ 
    req, 
    res
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
    // const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Se for uma rota protegida e não houver sessão, redireciona para o login
    if (isProtectedRoute && !session) {
      console.log("🚫 Acesso negado - Redirecionando para login")
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Se houver sessão e o usuário tentar acessar rotas públicas, redireciona para a home
    // if (session && isPublicRoute) {
    //   console.log("👤 Usuário já autenticado - Redirecionando para home")
    //   return NextResponse.redirect(new URL('/', req.url))
    // }

    // Verificação especial para rota de admin
    if (pathname.startsWith('/alunos-adm')) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('tipo_usuario')
          .eq('id', session?.user?.id)
          .single()

        if (error) {
          console.error('Erro ao verificar perfil:', error)
          return NextResponse.redirect(new URL('/', req.url))
        }

        if (!profile || profile.tipo_usuario !== 'admin') {
          console.log("🚫 Acesso negado - Usuário não é admin")
          return NextResponse.redirect(new URL('/', req.url))
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error)
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return res

  } catch (error) {
    console.error("❌ Erro no middleware:", error)
    return res
  }
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