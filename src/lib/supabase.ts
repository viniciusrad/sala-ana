import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient({
  cookieOptions: {
    name: "sb-auth",
    domain: process.env.NEXT_PUBLIC_DOMAIN || 'localhost',
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  }
}) 