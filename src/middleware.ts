import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function requiresAuth(request: NextRequest): boolean {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/register')) return true
  if (pathname.startsWith('/api/books') && request.method === 'POST')
    return true
  return false
}

export function middleware(request: NextRequest) {
  if (!requiresAuth(request)) {
    return NextResponse.next()
  }

  const authorization = request.headers.get('Authorization')
  if (!authorization || !isValidAuth(authorization)) {
    return new NextResponse(null, {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic' },
    })
  }

  return NextResponse.next()
}

function isValidAuth(authorization: string): boolean {
  const [scheme, encoded] = authorization.split(' ')
  if (scheme !== 'Basic' || !encoded) return false

  const decoded = atob(encoded)
  const [, password] = decoded.split(':')
  return password === process.env.BASIC_AUTH_PASSWORD
}

