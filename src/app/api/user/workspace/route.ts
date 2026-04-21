import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const PAYLOAD_MAX_BYTES = 4_000_000

/** GET snapshot workspace (tanpa API key — key hanya di perangkat). */
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const row = await prisma.userWorkspace.findUnique({
        where: { userId: session.user.id },
    })

    return NextResponse.json({
        payload: row?.payload ?? null,
        updatedAt: row?.updatedAt?.toISOString() ?? null,
    })
}

/** Simpan snapshot: { projects, templates, activeProjectId, activeSceneId, apiUsage } — jangan kirim apiKeys. */
export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'JSON tidak valid' }, { status: 400 })
    }

    const payload = (body as { payload?: unknown }).payload
    if (payload === undefined) {
        return NextResponse.json({ error: 'Field payload wajib ada' }, { status: 400 })
    }

    const str = JSON.stringify(payload)
    if (str.length > PAYLOAD_MAX_BYTES) {
        return NextResponse.json({ error: 'Data terlalu besar' }, { status: 413 })
    }

    await prisma.userWorkspace.upsert({
        where: { userId: session.user.id },
        create: {
            userId: session.user.id,
            payload: payload as object,
        },
        update: {
            payload: payload as object,
        },
    })

    return NextResponse.json({ ok: true })
}
