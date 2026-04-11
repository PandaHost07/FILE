import type { IdeaInput, IdeaResult, SceneContext } from '@/types'
import {
    generateIdeaPromptsOpenAI,
    generateImagePromptOpenAI,
    generateVideoPromptOpenAI,
    refinePromptOpenAI,
} from './openai'
import { parseKeys, rotateToNextKey } from './keyRotation'

const MODELS = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
]

function getModelUrl(model: string) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
}

async function callGeminiWithKey(
    apiKey: string,
    systemPrompt: string,
    userMessage: string,
    timeoutMs = 30_000
): Promise<string> {
    let lastError: Error = new Error('Semua model gagal')

    for (const model of MODELS) {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeoutMs)

        try {
            const res = await fetch(`${getModelUrl(model)}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
                }),
            })

            if (res.status === 429 || res.status === 503) {
                const err = await res.json().catch(() => ({}))
                const msg = (err as { error?: { message?: string } })?.error?.message ?? res.statusText
                lastError = new Error(`[${model}] ${msg}`)
                await new Promise((r) => setTimeout(r, 1500))
                continue
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                const msg = (err as { error?: { message?: string } })?.error?.message ?? res.statusText
                throw new Error(`Gemini API error ${res.status}: ${msg}`)
            }

            const data = await res.json()
            const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
            if (!text) throw new Error('Gemini mengembalikan respons kosong')
            return text
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                throw new Error('Request timeout setelah 30 detik')
            }
            if (err instanceof Error && !err.message.startsWith('[')) throw err
            lastError = err instanceof Error ? err : new Error(String(err))
        } finally {
            clearTimeout(timer)
        }
    }

    throw new Error(`Quota habis: ${lastError.message}`)
}

/**
 * Try all Gemini keys in rotation, then fallback to OpenAI keys.
 */
async function callGemini(
    geminiKeysStr: string,
    systemPrompt: string,
    userMessage: string,
    openaiKeysStr?: string
): Promise<string> {
    const geminiKeys = parseKeys(geminiKeysStr)
    let lastGeminiError: Error = new Error('Tidak ada Gemini key')

    // Try each Gemini key
    for (let i = 0; i < geminiKeys.length; i++) {
        const key = geminiKeys[i]
        try {
            return await callGeminiWithKey(key, systemPrompt, userMessage)
        } catch (err) {
            lastGeminiError = err instanceof Error ? err : new Error(String(err))
            // Rotate to next key for next time
            rotateToNextKey('gemini', geminiKeysStr)
        }
    }

    // All Gemini keys failed — try OpenAI
    if (openaiKeysStr) {
        const openaiKeys = parseKeys(openaiKeysStr)
        let lastOpenAIError: Error = new Error('Tidak ada OpenAI key')

        for (let i = 0; i < openaiKeys.length; i++) {
            const key = openaiKeys[i]
            try {
                const { callOpenAIRaw } = await import('./openai')
                return await callOpenAIRaw(key, systemPrompt, userMessage)
            } catch (err) {
                lastOpenAIError = err instanceof Error ? err : new Error(String(err))
                rotateToNextKey('openai', openaiKeysStr)
            }
        }

        throw new Error(`Gemini: ${lastGeminiError.message} → OpenAI: ${lastOpenAIError.message}`)
    }

    throw new Error(`Gemini: ${lastGeminiError.message}`)
}

// ---------------------------------------------------------------------------
// generateIdeaPrompts
// ---------------------------------------------------------------------------
export async function generateIdeaPrompts(
    geminiKeys: string,
    input: IdeaInput,
    openaiKeys?: string
): Promise<IdeaResult[]> {
    const systemPrompt = `Kamu adalah asisten kreatif untuk konten restorasi. 
Berikan 3-5 ide konten restorasi yang berbeda dan kreatif berdasarkan input pengguna.
Kembalikan HANYA JSON array (tanpa markdown, tanpa komentar) dengan format:
[{"title": "...", "description": "...", "suggestedScenes": ["Before", "Bongkar", "Amplas", "Cat", "Finishing", "After"]}]
- title dan description dalam bahasa Indonesia
- suggestedScenes adalah array nama scene yang relevan untuk proyek tersebut`

    const userMessage = `Jenis objek: ${input.objectType}
Kondisi awal: ${input.initialCondition}
Gaya visual: ${input.visualStyle}`

    try {
        const raw = await callGemini(geminiKeys, systemPrompt, userMessage, openaiKeys)
        const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
        return JSON.parse(cleaned) as IdeaResult[]
    } catch {
        // Final fallback: try OpenAI directly
        if (openaiKeys) {
            const keys = parseKeys(openaiKeys)
            for (const key of keys) {
                try { return await generateIdeaPromptsOpenAI(key, input) } catch { continue }
            }
        }
        throw new Error('Semua API key gagal. Cek quota di Settings.')
    }
}

// ---------------------------------------------------------------------------
// generateImagePrompt
// ---------------------------------------------------------------------------
export async function generateImagePrompt(
    geminiKeys: string,
    context: SceneContext,
    openaiKeys?: string
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

    try {
        return await callGemini(geminiKeys, systemPrompt, userMessage, openaiKeys)
    } catch {
        if (openaiKeys) {
            const keys = parseKeys(openaiKeys)
            for (const key of keys) {
                try { return await generateImagePromptOpenAI(key, context) } catch { continue }
            }
        }
        throw new Error('Semua API key gagal. Cek quota di Settings.')
    }
}

// ---------------------------------------------------------------------------
// generateVideoPrompt
// ---------------------------------------------------------------------------
export async function generateVideoPrompt(
    geminiKeys: string,
    context: SceneContext,
    imagePrompt: string,
    openaiKeys?: string
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

    try {
        return await callGemini(geminiKeys, systemPrompt, userMessage, openaiKeys)
    } catch {
        if (openaiKeys) {
            const keys = parseKeys(openaiKeys)
            for (const key of keys) {
                try { return await generateVideoPromptOpenAI(key, context, imagePrompt) } catch { continue }
            }
        }
        throw new Error('Semua API key gagal. Cek quota di Settings.')
    }
}

// ---------------------------------------------------------------------------
// refinePrompt
// ---------------------------------------------------------------------------
export async function refinePrompt(
    geminiKeys: string,
    currentPrompt: string,
    instruction: string,
    type: 'image' | 'video',
    openaiKeys?: string
): Promise<string> {
    const systemPrompt = type === 'image'
        ? `You are an expert AI image prompt engineer. Refine the given image prompt based on the user's instruction. Return only the refined prompt as a single paragraph in English, no explanations.`
        : `You are an expert AI video prompt engineer. Refine the given video/timelapse prompt based on the user's instruction. Return only the refined prompt as a single paragraph in English, no explanations.`

    const userMessage = `Current prompt:\n${currentPrompt}\n\nRefinement instruction:\n${instruction}`

    try {
        return await callGemini(geminiKeys, systemPrompt, userMessage, openaiKeys)
    } catch {
        if (openaiKeys) {
            const keys = parseKeys(openaiKeys)
            for (const key of keys) {
                try { return await refinePromptOpenAI(key, currentPrompt, instruction, type) } catch { continue }
            }
        }
        throw new Error('Semua API key gagal. Cek quota di Settings.')
    }
}
