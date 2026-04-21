import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
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

                const [{ default: prisma }, { default: bcrypt }] = await Promise.all([
                    import('@/lib/prisma'),
                    import('bcryptjs'),
                ])
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
})
