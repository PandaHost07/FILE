'use client'

import { useState } from 'react'
import { Languages, Copy, Check, Loader2, AlertTriangle, ArrowRight, Wand2 } from 'lucide-react'
import Link from 'next/link'
import useAppStore from '@/store/useAppStore'
import { recordApiUsage } from '@/lib/apiUsageTracker'

const AI_TARGETS = [
    { id: 'midjourney', label: 'Midjourney', desc: 'Optimized dengan style parameters' },
    { id: 'runway', label: 'Runway Gen-3', desc: 'Untuk video generation' },
    { id: 'kling', label: 'Kling AI', desc: 'Untuk video timelapse' },
    { id: 'imagen', label: 'Imagen 4', desc: 'Google image generation' },
    { id: 'stable', label: 'Stable Diffusion', desc: 'Dengan negative prompt' },
]

async function translatePrompt(apiKey: string, input: string, target: string): Promise<string> {
    const systemPrompts: Record<string, string> = {
        midjourney: `You are an expert Midjourney prompt engineer. Convert the user's description into a highly optimized Midjourney prompt.
Rules:
- Use comma-separated descriptors
- Add style parameters at the end: --ar 16:9 --style raw --q 2 --v 6
- Include: subject, environment, lighting, mood, camera, style
- Be extremely specific and visual
- English only
Return ONLY the prompt, nothing else.`,
        runway: `You are an expert Runway Gen-3 video prompt engineer. Convert the user's description into an optimized Runway video prompt.
Rules:
- Describe motion and camera movement explicitly
- Include: subject action, camera movement (pan/zoom/dolly), lighting, mood, duration hint
- Use cinematic language
- English only
Return ONLY the prompt, nothing else.`,
        kling: `You are an expert Kling AI video prompt engineer specializing in timelapse content. Convert the user's description into an optimized Kling prompt.
Rules:
- Focus on transformation and time progression
- Include: start state, end state, transition style, speed, lighting
- Mention "timelapse" explicitly
- English only
Return ONLY the prompt, nothing else.`,
        imagen: `You are an expert Google Imagen prompt engineer. Convert the user's description into a highly detailed Imagen prompt.
Rules:
- One detailed paragraph
- Include: subject detail, lighting (type, direction, quality), texture, camera specs, color grading
- Use photography terminology
- English only, photorealistic focus
Return ONLY the prompt, nothing else.`,
        stable: `You are an expert Stable Diffusion prompt engineer. Convert the user's description into an optimized SD prompt with negative prompt.
Rules:
- Positive prompt: detailed descriptors, art style, quality tags (masterpiece, best quality, 8k)
- Negative prompt: (bad anatomy:1.4), blurry, low quality, watermark
- Format: POSITIVE: [prompt] | NEGATIVE: [negative prompt]
- English only
Return ONLY in the specified format, nothing else.`,
    }

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompts[target] }] },
                contents: [{ role: 'user', parts: [{ text: input }] }],
            }),
        }
    )
    if (!res.ok) {
        // fallback model
        const res2 = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompts[target] }] },
                    contents: [{ role: 'user', parts: [{ text: input }] }],
                }),
            }
        )
        if (!res2.ok) throw new Error('Gagal translate prompt')
        const d = await res2.json()
        recordApiUsage('gemini')
        return d?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    }
    const data = await res.json()
    recordApiUsage('gemini')
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export default function PromptTranslatorPage() {
    const { apiKeys } = useAppStore()
    const [input, setInput] = useState('')
    const [target, setTarget] = useState('midjourney')
    const [result, setResult] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    async function handleTranslate() {
        if (!input.trim() || !apiKeys.gemini) return
        setIsLoading(true)
        setError(null)
        try {
            const out = await translatePrompt(apiKeys.gemini, input, target)
            setResult(out)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCopy() {
        await navigator.clipboard.writeText(result)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="mx-auto max-w-3xl space-y-6">

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Languages className="size-5 text-blue-400" />
                        <h1 className="text-2xl font-bold text-zinc-100">Prompt Translator</h1>
                    </div>
                    <p className="text-zinc-400 text-sm">Ubah deskripsi bahasa Indonesia menjadi prompt AI yang optimal untuk berbagai platform</p>
                </div>

                {!apiKeys.gemini && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-800/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-300">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <span>Gemini API key belum dikonfigurasi. <Link href="/settings" className="underline hover:text-amber-200">Buka Pengaturan</Link></span>
                    </div>
                )}

                {/* Target AI */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Platform AI</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {AI_TARGETS.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTarget(t.id)}
                                className={`rounded-xl border p-3 text-left transition-all ${target === t.id
                                        ? 'border-amber-500/60 bg-amber-500/10'
                                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                    }`}
                            >
                                <p className={`text-xs font-semibold ${target === t.id ? 'text-amber-400' : 'text-zinc-200'}`}>{t.label}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{t.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Deskripsi Kamu (Bahasa Indonesia)</label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        rows={5}
                        placeholder="Contoh: kursi kayu antik yang sudah rusak parah, cat mengelupas, kaki patah, difoto di workshop dengan cahaya dari jendela samping..."
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 resize-none transition-colors"
                    />
                    <p className="text-xs text-zinc-600">{input.length} karakter</p>
                </div>

                <button
                    onClick={handleTranslate}
                    disabled={isLoading || !input.trim() || !apiKeys.gemini}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-400 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                    {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Languages className="size-4" />}
                    {isLoading ? 'Mentranslate...' : `Translate ke ${AI_TARGETS.find(t => t.id === target)?.label}`}
                </button>

                {error && (
                    <div className="rounded-xl border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>
                )}

                {/* Result */}
                {result && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                Hasil — {AI_TARGETS.find(t => t.id === target)?.label}
                            </p>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                            >
                                {copied ? <Check className="size-3 text-green-400" /> : <Copy className="size-3" />}
                                {copied ? 'Tersalin!' : 'Copy'}
                            </button>
                        </div>
                        <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-4">
                            <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{result}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setInput(result); setResult('') }}
                                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                            >
                                <Wand2 className="size-3" /> Refine lagi
                            </button>
                            <button
                                onClick={() => { setInput(''); setResult('') }}
                                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
