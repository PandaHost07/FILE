import type { IdeaInput, IdeaResult, SceneContext } from '@/types'
import {
    generateIdeaPromptsOpenAI,
    generateImagePromptOpenAI,
    generateVideoPromptOpenAI,
    refinePromptOpenAI,
} from './openai'
import { parseKeys, rotateToNextKey } from './keyRotation'
import { countTokensCl100k } from './tokenCount'
import {
    buildDirectorShotPlan,
    buildVideoPromptBundle,
    buildVisualContinuityRules,
    PROMPT_VIDEO_BERSIH,
    PROMPT_TIKTOK_REALISM_SUFFIX,
    wrapShotPlanForDuration,
    describeExpressionForPrompt,
    describeSceneForPrompt,
    type TikTokLocalInput,
    type TikTokLocalResult,
} from './tiktokAffiliateIndonesia'
import type { FilmmakerSceneItem } from './filmmakerScenes'
import { buildLocalFilmmakerScenes } from './filmmakerScenes'
import type { ProductAdInput, ProductAdResult } from './productAdIndonesia'
import { buildLocalProductAd } from './productAdIndonesia'

/** Metrik token satu panggilan chat (Gemini / Groq / OpenAI / estimasi). */
export type AiTokenUsageMeta = {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    source: 'provider' | 'estimated'
    provider: 'gemini' | 'groq' | 'openai' | null
}

export type TikTokAffiliateAiOptions = {
    /** Kualitas output: lebih banyak instruksi + maxOutput lebih besar. */
    quality: 'standard' | 'pro'
    /** Indeks varian 0-based; pose & shot harus beda antar varian jika variantTotal > 1 */
    variantIndex?: number
    variantTotal?: number
}

/** Jumlahkan usage dari beberapa panggilan API berturut-turut (multi-varian). */
export function aggregateAiUsage(usages: AiTokenUsageMeta[]): AiTokenUsageMeta {
    if (usages.length === 0) {
        return {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            source: 'estimated',
            provider: null,
        }
    }
    const first = usages[0]!
    let promptTokens = 0
    let completionTokens = 0
    let totalTokens = 0
    for (const u of usages) {
        promptTokens += u.promptTokens
        completionTokens += u.completionTokens
        totalTokens += u.totalTokens
    }
    return {
        promptTokens,
        completionTokens,
        totalTokens,
        source: first.source,
        provider: first.provider,
    }
}

export type TikTokAffiliateAiResult = {
    result: TikTokLocalResult
    usage: AiTokenUsageMeta
}

function estimateTokenUsage(
    systemPrompt: string,
    userMessage: string,
    completionText: string
): AiTokenUsageMeta {
    const promptTokens = countTokensCl100k(systemPrompt) + countTokensCl100k(userMessage)
    const completionTokens = countTokensCl100k(completionText)
    return {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        source: 'estimated' as const,
        provider: null,
    }
}

function mergeGeminiUsage(data: unknown): AiTokenUsageMeta | null {
    const m = (data as { usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } })
        ?.usageMetadata
    if (!m) return null
    const prompt = m.promptTokenCount ?? 0
    const completion = m.candidatesTokenCount ?? 0
    const total = m.totalTokenCount ?? prompt + completion
    if (prompt === 0 && completion === 0) return null
    return {
        promptTokens: prompt,
        completionTokens: completion,
        totalTokens: total,
        source: 'provider' as const,
        provider: 'gemini',
    }
}

function mergeOpenAiCompatibleUsage(
    data: { usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } },
    provider: 'groq' | 'openai'
): AiTokenUsageMeta | null {
    const u = data.usage
    if (!u || (u.prompt_tokens == null && u.completion_tokens == null)) return null
    const prompt = u.prompt_tokens ?? 0
    const completion = u.completion_tokens ?? 0
    const total = u.total_tokens ?? prompt + completion
    return {
        promptTokens: prompt,
        completionTokens: completion,
        totalTokens: total,
        source: 'provider' as const,
        provider,
    }
}

const MODELS = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
]

// ── Compact system prompts (hemat ~50% token input) ──────────────────────────

// VISUAL LOCK: kunci identitas subjek agar konsisten antar scene
const VISUAL_LOCK_INSTRUCTION = `CRITICAL CONSISTENCY RULE: The subject (cabin/object/location) MUST be identical across all scenes. Same structure, same materials, same surroundings. Only the state/progress changes. Never change the shape, size, or location of the main subject.`

const SYS_IMAGE = `Image prompt expert. Output: comma-separated keywords ONLY. Max 35 words. No sentences.
${VISUAL_LOCK_INSTRUCTION}
Format: [Subject exact state], [action], [environment], [lighting style], raw documentary photo, hyperrealistic, ultra detailed, 8k. (NO CGI, NO 3D rendering, NO illustration, NO artificial look).`

const SYS_VIDEO = `Video prompt expert. Output: comma-separated keywords ONLY. Max 35 words. No sentences.
${VISUAL_LOCK_INSTRUCTION}
Format: [Camera movement e.g. slow pan right], [subject action in detail], [natural lighting], raw footage, amateur authentic video, documentary style. (NO animation, NO CGI).`

