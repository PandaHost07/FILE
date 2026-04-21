import { NextResponse } from 'next/server'

/** Uji kunci HeyGen lewat server (hindari CORS browser → api.heygen.com). */
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : ''
        if (!apiKey) {
            return NextResponse.json({ ok: false, error: 'apiKey kosong' }, { status: 400 })
        }

        const res = await fetch('https://api.heygen.com/v2/avatars', {
            method: 'GET',
            headers: {
                'X-Api-Key': apiKey,
                Accept: 'application/json',
            },
            cache: 'no-store',
        })

        const text = await res.text()
        if (!res.ok) {
            return NextResponse.json(
                { ok: false, error: text || `HTTP ${res.status}` },
                { status: 400 }
            )
        }

        let data: { data?: { avatars?: unknown[] } } = {}
        try {
            data = JSON.parse(text) as typeof data
        } catch {
            return NextResponse.json({ ok: false, error: 'Respons bukan JSON' }, { status: 400 })
        }

        const err = (data as { error?: string | null }).error
        if (err) {
            return NextResponse.json({ ok: false, error: String(err) }, { status: 400 })
        }

        const avatarCount = Array.isArray(data.data?.avatars) ? data.data!.avatars!.length : 0
        return NextResponse.json({ ok: true, avatarCount })
    } catch (e) {
        return NextResponse.json(
            { ok: false, error: e instanceof Error ? e.message : 'Gagal uji koneksi' },
            { status: 500 }
        )
    }
}
