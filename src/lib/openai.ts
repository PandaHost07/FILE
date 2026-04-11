import type { IdeaInput, IdeaResult, SceneContext } from '@/types'
import { recordApiUsage } from '@/lib/apiUsageTracker'

const BASE_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o-mini'

export async function callOpenAI(
    apiKey: string,
    systemPrompt: string,
    userMessage: string,
    timeoutMs = 30_000
): Promise<string> {
    if (!apiKey) throw new Error('OpenAI API key tidak boleh kosong')

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const res = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                temperature: 0.8,
                max_tokens: 1000,
            }),
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            const msg = (err as { error?: { message?: string } })?.error?.message ?? res.statusText
            if (res.status === 401) throw new Error('OpenAI: API key tidak valid')
            if (res.status === 429) throw new Error('OpenAI: Rate limit atau quota habis')
            if (res.status === 402) throw new Error('OpenAI: Saldo habis, top up di platform.openai.com')
            throw new Error(`OpenAI error ${res.status}: ${msg}`)
        }

        const data = await res.json()
        const text: string = data?.choices?.[0]?.message?.content ?? ''
        if (!text) throw new Error('OpenAI mengembalikan respons kosong')
        recordApiUsage('openai')
        return text
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('Request timeout setelah 30 detik')
        }
        throw err
    } finally {
        clearTimeout(timer)
    }
}

export async function generateIdeaPromptsOpenAI(
    apiKey: string,
    input: IdeaInput
): Promise<IdeaResult[]> {
    const systemPrompt = `Kamu adalah asisten kreatif untuk konten restorasi.
Berikan 3-5 ide konten restorasi yang berbeda dan kreatif berdasarkan input pengguna.
Kembalikan HANYA JSON array (tanpa markdown, tanpa komentar) dengan format:
[{"title": "...", "description": "...", "suggestedScenes": ["Before", "Bongkar", "Amplas", "Cat", "Finishing", "After"]}]
- title dan description dalam bahasa Indonesia
- suggestedScenes adalah array nama scene yang relevan`

    const userMessage = `Jenis objek: ${input.objectType}
Kondisi awal: ${input.initialCondition}
Gaya visual: ${input.visualStyle}`

    const raw = await callOpenAI(apiKey, systemPrompt, userMessage)
    const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned) as IdeaResult[]
}

export async function generateImagePromptOpenAI(
    apiKey: string,
    context: SceneContext
): Promise<string> {
    const systemPrompt = `You are an expert AI image prompt engineer specializing in restoration photography.
Generate a single, highly detailed and realistic image prompt suitable for Stable Diffusion or Midjourney.
Requirements:
- One long paragraph, no bullet points, no line breaks
- Include in order: subject description, damage/condition details, environment/setting, lighting (type + direction + color temperature), camera specs (brand + model + lens + aperture), color grading, mood, quality tags
- Language: English only
- End with: photorealistic, hyperdetailed, 8K resolution`

    const userMessage = `Scene: ${context.sceneName}
Description: ${context.sceneDescription}
Category: ${context.category}
Visual style: ${context.visualStyle}
Project: ${context.projectName}`

    return callOpenAI(apiKey, systemPrompt, userMessage)
}

export async function generateVideoPromptOpenAI(
    apiKey: string,
    context: SceneContext,
    imagePrompt: string
): Promise<string> {
    const systemPrompt = `You are an expert AI video prompt engineer for restoration timelapse content.
Generate a single, detailed video/timelapse prompt suitable for Runway Gen-3, Kling AI, or Pika.
Requirements:
- One paragraph, no bullet points, no line breaks
- Include: starting state, transformation action, ending state, camera movement, timelapse speed, lighting consistency, duration (4-8 seconds), mood
- Language: English only
- Match the lighting and color grade from the image prompt reference`

    const userMessage = `Scene: ${context.sceneName}
Description: ${context.sceneDescription}
Category: ${context.category}
Visual style: ${context.visualStyle}
Image prompt reference: ${imagePrompt}`

    return callOpenAI(apiKey, systemPrompt, userMessage)
}

export async function refinePromptOpenAI(
    apiKey: string,
    currentPrompt: string,
    instruction: string,
    type: 'image' | 'video'
): Promise<string> {
    const systemPrompt = type === 'image'
        ? `You are an expert AI image prompt engineer. Refine the given image prompt based on the user's instruction. Return only the refined prompt as a single paragraph in English, no explanations.`
        : `You are an expert AI video prompt engineer. Refine the given video/timelapse prompt based on the user's instruction. Return only the refined prompt as a single paragraph in English, no explanations.`

    const userMessage = `Current prompt:\n${currentPrompt}\n\nRefinement instruction:\n${instruction}`
    return callOpenAI(apiKey, systemPrompt, userMessage)
}

// Export raw caller for use in gemini.ts fallback chain
export async function callOpenAIRaw(
    apiKey: string,
    systemPrompt: string,
    userMessage: string
): Promise<string> {
    return callOpenAI(apiKey, systemPrompt, userMessage)
}