const SYS_AUDIO = `ASMR/Foley sound design expert. Output: comma-separated keywords ONLY. Max 20 words. No sentences.
Format: [Main action sound e.g. heavy metal grinding], [secondary texture e.g. wood scraping], [ambient background e.g. quiet workshop reverb], ASMR, high-fidelity.`

const SYS_VIDEO_SECONDS = `Expert timelapse video prompt engineer. Output: JSON only, no markdown.
${VISUAL_LOCK_INSTRUCTION}
Generate per-second breakdown for a timelapse video. Return:
{"totalSeconds":N,"fps":24,"colorGrade":"...","cameraLock":"...","seconds":[{"second":1,"action":"...","camera":"...","subject":"..."},...]}
Each second entry: action happening, camera movement, subject state. Be specific and cinematic.`

const SYS_CONTINUE_STORY = `Expert timelapse content strategist. You continue an ongoing construction/restoration story.
Given the previous scene context, generate the NEXT logical scene that continues the narrative.
Output: JSON only, no markdown:
{"sceneTitle":"...","sceneSummary":"...","imagePrompt":"...","videoPrompt":"...","continuityNote":"..."}
imagePrompt: 1 paragraph English, photorealistic, SAME subject/location as before.
videoPrompt: 1 paragraph English with per-second breakdown.
continuityNote: what visual elements must match from previous scene.`

const SYS_REFINE_IMAGE = `Image prompt engineer. Refine given prompt per instruction. Return refined prompt only, 1 paragraph, English.`
const SYS_REFINE_VIDEO = `Video prompt engineer. Refine given timelapse prompt per instruction. Return refined prompt only, 1 paragraph, English.`

const SYS_IDEAS = `Asisten ide konten restorasi. Return ONLY JSON array, no markdown:
[{"title":"...","description":"...","suggestedScenes":["Before","Proses","After"]}]
3-5 ide. title+description: Bahasa Indonesia. suggestedScenes: nama scene relevan.`

// ── Gemini caller ─────────────────────────────────────────────────────────────

function getModelUrl(model: string) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
}

async function callGeminiWithKey(
    apiKey: string,
    systemPrompt: string,
    userMessage: string,
    maxOutputTokens = 400,
    timeoutMs = 25_000,
    geminiExtra?: { temperature?: number }
): Promise<{ text: string; usage: AiTokenUsageMeta | null }> {
    let lastError: Error = new Error('Semua model gagal')

    for (const model of MODELS) {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeoutMs)

        try {
            const res = await fetch(`${getModelUrl(model)}?key=${encodeURIComponent(apiKey)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
                    generationConfig: {
                        maxOutputTokens,
                        ...(geminiExtra?.temperature != null ? { temperature: geminiExtra.temperature } : {}),
                    },
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
            return { text, usage: mergeGeminiUsage(data) }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') throw new Error('Timeout 25 detik')
            if (err instanceof Error && !err.message.startsWith('[')) throw err
            lastError = err instanceof Error ? err : new Error(String(err))
        } finally {
            clearTimeout(timer)
        }
    }

    throw new Error(`Gemini: ${lastError.message}`)
}

function parseInlineImageBase64(dataUrlOrBase64: string): { mimeType: string; base64: string } | null {
    const m = dataUrlOrBase64.trim().match(/^data:([^;]+);base64,([\s\S]+)$/)
    if (m) return { mimeType: m[1], base64: m[2] }
    if (dataUrlOrBase64.length > 80) return { mimeType: 'image/jpeg', base64: dataUrlOrBase64.trim() }
    return null
}

/** Gemini multimodal: gambar produk + teks — untuk iklan produk. */
async function callGeminiWithKeyVision(
    apiKey: string,
    systemPrompt: string,
    userText: string,
    imageDataUrlOrBase64: string,
    maxOutputTokens = 1500,
    timeoutMs = 45_000,
    geminiExtra?: { temperature?: number }
): Promise<{ text: string; usage: AiTokenUsageMeta | null }> {
    const parsed = parseInlineImageBase64(imageDataUrlOrBase64)
    if (!parsed) throw new Error('Format gambar tidak valid')

    const userParts: Array<
        { text: string } | { inline_data: { mime_type: string; data: string } }
    > = [
        {
            inline_data: {
                mime_type: parsed.mimeType,
                data: parsed.base64,
            },
        },
        { text: userText },
    ]

    let lastError: Error = new Error('Semua model gagal')

    for (const model of MODELS) {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeoutMs)

        try {
            const res = await fetch(`${getModelUrl(model)}?key=${encodeURIComponent(apiKey)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: 'user', parts: userParts }],
                    generationConfig: {
                        maxOutputTokens,
                        ...(geminiExtra?.temperature != null ? { temperature: geminiExtra.temperature } : {}),
                    },
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
            return { text, usage: mergeGeminiUsage(data) }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') throw new Error('Timeout')
            if (err instanceof Error && !err.message.startsWith('[')) throw err
            lastError = err instanceof Error ? err : new Error(String(err))
        } finally {
            clearTimeout(timer)
        }
    }

    throw new Error(`Gemini vision: ${lastError.message}`)
}

// ── Groq caller (gratis 14.400 req/hari) ─────────────────────────────────────

