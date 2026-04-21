import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
    const loggedIn = !!req.auth
    const path = req.nextUrl.pathname

    if (path === '/login' || path === '/register') {
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

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
}
