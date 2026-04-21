import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

/** Pendaftaran akun (email + sandi); API key tetap di simpan lokal, tidak dikirim ke server. */
export async function POST(req: Request) {
    try {
        const body = (await req.json()) as { email?: string; password?: string; name?: string }
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
        const password = typeof body.password === 'string' ? body.password : ''
        const name = typeof body.name === 'string' ? body.name.trim() : undefined

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Email tidak valid' }, { status: 400 })
        }
        if (password.length < 8) {
            return NextResponse.json({ error: 'Sandi minimal 8 karakter' }, { status: 400 })
        }

        const exists = await prisma.user.findUnique({ where: { email } })
        if (exists) {
            return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })
        }

        const passwordHash = await bcrypt.hash(password, 12)
        await prisma.user.create({
            data: {
                email,
                passwordHash,
                name: name || null,
                role: 'USER',
            },
        })

        return NextResponse.json({ ok: true })
    } catch (e) {
        console.error('[register]', e)
        return NextResponse.json({ error: 'Gagal mendaftar' }, { status: 500 })
    }
}