async function callGroqKey(
    apiKey: string,
    systemPrompt: string,
    userMessage: string,
    maxTokens = 400
): Promise<{ text: string; usage: AiTokenUsageMeta | null }> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            max_tokens: maxTokens,
            temperature: 0.7,
        }),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = (err as { error?: { message?: string } })?.error?.message ?? res.statusText
        throw new Error(`Groq error ${res.status}: ${msg}`)
    }
    const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[]
        usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
    }
    const text = data?.choices?.[0]?.message?.content ?? ''
    return { text, usage: mergeOpenAiCompatibleUsage(data, 'groq') }
}

// ── Main dispatcher: Gemini → Groq → OpenAI ──────────────────────────────────

async function callAI(
    geminiKeysStr: string,
    systemPrompt: string,
    userMessage: string,
    opts: { maxTokens?: number; openaiKeys?: string; groqKeys?: string } = {}
): Promise<string> {
    const r = await callAIWithUsage(geminiKeysStr, systemPrompt, userMessage, opts)
    return r.text
}

/**
 * Urutan: **semua** key Gemini (rotasi jika gagal) → Groq → OpenAI.
 * Key banyak dipisah koma di Pengaturan; `rotateToNextKey` memajukan indeks saat key ini error.
 */
export async function callAIWithUsage(
    geminiKeysStr: string,
    systemPrompt: string,
    userMessage: string,
    opts: {
        maxTokens?: number
        openaiKeys?: string
        groqKeys?: string
        /** Gemini saja: sedikit lebih deterministik (mis. JSON TikTok) */
        geminiTemperature?: number
    } = {}
): Promise<{ text: string; usage: AiTokenUsageMeta; provider: 'gemini' | 'groq' | 'openai' }> {
    const { maxTokens = 400, openaiKeys = '', groqKeys = '', geminiTemperature } = opts
    const geminiKeys = parseKeys(geminiKeysStr)
    const groqParsed = parseKeys(groqKeys)
    const openaiParsed = parseKeys(openaiKeys)
    let lastError: Error = new Error('Tidak ada API key')

    const finish = (text: string, usage: AiTokenUsageMeta | null, provider: 'gemini' | 'groq' | 'openai') => {
        if (usage) {
            return { text, usage: { ...usage, provider: usage.provider ?? provider }, provider }
        }
        const e = estimateTokenUsage(systemPrompt, userMessage, text)
        return {
            text,
            usage: { ...e, provider, source: 'estimated' as const },
            provider,
        }
    }

    // 1. Gemini
    for (const key of geminiKeys) {
        try {
            const { text, usage } = await callGeminiWithKey(
                key,
                systemPrompt,
                userMessage,
                maxTokens,
                25_000,
                geminiTemperature != null ? { temperature: geminiTemperature } : undefined
            )
            return finish(text, usage, 'gemini')
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err))
            rotateToNextKey('gemini', geminiKeysStr)
        }
    }

    // 2. Groq (gratis)
    for (const key of groqParsed) {
        try {
            const { text, usage } = await callGroqKey(key, systemPrompt, userMessage, maxTokens)
            return finish(text, usage, 'groq')
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err))
            rotateToNextKey('groq', groqKeys)
        }
    }

    // 3. OpenAI (berbayar, fallback terakhir)
    for (const key of openaiParsed) {
        try {
            const { callOpenAIWithUsage } = await import('./openai')
            const { text, usage } = await callOpenAIWithUsage(key, systemPrompt, userMessage, maxTokens)
            const meta: AiTokenUsageMeta | null = usage
                ? {
                      promptTokens: usage.promptTokens,
                      completionTokens: usage.completionTokens,
                      totalTokens: usage.totalTokens,
                      source: 'provider' as const,
                      provider: 'openai' as const,
                  }
                : null
            return finish(text, meta, 'openai')
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err))
            rotateToNextKey('openai', openaiKeys)
        }
    }

    throw new Error(`Semua API habis. ${lastError.message}`)
}

// ── Exported functions ────────────────────────────────────────────────────────

export async function generateIdeaPrompts(
    geminiKeys: string,
    input: IdeaInput,
    openaiKeys?: string,
    groqKeys?: string
): Promise<IdeaResult[]> {
    // Ideas butuh lebih banyak token karena JSON array
    const userMsg = `Objek: ${input.objectType}\nKondisi: ${input.initialCondition}\nGaya: ${input.visualStyle}`
    try {
        const raw = await callAI(geminiKeys, SYS_IDEAS, userMsg, { maxTokens: 1500, openaiKeys, groqKeys })
        let cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
        const arrayMatch = cleaned.match(/\[[\s\S]*\]/)
        if (arrayMatch) cleaned = arrayMatch[0]
        cleaned = cleaned.replace(/,\s*([\]}])/g, '$1')
        return JSON.parse(cleaned) as IdeaResult[]
    } catch {
        if (parseKeys(openaiKeys ?? '').length > 0) {
            for (const key of parseKeys(openaiKeys!)) {
                try { return await generateIdeaPromptsOpenAI(key, input) } catch { continue }
            }
        }
        throw new Error('Semua API key gagal.')
    }
}

