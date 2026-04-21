import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function authorize(req: Request): boolean {
    const secret = process.env.ADMIN_API_SECRET
    if (!secret) return false
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    return token === secret
}

/** Daftar pengguna + ada/tidaknya workspace (untuk backend/admin). Header: Authorization: Bearer ADMIN_API_SECRET */
export async function GET(req: Request) {
    if (!process.env.ADMIN_API_SECRET) {
        return NextResponse.json(
            { error: 'ADMIN_API_SECRET belum di-set di server' },
            { status: 503 }
        )
    }
    if (!authorize(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            workspace: {
                select: { id: true, updatedAt: true },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
    })

    return NextResponse.json({
        users: users.map(({ workspace, ...u }) => ({
            ...u,
            hasWorkspaceSnapshot: !!workspace,
            workspaceUpdatedAt: workspace?.updatedAt?.toISOString() ?? null,
        })),
    })
}
