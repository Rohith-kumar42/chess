import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes that don't require authentication
  const publicPaths = ['/', '/login', '/signup']
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path
  )

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in, fetch their role and enforce route access
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'student'

    // Redirect logged-in users away from auth pages
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'admin' ? '/admin/dashboard' : 
                     role === 'parent' ? '/parent/dashboard' : 
                     '/student/dashboard'
      return NextResponse.redirect(url)
    }

    // Enforce role-based route access
    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (request.nextUrl.pathname.startsWith('/student') && role !== 'student' && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (request.nextUrl.pathname.startsWith('/parent') && role !== 'parent' && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