export async function generateImagePrompt(
    geminiKeys: string,
    context: SceneContext,
    openaiKeys?: string,
    groqKeys?: string
): Promise<string> {
    const userMsg = `Scene: ${context.sceneName}\nDesc: ${context.sceneDescription}\nCat: ${context.category}\nStyle: ${context.visualStyle}\nProject: ${context.projectName}`
    try {
        return await callAI(geminiKeys, SYS_IMAGE, userMsg, { maxTokens: 80, openaiKeys, groqKeys })
    } catch {
        for (const key of parseKeys(openaiKeys ?? '')) {
            try { return await generateImagePromptOpenAI(key, context) } catch { continue }
        }
        throw new Error('Semua API key gagal.')
    }
}

export async function generateVideoPrompt(
    geminiKeys: string,
    context: SceneContext,
    imagePrompt: string,
    openaiKeys?: string,
    groqKeys?: string
): Promise<string> {
    // Potong image prompt jika terlalu panjang untuk hemat token input
    const imgRef = imagePrompt.length > 300 ? imagePrompt.slice(0, 300) + '...' : imagePrompt
    const userMsg = `Scene: ${context.sceneName}\nDesc: ${context.sceneDescription}\nStyle: ${context.visualStyle}\nImg ref: ${imgRef}`
    try {
        return await callAI(geminiKeys, SYS_VIDEO, userMsg, { maxTokens: 80, openaiKeys, groqKeys })
    } catch {
        for (const key of parseKeys(openaiKeys ?? '')) {
            try { return await generateVideoPromptOpenAI(key, context, imagePrompt) } catch { continue }
        }
        throw new Error('Semua API key gagal.')
    }
}

export async function generateAudioPrompt(
    geminiKeys: string,
    context: SceneContext,
    videoPrompt: string,
    openaiKeys?: string,
    groqKeys?: string
): Promise<string> {
    const vidRef = videoPrompt.length > 300 ? videoPrompt.slice(0, 300) + '...' : videoPrompt
    const userMsg = `Scene: ${context.sceneName}\nAction Context: ${vidRef}\nGenerate high-fidelity ASMR soundscape prompt.`
    try {
        return await callAI(geminiKeys, SYS_AUDIO, userMsg, { maxTokens: 60, openaiKeys, groqKeys })
    } catch {
        // Fallback placeholder as we don't have openAI specific audio yet, but Groq/OpenAI will still work via callAI directly because callAI already has fallback chain internally.
        // Wait, callAI natively loops over Gemini -> Groq -> OpenAI! So the try block above covers all keys using callAI anyway!
        return "[SFX Placeholder]"
    }
}

export async function refinePrompt(
    geminiKeys: string,
    currentPrompt: string,
    instruction: string,
    type: 'image' | 'video',
    openaiKeys?: string,
    groqKeys?: string
): Promise<string> {
    const sys = type === 'image' ? SYS_REFINE_IMAGE : SYS_REFINE_VIDEO
    // Potong prompt jika panjang
    const prompt = currentPrompt.length > 400 ? currentPrompt.slice(0, 400) + '...' : currentPrompt
    const userMsg = `Prompt:\n${prompt}\n\nInstruction: ${instruction}`
    try {
        return await callAI(geminiKeys, sys, userMsg, { maxTokens: 350, openaiKeys, groqKeys })
    } catch {
        for (const key of parseKeys(openaiKeys ?? '')) {
            try { return await refinePromptOpenAI(key, currentPrompt, instruction, type) } catch { continue }
        }
        throw new Error('Semua API key gagal.')
    }
}

// ── Timelapse International Ideas ────────────────────────────────────────────

export interface TimelapseInternationalIdeaItem {
    titleEN: string
    hookEN: string
    descriptionID: string
    hashtags: string[]
    platforms: string[]
    globalAppeal: string
}

export interface TimelapseInternationalIdeasInput {
    mode: 'cabin' | 'restorasi'
    searchQuery: string
}

const SYS_INTL_IDEAS = `Viral short-form content strategist for YouTube Shorts, TikTok, Reels. Target: international English-first FYP.
Return ONLY JSON array, no markdown, exactly 4 objects with keys:
titleEN(string,max90chars), hookEN(string,max220chars), descriptionID(2-3 sentences Bahasa Indonesia), hashtags(6-10 strings starting #), platforms(subset of YouTube Shorts/TikTok/Instagram Reels), globalAppeal(1 sentence English).
Lean into: ASMR, satisfying transformation, no-dialog, emotional payoff.`

function parseIntlIdeas(raw: string): TimelapseInternationalIdeaItem[] {
    // Strip markdown fences
    let cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()

    // Ekstrak array JSON jika ada teks sebelum/sesudah
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/)
    if (arrayMatch) cleaned = arrayMatch[0]

    // Fix trailing commas sebelum ] atau }
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1')

    let parsed: unknown
    try {
        parsed = JSON.parse(cleaned)
    } catch {
        // Coba potong sampai item terakhir yang valid
        const lastBrace = cleaned.lastIndexOf('}')
        if (lastBrace > 0) {
            try {
                parsed = JSON.parse(cleaned.slice(0, lastBrace + 1) + ']')
            } catch {
                throw new Error('Respons AI bukan JSON valid. Coba generate ulang.')
            }
        } else {
            throw new Error('Respons AI bukan JSON valid. Coba generate ulang.')
        }
    }

    const arr = Array.isArray(parsed) ? parsed : (parsed as { ideas?: unknown }).ideas
    if (!Array.isArray(arr)) throw new Error('Format tidak dikenali')
    return arr.slice(0, 6).map((item: Record<string, unknown>) => ({
        titleEN: String(item.titleEN ?? ''),
        hookEN: String(item.hookEN ?? ''),
        descriptionID: String(item.descriptionID ?? ''),
        hashtags: Array.isArray(item.hashtags) ? item.hashtags.map(String) : [],
        platforms: Array.isArray(item.platforms) ? item.platforms.map(String) : [],
        globalAppeal: String(item.globalAppeal ?? ''),
    }))
}

