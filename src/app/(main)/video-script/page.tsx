'use client'

import { useState } from 'react'
import { FileVideo, Copy, Check, Loader2, AlertTriangle, Layers, Download } from 'lucide-react'
import Link from 'next/link'
import useAppStore from '@/store/useAppStore'
import { recordApiUsage } from '@/lib/apiUsageTracker'

const PLATFORMS = [
    { id: 'youtube', label: 'YouTube', desc: 'Script panjang dengan hook & CTA' },
    { id: 'tiktok', label: 'TikTok / Reels', desc: 'Script pendek 30-60 detik' },
    { id: 'instagram', label: 'Instagram', desc: 'Caption + script untuk Reels' },
]

const TONES = [
    { id: 'energetic', label: 'Energetik & Hype' },
    { id: 'calm', label: 'Tenang & Edukatif' },
    { id: 'storytelling', label: 'Storytelling' },
    { id: 'professional', label: 'Profesional' },
]

async function generateScript(
    apiKey: string,
    projectName: string,
    category: string,
    scenes: { name: string; description: string }[],
    platform: string,
    tone: string
): Promise<string> {
    const sceneList = scenes.map((s, i) => `${i + 1}. ${s.name}${s.description ? ': ' + s.description : ''}`).join('\n')

    const platformInstructions: Record<string, string> = {
        youtube: `Generate a complete YouTube video script (3-5 minutes) with:
- Hook (first 15 seconds - must grab attention)
- Introduction (project overview)
- Scene-by-scene narration (follow the scene order)
- Transformation reveal moment
- Call to action (subscribe, like, comment)
Format with clear sections: [HOOK], [INTRO], [SCENE X], [REVEAL], [CTA]`,
        tiktok: `Generate a TikTok/Reels script (30-60 seconds) with:
- Instant hook (first 3 seconds)
- Quick scene highlights (2-3 key moments)
- Satisfying reveal
- Trending-style CTA
Keep it punchy and fast-paced. Format: [HOOK], [HIGHLIGHTS], [REVEAL], [CTA]`,
        instagram: `Generate an Instagram Reels script + caption with:
- Script: 30-45 second narration
- Caption: engaging description with emojis
- Hashtags: 20-30 relevant hashtags
Format: [SCRIPT], [CAPTION], [HASHTAGS]`,
    }

    const toneInstructions: Record<string, string> = {
        energetic: 'Use high energy, enthusiastic language. Short punchy sentences. Lots of excitement.',
        calm: 'Use calm, educational tone. Explain the process clearly. Informative and trustworthy.',
        storytelling: 'Tell it as a story. Build emotional connection. Focus on the journey and transformation.',
        professional: 'Professional and authoritative tone. Focus on craftsmanship and expertise.',
    }

    const systemPrompt = `You are an expert content creator and video scriptwriter specializing in restoration content.
${platformInstructions[platform]}
Tone: ${toneInstructions[tone]}
Language: Bahasa Indonesia
Make it engaging, authentic, and optimized for the platform.`

    const userMessage = `Project: ${projectName}
Category: ${category}
Scenes:
${sceneList}`

    const models = ['gemini-2.5-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-flash-8b']
    for (const model of models) {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
                }),
            }
        )
        if (res.status === 429) continue
        if (!res.ok) throw new Error('Gagal generate script')
        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        recordApiUsage('gemini')
        return text
    }
    throw new Error('Quota habis, coba lagi nanti')
}

export default function VideoScriptPage() {
    const { apiKeys, projects, activeProjectId } = useAppStore()
    const [platform, setPlatform] = useState('youtube')
    const [tone, setTone] = useState('storytelling')
    const [result, setResult] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const activeProject = projects.find((p) => p.id === activeProjectId) ?? null
    const scenes = activeProject
        ? activeProject.sceneOrder.map((id) => activeProject.scenes[id]).filter(Boolean)
        : []

    async function handleGenerate() {
        if (!activeProject || !apiKeys.gemini) return
        setIsLoading(true)
        setError(null)
        try {
            const out = await generateScript(
                apiKeys.gemini,
                activeProject.name,
                activeProject.category,
                scenes.map((s) => ({ name: s.name, description: s.description })),
                platform,
                tone
            )
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

    function handleDownload() {
        const blob = new Blob([result], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${activeProject?.name ?? 'script'}_${platform}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (!activeProject) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 p-6 text-center">
                <Layers className="size-8 text-zinc-600" />
                <p className="text-sm text-zinc-400">Pilih project aktif terlebih dahulu.</p>
                <Link href="/library" className="rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors">
                    Ke Library
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="w-full min-w-0 space-y-6">

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FileVideo className="size-5 text-rose-400" />
                        <h1 className="text-2xl font-bold text-zinc-100">Video Script Generator</h1>
                    </div>
                    <p className="text-zinc-400 text-sm">Generate narasi & script video dari project restorasi kamu</p>
                </div>

                {!apiKeys.gemini && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-800/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-300">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <span>Gemini API key belum dikonfigurasi. <Link href="/settings" className="underline hover:text-amber-200">Buka Pengaturan</Link></span>
                    </div>
                )}

                {/* Project info */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
                    <p className="text-xs text-zinc-500">Project Aktif</p>
                    <p className="text-base font-semibold text-zinc-100">{activeProject.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                        {scenes.map((s) => (
                            <span key={s.id} className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                                {s.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Platform */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Platform</p>
                    <div className="grid grid-cols-3 gap-2">
                        {PLATFORMS.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPlatform(p.id)}
                                className={`rounded-xl border p-3 text-left transition-all ${platform === p.id ? 'border-rose-500/60 bg-rose-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                    }`}
                            >
                                <p className={`text-sm font-semibold ${platform === p.id ? 'text-rose-400' : 'text-zinc-200'}`}>{p.label}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{p.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tone */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tone / Gaya</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {TONES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTone(t.id)}
                                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${tone === t.id ? 'border-rose-500/60 bg-rose-500/10 text-rose-400' : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !apiKeys.gemini || scenes.length === 0}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white hover:bg-rose-400 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                    {isLoading ? <Loader2 className="size-4 animate-spin" /> : <FileVideo className="size-4" />}
                    {isLoading ? 'Generating script...' : 'Generate Video Script'}
                </button>

                {error && (
                    <div className="rounded-xl border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>
                )}

                {/* Result */}
                {result && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Script Hasil Generate</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                                >
                                    {copied ? <Check className="size-3 text-green-400" /> : <Copy className="size-3" />}
                                    {copied ? 'Tersalin!' : 'Copy'}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                                >
                                    <Download className="size-3" /> Download .txt
                                </button>
                            </div>
                        </div>
                        <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-5 max-h-[500px] overflow-y-auto">
                            <pre className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">{result}</pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
