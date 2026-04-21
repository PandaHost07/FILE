import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function authorize(req: Request): boolean {
    const secret = process.env.ADMIN_API_SECRET
    if (!secret) return false
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    return token === secret
}

/** Detail snapshot data yang disimpan pengguna (proyek, template, dll.). */
export async function GET(req: Request, ctx: { params: Promise<{ userId: string }> }) {
    if (!process.env.ADMIN_API_SECRET) {
        return NextResponse.json(
            { error: 'ADMIN_API_SECRET belum di-set di server' },
            { status: 503 }
        )
    }
    if (!authorize(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await ctx.params
    const row = await prisma.userWorkspace.findUnique({
        where: { userId },
        include: {
            user: { select: { id: true, email: true, name: true, role: true, createdAt: true } },
        },
    })

    if (!row) {
        return NextResponse.json({ user: null, payload: null, updatedAt: null })
    }

    return NextResponse.json({
        user: row.user,
        payload: row.payload,
        updatedAt: row.updatedAt.toISOString(),
    })
}