export async function generateTimelapseInternationalIdeas(
    geminiKeys: string,
    input: TimelapseInternationalIdeasInput,
    openaiKeys?: string,
    groqKeys?: string
): Promise<TimelapseInternationalIdeaItem[]> {
    const modeLabel = input.mode === 'cabin'
        ? 'cabin build / outdoor construction timelapse'
        : 'restoration / workshop satisfying ASMR timelapse'

    const userMsg = input.searchQuery.trim()
        ? `Niche: "${input.searchQuery}". Mode: ${modeLabel}. Generate 4 distinct global ideas.`
        : `Mode: ${modeLabel}. Generate 4 diverse high-potential ideas for global audiences.`

    const raw = await callAI(geminiKeys, SYS_INTL_IDEAS, userMsg, {
        maxTokens: 700,
        openaiKeys,
        groqKeys,
    })
    return parseIntlIdeas(raw)
}

// ── Per-second video breakdown ────────────────────────────────────────────────

export interface VideoSecondEntry {
    second: number
    action: string
    camera: string
    subject: string
}

export interface VideoSecondsBreakdown {
    totalSeconds: number
    fps: number
    colorGrade: string
    cameraLock: string
    seconds: VideoSecondEntry[]
}

export async function generateVideoSecondsBreakdown(
    geminiKeys: string,
    imagePrompt: string,
    videoPrompt: string,
    durationSeconds: number,
    openaiKeys?: string,
    groqKeys?: string
): Promise<VideoSecondsBreakdown> {
    const userMsg = `Duration: ${durationSeconds} seconds. Generate per-second breakdown.
Image prompt (visual reference): ${imagePrompt.slice(0, 200)}
Video concept: ${videoPrompt.slice(0, 200)}`

    const raw = await callAI(geminiKeys, SYS_VIDEO_SECONDS, userMsg, {
        maxTokens: 800,
        openaiKeys,
        groqKeys,
    })

    let cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
    const objMatch = cleaned.match(/\{[\s\S]*\}/)
    if (objMatch) cleaned = objMatch[0]
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1')

    return JSON.parse(cleaned) as VideoSecondsBreakdown
}

// ── Continue Story ────────────────────────────────────────────────────────────

export interface ContinueStoryResult {
    sceneTitle: string
    sceneSummary: string
    imagePrompt: string
    videoPrompt: string
    continuityNote: string
}

export async function generateContinueStory(
    geminiKeys: string,
    previousContext: {
        projectTitle: string
        previousSceneTitle: string
        previousImagePrompt: string
        previousVideoPrompt: string
        storyProgress: string // e.g. "foundation done, walls started"
        nextFocus: string // e.g. "interior framing", "roof installation", "window details"
    },
    durationHint: string,
    openaiKeys?: string,
    groqKeys?: string
): Promise<ContinueStoryResult> {
    const userMsg = `Project: ${previousContext.projectTitle}
Previous scene: ${previousContext.previousSceneTitle}
Story progress: ${previousContext.storyProgress}
Next focus: ${previousContext.nextFocus}
Video format: ${durationHint}

Previous image prompt (MUST maintain same subject/location):
${previousContext.previousImagePrompt.slice(0, 250)}

Previous video prompt:
${previousContext.previousVideoPrompt.slice(0, 200)}`

    const raw = await callAI(geminiKeys, SYS_CONTINUE_STORY, userMsg, {
        maxTokens: 700,
        openaiKeys,
        groqKeys,
    })

    let cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
    const objMatch = cleaned.match(/\{[\s\S]*\}/)
    if (objMatch) cleaned = objMatch[0]
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1')

    return JSON.parse(cleaned) as ContinueStoryResult
}

// ── TikTok Affiliate — pasar Indonesia (Bahasa Indonesia) ───────────────────

const SYS_TIKTOK_JSON_KEYS = `Keluaran HANYA JSON valid, tanpa markdown. Format:
{"hook":"string","caption":"string","hashtags":["#tag1",...],"callToAction":"string","shootingTip":"string","videoPrompt":"string","rencanaShot":"string"}`

