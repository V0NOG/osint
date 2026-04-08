import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect /api/ routes with mutation methods
  if (!pathname.startsWith('/api/') || pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

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
