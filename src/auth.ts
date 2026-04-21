import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import type { UserRole } from '@prisma/client'

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
    providers: [
        Credentials({
            name: 'Email',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Sandi', type: 'password' },
            },
            async authorize(credentials) {
                const email = credentials?.email?.toString().trim().toLowerCase()
                const password = credentials?.password?.toString() ?? ''
                if (!email || !password) return null

                const user = await prisma.user.findUnique({
                    where: { email },
                })
                if (!user) return null

                const ok = await bcrypt.compare(password, user.passwordHash)
                if (!ok) return null

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as { role?: UserRole }).role
                if (user.email) token.email = user.email
                if (user.name !== undefined) token.name = user.name
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = (token.role as UserRole) ?? 'USER'
                if (typeof token.email === 'string') session.user.email = token.email
                session.user.name = (token.name as string | null | undefined) ?? null
            }
            return session
        },
    },
})