const SYS_TIKTOK_AFFILIATE_BASE = `Ahli copy affiliate TikTok Indonesia (TikTok Shop/Shopee/Tokopedia). ${SYS_TIKTOK_JSON_KEYS}
SKOP TUGAS: Hanya konten affiliate/UGC/review produk untuk TikTok & e-commerce Indonesia. Jangan menyebut restorasi, kabin, timelapse, workshop, atau fitur lain di luar jualan produk.
VISUAL (wajib): UGC fotorealistik—kamera HP, cahaya alami, gerakan & tekstur seperti dunia nyata. LARANG menyutradarai gaya anime/kartun/ilustrasi/3D CGI, kulit plastik, lighting fantasi, atau “cinematic” berlebihan ala game.
KONTINUITAS (wajib di videoPrompt + rencanaShot): produk & outfit (warna/potongan/motif) tidak berubah antar shot/klip; talent/identitas sama seperti field talent di user message; jangan ganti baju atau produk lain.
SUARA: ikuti field audio di user message. audio:silent = tanpa VO/narasi; karakter tidak berbicara; tanpa lip-sync; ambien pelan atau diam. audio:voice_id = VO singkat Bahasa Indonesia selaras hook; tanpa dialog bahasa asing. Jangan ulang narasi panjang yang sama di videoPrompt dan rencanaShot.
Hemat token: jawaban padat; tanpa pembuka/selipan meta; jangan ulang ide yang sama dalam beberapa field; hook tidak bertele-tele.
Aturan:
- Semua teks Bahasa Indonesia.
- Hook: 1-2 kalimat, 0-3 detik VO/teks layar.
- Caption: percakapan; \\n boleh. quick: caption boleh "".
- CTA: keranjang kuning/link bio/toko resmi.
- shootingTip: satu kalimat (framing, cahaya, pacing).
- videoPrompt: padat; 9:16 atau 16:9; talent+produk; selaras adegan & ekspresi; sebut kontinuitas outfit/produk & talent. Sertakan larangan visual: tanpa watermark platform, tanpa logo aplikasi, tanpa teks/UI mengambang; layar penuh seperti rekaman nyata. Maks ~750–900 karakter.
- rencanaShot: \\n antar baris; minimal 5 shot bertiming; manusia UGC (bobot badan, jeda, mikro-gesture); tanpa watermark/logo platform di akhir. Maks ~1400–1600 karakter (cukup jelas; jangan copy-paste narasi videoPrompt). Jika user message berisi durTotal lebih besar dari clipMax (mis. 24s vs 8s), bagi timeline per KLIP/blok: tiap blok maks clipMax detik; sebut waktu relatif per blok; akhiri tiap blok dengan sambungan pose ke blok berikutnya (kecuali blok terakhir).
- hashtags: 8-12; campur #fypindonesia #racuntiktok + niche.
- Larangan: janji medis/penghasilan, klaim palsu, ilegal.`

const SYS_TIKTOK_AFFILIATE_PRO = `
Mode Pro: hook = curiosity + nama produk; CTA spesifik platform; 2-3 hashtag niche produk; videoPrompt: cahaya alami + gerakan kamera seperti HP; rencanaShot: tiap baris sebut durasi; tetap fotorealistik UGC (bukan kartun/CGI).`

/** Tambah larangan/realism hanya jika belum ada di teks model (hindari duplikasi token). */
function appendMissingVideoRules(videoPrompt: string): string {
    let out = videoPrompt.trim()
    const hasLarangan = out.includes('tanpa watermark') || out.includes('watermark TikTok')
    const hasRealism = out.includes('Fotorealistik') || out.includes('fotorealistik UGC')
    if (!hasLarangan) {
        out += `\n\nLarangan visual: ${PROMPT_VIDEO_BERSIH}.`
    }
    if (!hasRealism) {
        out += `\n${PROMPT_TIKTOK_REALISM_SUFFIX}`
    }
    return out.trim()
}

function buildCompactTikTokUserMessage(input: TikTokLocalInput): string {
    const scene = describeSceneForPrompt(input.scenePreset)
    const expr = describeExpressionForPrompt(input.expressionPreset, input.expressionNote)
    const fmt = input.screenFormat === 'portrait' ? '9:16' : '16:9'
    return [
        `prd:${input.productName.trim() || '-'}`,
        `cat:${input.category}`,
        `harga:${input.priceHint.trim() || '-'}`,
        `fitur:${input.features.trim() || '-'}`,
        `aud:${input.targetAudience}`,
        `brand:${input.brand.trim() || '-'}`,
        `tone:${input.tone}`,
        `plat:${input.platform}`,
        `fmt:${fmt}`,
        `mode:${input.mode}`,
        `wear:${input.wearableItem}`,
        `talent:${input.whoInVideo.trim() || '(bebas)'}`,
        `scene:${input.scenePreset}`,
        scene ? `sceneDet:${scene}` : 'sceneDet:bebas',
        `expr:${input.expressionPreset}`,
        `exprDet:${expr}`,
        `clipMax:${input.clipSegmentSeconds ?? 8}s`,
        `durTotal:${input.durationSeconds ?? 8}s`,
        `audio:${input.videoAudioMode ?? 'silent'}`,
    ].join('\n')
}

