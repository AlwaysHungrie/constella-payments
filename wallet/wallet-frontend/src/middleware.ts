import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register'

  // If user is on auth pages but already authenticated, redirect to profile
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  // Temporarily disable server-side protection for profile page
  // Let client-side protection handle it
  // if (isProtectedPage && !token) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/register', '/profile'],
} 