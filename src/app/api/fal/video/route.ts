import { NextResponse } from 'next/server'
import { fal, ApiError } from '@fal-ai/client'

/** Vidu Q2 T2V bisa memakan waktu lama (antrean). */
export const maxDuration = 300

const MODEL_ID = 'fal-ai/vidu/q2/text-to-video' as const

const ASPECT_RATIOS = ['9:16', '16:9', '1:1'] as const
type FalAspect = (typeof ASPECT_RATIOS)[number]

function normalizeAspectRatio(raw: unknown): FalAspect {
    if (typeof raw !== 'string') return '9:16'
    const t = raw.trim()
    return ASPECT_RATIOS.includes(t as FalAspect) ? (t as FalAspect) : '9:16'
}

/**
 * Proxy generate video fal.ai (hindari CORS + jaga pola sama seperti /api/heygen/test).
 * Body: { apiKey: string, prompt: string, aspectRatio?: '9:16' | '16:9' | '1:1' }
 */
export async function POST(req: Request) {
    try {
        const body = (await req.json()) as {
            apiKey?: string
            prompt?: string
            /** Sama seperti UI platform (TikTok 9:16, YouTube 16:9, dll.) */
            aspectRatio?: string
        }
        const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : ''
        const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
        const aspect_ratio = normalizeAspectRatio(body.aspectRatio)

        if (!apiKey) {
            return NextResponse.json({ ok: false, error: 'API key fal.ai kosong. Isi di Pengaturan → Kunci API.' }, { status: 400 })
        }
        if (!prompt) {
            return NextResponse.json({ ok: false, error: 'Prompt video kosong. Generate konten dulu atau isi prompt video.' }, { status: 400 })
        }

        fal.config({ credentials: apiKey })

        const result = await fal.subscribe(MODEL_ID, {
            input: {
                prompt: prompt.slice(0, 3000),
                duration: '4',
                resolution: '720p',
                aspect_ratio,
            },
        })

        const videoUrl = result.data?.video?.url
        if (!videoUrl || typeof videoUrl !== 'string') {
            return NextResponse.json(
                { ok: false, error: 'Respons fal.ai tidak berisi URL video.' },
                { status: 502 }
            )
        }

        return NextResponse.json({ ok: true, videoUrl, requestId: result.requestId })
    } catch (e) {
        if (e instanceof ApiError) {
            const msg =
                typeof e.body === 'object' && e.body !== null && 'detail' in e.body
                    ? JSON.stringify((e.body as { detail?: unknown }).detail)
                    : e.message
            return NextResponse.json(
                { ok: false, error: msg || `fal.ai HTTP ${e.status}` },
                { status: e.status >= 400 && e.status < 600 ? e.status : 502 }
            )
        }
        return NextResponse.json(
            { ok: false, error: e instanceof Error ? e.message : 'Gagal generate video' },
            { status: 500 }
        )
    }
}
