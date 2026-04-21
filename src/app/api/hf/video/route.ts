import { NextResponse } from 'next/server'
import { InferenceClient } from '@huggingface/inference'

/**
 * Generate video via Hugging Face Inference Providers (kuota gratis tier HF),
 * provider WaveSpeed — tidak memakai saldo fal.ai.
 */
export const maxDuration = 300

const MODEL_ID = 'Wan-AI/Wan2.2-TI2V-5B' as const

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as { apiKey?: string; prompt?: string }
        const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : ''
        const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''

        if (!apiKey) {
            return NextResponse.json(
                { ok: false, error: 'Token Hugging Face kosong. Isi di Pengaturan → Kunci API.' },
                { status: 400 }
            )
        }
        if (!apiKey.startsWith('hf_')) {
            return NextResponse.json(
                {
                    ok: false,
                    error:
                        'Token harus token akses Hugging Face (diawali hf_). Buat di huggingface.co/settings/tokens dengan izin Inference Providers.',
                },
                { status: 400 }
            )
        }
        if (!prompt) {
            return NextResponse.json(
                { ok: false, error: 'Prompt video kosong. Generate konten dulu.' },
                { status: 400 }
            )
        }

        const client = new InferenceClient(apiKey)
        const blob = await client.textToVideo({
            model: MODEL_ID,
            provider: 'wavespeed',
            inputs: prompt.slice(0, 3000),
        })

        return new Response(blob, {
            status: 200,
            headers: {
                'Content-Type': 'video/mp4',
                'Cache-Control': 'no-store',
            },
        })
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Gagal generate video'
        return NextResponse.json({ ok: false, error: msg }, { status: 502 })
    }
}
