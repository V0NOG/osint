import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only apply to /api/ routes
  if (!pathname.startsWith('/api/') || pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Admin routes require a valid JWT with role === 'admin', regardless of method
  if (pathname.startsWith('/api/admin/')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (token.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin role required' }, { status: 403 })
    }
    return NextResponse.next()
  }

  // Cron route is protected by its own secret header (checked inside the route)
  if (pathname.startsWith('/api/cron/')) {
    return NextResponse.next()
  }

  // Public ingest endpoint — protected by INGEST_API_KEY inside the route handler
  if (pathname.startsWith('/api/ingest')) {
    return NextResponse.next()
  }

  // Read-only public routes
  if (pathname.startsWith('/api/search') || pathname.startsWith('/api/watchlist/')) {
    return NextResponse.next()
  }

  // All remaining /api/* mutation methods require any valid session
  if (!PROTECTED_METHODS.has(req.method)) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