export async function generateTikTokAffiliateIndonesiaAI(
    geminiKeys: string,
    input: TikTokLocalInput,
    openaiKeys?: string,
    groqKeys?: string,
    options?: TikTokAffiliateAiOptions
): Promise<TikTokAffiliateAiResult> {
    const quality = options?.quality ?? 'standard'
    const vi = options?.variantIndex ?? 0
    const vt = Math.max(1, options?.variantTotal ?? 1)
    const systemPrompt =
        quality === 'pro'
            ? `${SYS_TIKTOK_AFFILIATE_BASE}${SYS_TIKTOK_AFFILIATE_PRO}`
            : SYS_TIKTOK_AFFILIATE_BASE

    const variantHint =
        vt > 1
            ? `\nvarian:${vi + 1}/${vt}\nWAJIB: pose tubuh & sudut/gerakan kamera berbeda dari varian lain; jangan duplikat adegan atau framing yang sama.`
            : ''
    const userMsg = buildCompactTikTokUserMessage(input) + variantHint
    const maxTokens = quality === 'pro' ? 900 : 560

    const { text: raw, usage } = await callAIWithUsage(geminiKeys, systemPrompt, userMsg, {
        maxTokens,
        openaiKeys,
        groqKeys,
        geminiTemperature: 0.72,
    })

    let cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
    const objMatch = cleaned.match(/\{[\s\S]*\}/)
    if (objMatch) cleaned = objMatch[0]
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1')

    const parsed = JSON.parse(cleaned) as Record<string, unknown>
    const hashtags = Array.isArray(parsed.hashtags)
        ? (parsed.hashtags as unknown[]).map((h) => String(h))
        : []

    const hook = String(parsed.hook ?? '')
    const caption = String(parsed.caption ?? '')
    const callToAction = String(parsed.callToAction ?? '')
    const shootingTip = String(parsed.shootingTip ?? '')
    let videoPrompt = String(parsed.videoPrompt ?? '')
    let rencanaShot = String(parsed.rencanaShot ?? '')

    if (!videoPrompt.trim()) {
        videoPrompt = buildVideoPromptBundle(input, vi).videoPrompt
    } else {
        const trimmed = videoPrompt.trim()
        const hasContinuity = /kontinuitas/i.test(trimmed)
        videoPrompt = hasContinuity ? trimmed : `${trimmed}\n\n${buildVisualContinuityRules(input)}`
        videoPrompt = appendMissingVideoRules(videoPrompt)
    }
    if (!rencanaShot.trim()) {
        rencanaShot = buildDirectorShotPlan(input, vi).rencanaShot
    } else {
        rencanaShot = wrapShotPlanForDuration(input, rencanaShot.trim())
    }

    const shotOut = rencanaShot.includes('watermark') || rencanaShot.includes('Watermark')
        ? rencanaShot
        : `${rencanaShot.trim()}\nOutput: tanpa watermark/logo platform; tanpa teks UI di layar.`

    return {
        result: {
            hook,
            caption,
            hashtags: hashtags.slice(0, 14),
            callToAction,
            shootingTip,
            videoPrompt,
            rencanaShot: shotOut,
        },
        usage,
    }
}

// ── Filmmaker — ide → adegan + prompt visual per adegan ─────────────────────

const SYS_FILMMAKER_SCENES = `Sutradara pembantu film pendek. Keluaran HANYA JSON valid, tanpa markdown.
Format: {"scenes":[{"title":"string","imagePrompt":"string"}]}
Jumlah elemen scenes harus sama dengan sceneCount di pesan user.
Bahasa Indonesia. title: judul adegan singkat. imagePrompt: 2-4 kalimat — deskripsi visual sinematik untuk key frame / still film (fotorealistik, bukan kartun); komposisi, cahaya, emosi; konsisten kontinuitas karakter/lokasi bila ide menyebutkan; tanpa watermark/logo platform di instruksi.`

export async function generateFilmmakerScenesAI(
    geminiKeys: string,
    idea: string,
    sceneCount: number,
    openaiKeys?: string,
    groqKeys?: string
): Promise<{ scenes: FilmmakerSceneItem[]; usage: AiTokenUsageMeta }> {
    const n = Math.min(20, Math.max(1, Math.floor(sceneCount)))
    const userMsg = `ide:${idea.trim()}\nsceneCount:${n}`
    const { text, usage } = await callAIWithUsage(geminiKeys, SYS_FILMMAKER_SCENES, userMsg, {
        maxTokens: Math.min(8192, 320 + n * 380),
        openaiKeys,
        groqKeys,
        geminiTemperature: 0.65,
    })

    let cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
    const objMatch = cleaned.match(/\{[\s\S]*\}/)
    if (objMatch) cleaned = objMatch[0]
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1')

    const parsed = JSON.parse(cleaned) as { scenes?: unknown[] }
    const raw = Array.isArray(parsed.scenes) ? parsed.scenes : []
    const scenes: FilmmakerSceneItem[] = raw.slice(0, n).map((s, i) => {
        const o = (s ?? {}) as Record<string, unknown>
        return {
            id: `fm-${i}-${Date.now()}-${i}`,
            title: String(o.title ?? `Adegan ${i + 1}`).trim() || `Adegan ${i + 1}`,
            imagePrompt: String(o.imagePrompt ?? '').trim(),
        }
    })

    const fallbackAll = buildLocalFilmmakerScenes(idea, n)
    while (scenes.length < n) {
        const i = scenes.length
        scenes.push({
            id: `fm-pad-${i}-${Date.now()}`,
            title: fallbackAll[i]?.title ?? `Adegan ${i + 1}`,
            imagePrompt: fallbackAll[i]?.imagePrompt ?? '',
        })
    }

    for (let i = 0; i < scenes.length; i++) {
        if (!scenes[i]!.imagePrompt.trim()) {
            scenes[i]!.imagePrompt = fallbackAll[i]?.imagePrompt ?? scenes[i]!.imagePrompt
        }
    }

    return { scenes: scenes.slice(0, n), usage }
}

