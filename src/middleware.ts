import { auth } from '@/auth'
import { NextResponse } from 'next/server'

/** Path tanpa trailing slash; `/` tetap `/`. */
function normalizePath(pathname: string): string {
    if (pathname !== '/' && pathname.endsWith('/')) {
        return pathname.slice(0, -1) || '/'
    }
    return pathname
}

export default auth((req) => {
    const loggedIn = !!req.auth
    const path = normalizePath(req.nextUrl.pathname)

    const isPublicAuth = path === '/login' || path === '/register'

    if (isPublicAuth) {
        if (loggedIn) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
        return NextResponse.next()
    }

    if (!loggedIn) {
        const login = new URL('/login', req.url)
        login.searchParams.set('callbackUrl', path)
        return NextResponse.redirect(login)
    }

    return NextResponse.next()
})

/**
 * Sertakan `/` secara eksplisit (beberapa versi Next tidak selalu memproses root dari satu regex).
 */
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
        '/',
    ],
}
