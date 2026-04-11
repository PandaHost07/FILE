'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check, Loader2, AlertTriangle, ArrowRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import useAppStore from '@/store/useAppStore'
import { recordApiUsage } from '@/lib/apiUsageTracker'

const ENHANCE_MODES = [
    {
        id: 'ultra-detail',
        label: 'Ultra Detail',
        desc: 'Tambah detail ekstrem — lighting, texture, camera, color grading',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/40',
    },
    {
        id: 'cinematic',
        label: 'Cinematic',
        desc: 'Gaya sinematik profesional seperti film Hollywood',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/40',
    },
    {
        id: 'documentary',
        label: 'Documentary',
        desc: 'Gaya dokumenter realistik dan raw',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/40',
    },
    {
        id: 'timelapse',
        label: 'Timelapse Video',
        desc: 'Optimasi untuk video timelapse restorasi',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/40',
    },
]

const SYSTEM_PROMPTS: Record<string, string> = {
    'ultra-detail': `You are an elite AI image prompt engineer. Your job is to take a short, simple prompt and expand it into an extremely detailed, professional-grade image prompt.

Rules:
- Expand to 150-250 words
- Add: specific lighting (type, direction, quality, color temperature), material textures (grain, patina, wear patterns), camera specifications (brand, model, lens, aperture, focal length), color grading (tones, contrast, saturation), environmental details, atmospheric elements
- Keep the core subject intact
- English only, one flowing paragraph
- Make it photorealistic and highly specific
Return ONLY the enhanced prompt.`,

    cinematic: `You are a Hollywood cinematographer and AI prompt expert. Transform the given prompt into a cinematic masterpiece prompt.

Rules:
- Add cinematic language: "shot on ARRI Alexa", "anamorphic lens", "film grain", "color grade"
- Include: dramatic lighting setup, lens flare, bokeh, depth of field
- Reference famous cinematographers or films if relevant
- Add mood and atmosphere descriptors
- 150-200 words, English only, one paragraph
Return ONLY the enhanced prompt.`,

    documentary: `You are a documentary filmmaker and AI prompt expert. Transform the given prompt into a raw, authentic documentary-style prompt.

Rules:
- Emphasize authenticity and realism
- Add: natural lighting, handheld camera feel, environmental context, human element
- Include: "documentary photography", "photojournalism style", "natural light"
- Keep it gritty and real, avoid over-stylized language
- 120-180 words, English only
Return ONLY the enhanced prompt.`,

    timelapse: `You are an expert timelapse videographer and AI video prompt engineer. Transform the given prompt into a detailed timelapse video prompt.

Rules:
- Describe the transformation process explicitly (start → end state)
- Add: camera movement (static/pan/zoom), speed (fast/slow timelapse), duration
- Include: lighting changes over time, transition quality, mood progression
- Mention target platform: "suitable for Runway Gen-3, Kling AI, or Pika"
- 120-180 words, English only
Return ONLY the enhanced prompt.`,
}

async function enhancePrompt(apiKey: string, input: string, mode: string): Promise<string> {
    const models = ['gemini-2.5-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-flash-8b']
    for (const model of models) {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: SYSTEM_PROMPTS[mode] }] },
                    contents: [{ role: 'user', parts: [{ text: input }] }],
                }),
            }
        )
        if (res.status === 429) continue
        if (!res.ok) throw new Error('Gagal enhance prompt')
        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        recordApiUsage('gemini')
        return text
    }
    throw new Error('Quota habis, coba lagi nanti')
}

export default function PromptEnhancerPage() {
    const { apiKeys } = useAppStore()
    const [input, setInput] = useState('')
    const [mode, setMode] = useState('ultra-detail')
    const [result, setResult] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [history, setHistory] = useState<{ input: string; result: string; mode: string }[]>([])
    const [showHistory, setShowHistory] = useState(false)

    async function handleEnhance() {
        if (!input.trim() || !apiKeys.gemini) return
        setIsLoading(true)
        setError(null)
        try {
            const out = await enhancePrompt(apiKeys.gemini, input, mode)
            setResult(out)
            setHistory((prev) => [{ input, result: out, mode }, ...prev.slice(0, 9)])
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

    const selectedMode = ENHANCE_MODES.find((m) => m.id === mode)!

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="mx-auto max-w-3xl space-y-6">

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="size-5 text-amber-400" />
                        <h1 className="text-2xl font-bold text-zinc-100">Prompt Enhancer</h1>
                    </div>
                    <p className="text-zinc-400 text-sm">Ubah prompt pendek menjadi prompt super detail dan profesional</p>
                </div>

                {!apiKeys.gemini && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-800/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-300">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <span>Gemini API key belum dikonfigurasi. <Link href="/settings" className="underline hover:text-amber-200">Buka Pengaturan</Link></span>
                    </div>
                )}

                {/* Mode selector */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mode Enhancement</p>
                    <div className="grid grid-cols-2 gap-2">
                        {ENHANCE_MODES.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`rounded-xl border p-3 text-left transition-all ${mode === m.id ? `${m.border} ${m.bg}` : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                    }`}
                            >
                                <p className={`text-sm font-semibold ${mode === m.id ? m.color : 'text-zinc-200'}`}>{m.label}</p>
                                <p className="text-xs text-zinc-500 mt-0.5 leading-tight">{m.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Prompt Pendek Kamu</label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        rows={4}
                        placeholder="Contoh: kursi kayu rusak di workshop, cahaya samping"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 resize-none transition-colors"
                    />
                </div>

                <button
                    onClick={handleEnhance}
                    disabled={isLoading || !input.trim() || !apiKeys.gemini}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none ${selectedMode.bg} ${selectedMode.color} border ${selectedMode.border} hover:opacity-90`}
                >
                    {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                    {isLoading ? 'Enhancing...' : `Enhance dengan mode ${selectedMode.label}`}
                </button>

                {error && (
                    <div className="rounded-xl border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>
                )}

                {/* Result */}
                {result && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hasil Enhanced Prompt</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                                >
                                    {copied ? <Check className="size-3 text-green-400" /> : <Copy className="size-3" />}
                                    {copied ? 'Tersalin!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                        <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-4">
                            <p className="text-sm text-zinc-200 leading-relaxed">{result}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setInput(result); setResult('') }}
                                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                            >
                                <ArrowRight className="size-3" /> Enhance lagi
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

                {/* History */}
                {history.length > 0 && (
                    <div className="space-y-2">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            <ChevronDown className={`size-3 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                            Riwayat ({history.length})
                        </button>
                        {showHistory && (
                            <div className="space-y-2">
                                {history.map((h, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setInput(h.input); setResult(h.result); setMode(h.mode) }}
                                        className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 hover:border-zinc-700 transition-colors"
                                    >
                                        <p className="text-xs text-zinc-500 truncate">{h.input}</p>
                                        <p className="text-[10px] text-zinc-600 mt-0.5">{ENHANCE_MODES.find(m => m.id === h.mode)?.label}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