// ── Iklan produk (parfum, skincare, …) — gambar + copy + arahan syuting ─────

const SYS_PRODUCT_AD_INDONESIA = `Creative director iklan produk untuk pasar Indonesia (spot TV/OL/digital).
Keluaran HANYA JSON valid, tanpa markdown. Format:
{"headline":"string","hook":"string","bodyCopy":"string","videoPrompt":"string","shotList":"string","lightingMood":"string","callToAction":"string","hashtags":["#tag1",...]}
Bahasa Indonesia (merek asing boleh dipertahankan).
Jika gambar produk dilampirkan: samakan visual kemasan, warna, bentuk, dan gaya pada shot list & videoPrompt agar konsisten seperti iklan profesional.
videoPrompt: satu paragraf padat — arahan produksi video (kamera, pacing, transisi, mood) untuk AI video atau briefing crew.
shotList: string dengan \\n antar baris; 4–6 shot; sebut perkiraan detik per shot.
Larangan: klaim medis, janji penghasilan, testimoni palsu. Instruksi visual: tanpa watermark/logo platform; full frame bersih.`

function buildProductAdUserMessage(input: ProductAdInput): string {
    return [
        `nama produk:${input.productName.trim() || '-'}`,
        `kategori:${input.category}`,
        `merek:${input.brand?.trim() || '-'}`,
        `catatan:${input.extraNotes?.trim() || '-'}`,
    ].join('\n')
}

function mergeProductAdFromJson(
    parsed: Record<string, unknown>,
    fallback: ProductAdResult
): ProductAdResult {
    const hashtags = Array.isArray(parsed.hashtags)
        ? (parsed.hashtags as unknown[]).map((h) => String(h)).slice(0, 14)
        : fallback.hashtags

    return {
        headline: String(parsed.headline ?? fallback.headline).trim() || fallback.headline,
        hook: String(parsed.hook ?? fallback.hook).trim() || fallback.hook,
        bodyCopy: String(parsed.bodyCopy ?? fallback.bodyCopy).trim() || fallback.bodyCopy,
        videoPrompt: String(parsed.videoPrompt ?? fallback.videoPrompt).trim() || fallback.videoPrompt,
        shotList: String(parsed.shotList ?? fallback.shotList).trim() || fallback.shotList,
        lightingMood: String(parsed.lightingMood ?? fallback.lightingMood).trim() || fallback.lightingMood,
        callToAction: String(parsed.callToAction ?? fallback.callToAction).trim() || fallback.callToAction,
        hashtags: hashtags.length ? hashtags : fallback.hashtags,
    }
}

export type ProductAdAiResult = {
    result: ProductAdResult
    usage: AiTokenUsageMeta
}

export async function generateProductAdIndonesiaAI(
    geminiKeys: string,
    input: ProductAdInput,
    imageDataUrl: string | null | undefined,
    openaiKeys?: string,
    groqKeys?: string
): Promise<ProductAdAiResult> {
    const fallback = buildLocalProductAd(input)
    const userMsg = buildProductAdUserMessage(input)
    const geminiKeyList = parseKeys(geminiKeys)
    const firstGemini = geminiKeyList[0]
    const hasValidImage = Boolean(imageDataUrl && parseInlineImageBase64(imageDataUrl))

    let rawText: string
    let usage: AiTokenUsageMeta

    if (hasValidImage && firstGemini) {
        const { text, usage: u } = await callGeminiWithKeyVision(
            firstGemini,
            SYS_PRODUCT_AD_INDONESIA,
            userMsg,
            imageDataUrl!,
            2200,
            55_000,
            { temperature: 0.62 }
        )
        rawText = text
        usage =
            u ??
            estimateTokenUsage(SYS_PRODUCT_AD_INDONESIA, `${userMsg}[gambar]`, rawText)
    } else {
        const suffix =
            imageDataUrl && !firstGemini
                ? '\n(catatan: pengguna mengunggah gambar produk; gemini vision tidak tersedia—infer dari nama & kategori.)'
                : ''
        const { text, usage: u } = await callAIWithUsage(
            geminiKeys,
            SYS_PRODUCT_AD_INDONESIA,
            userMsg + suffix,
            {
                maxTokens: 2000,
                openaiKeys,
                groqKeys,
                geminiTemperature: 0.62,
            }
        )
        rawText = text
        usage = u
    }

    let cleaned = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
    const objMatch = cleaned.match(/\{[\s\S]*\}/)
    if (objMatch) cleaned = objMatch[0]
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1')

    try {
        const parsed = JSON.parse(cleaned) as Record<string, unknown>
        return {
            result: mergeProductAdFromJson(parsed, fallback),
            usage,
        }
    } catch {
        return {
            result: fallback,
            usage,
        }
    }
}
