import type { NextAuthConfig } from 'next-auth'
import type { UserRole } from '@prisma/client'

/** Konfigurasi tanpa Prisma — aman untuk Edge / middleware. */
export const authConfig: NextAuthConfig = {
    providers: [],
    trustHost: true,
    session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                const u = user as { role?: UserRole; email?: string | null; name?: string | null }
                if (u.role !== undefined) token.role = u.role
                if (u.email) token.email = u.email
                if (u.name !== undefined) token.name = u.name
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = (token.role as 'USER' | 'ADMIN') ?? 'USER'
                if (typeof token.email === 'string') session.user.email = token.email
                session.user.name = (token.name as string | null | undefined) ?? null
            }
            return session
        },
    },
}
