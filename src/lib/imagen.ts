import { recordApiUsage } from '@/lib/apiUsageTracker'

/**
 * Image generation using Stability AI (Stable Diffusion)
 * Endpoint: Stable Image Core (best quality/speed balance)
 */

export interface GenerateImageOptions {
    /** Seed per project → gaya lebih stabil antar scene (sama prompt+seed ≈ hasil sama). */
    seed?: number
    negativePrompt?: string
    /** Rasio Stability Stable Image Core: 1:1, 16:9, 9:16, … */
    aspectRatio?: string
}

const STABILITY_ASPECT_ALLOWED = new Set([
    '1:1',
    '16:9',
    '21:9',
    '2:3',
    '3:2',
    '4:5',
    '5:4',
    '9:16',
    '9:21',
])

export async function generateImage(
    apiKey: string,
    prompt: string,
    options?: GenerateImageOptions
): Promise<string> {
    if (!apiKey) throw new Error('API key tidak boleh kosong')

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 60_000)

    try {
        const ar =
            options?.aspectRatio && STABILITY_ASPECT_ALLOWED.has(options.aspectRatio)
                ? options.aspectRatio
                : '1:1'

        const formData = new FormData()
        formData.append('prompt', prompt)
        formData.append('output_format', 'png')
        formData.append('aspect_ratio', ar)
        if (options?.seed != null && Number.isFinite(options.seed)) {
            formData.append('seed', String(Math.floor(options.seed)))
        }
        if (options?.negativePrompt?.trim()) {
            formData.append('negative_prompt', options.negativePrompt.trim())
        }

        const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: 'image/*',
            },
            body: formData,
            signal: controller.signal,
        })

        if (!res.ok) {
            const errText = await res.text().catch(() => res.statusText)
            if (res.status === 402) throw new Error('Stability AI: Credit habis. Top up di platform.stability.ai')
            if (res.status === 401) throw new Error('Stability AI: API key tidak valid')
            if (res.status === 429) throw new Error('Stability AI: Rate limit, coba lagi sebentar')
            throw new Error(`Stability AI error ${res.status}: ${errText}`)
        }

        // Response is raw image bytes
        const arrayBuffer = await res.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        if (!base64) throw new Error('Stability AI tidak mengembalikan data gambar')
        recordApiUsage('imagen')
        return base64
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('Request timeout setelah 60 detik')
        }
        throw err
    } finally {
        clearTimeout(timer)
    }
}
