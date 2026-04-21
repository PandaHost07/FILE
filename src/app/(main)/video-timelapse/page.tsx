'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
    Settings,
    Image as ImageIcon,
    Zap,
    Code,
    Loader2,
    Video,
    FastForward,
    Play,
    FileJson,
    Copy,
    Download,
    Film,
} from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { generateImage } from '@/lib/imagen'
import { callAIWithUsage } from '@/lib/gemini'
import { parseKeys } from '@/lib/keyRotation'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'

interface TimelapseScene {
    sceneNumber: number
    timeRange: string
    /** Sudut/kamera (opsional; dari JSON AI jika ada) */
    camera?: string
    action: string
    realisticPrompt: string
}

const PLATFORMS = [
    { id: '16:9', label: 'YouTube Longform', desc: '16:9 Widescreen', icon: Video },
    { id: '9:16', label: 'TikTok / Shorts', desc: '9:16 Vertical', icon: FastForward },
    { id: '1:1', label: 'Instagram Feed', desc: '1:1 Square', icon: Play },
]

const DURATIONS = [
    { value: 15, label: '15 Seconds (Fast/Short)' },
    { value: 30, label: '30 Seconds (Standard)' },
    { value: 60, label: '60 Seconds (Full Arc)' },
]

function buildSceneVideoPrompt(subject: string, scene: TimelapseScene): string {
    const parts = [
        `Hyperlapse / timelapse documentary clip (${scene.timeRange}), scene ${scene.sceneNumber}.`,
        scene.action,
        scene.camera ? `Camera: ${scene.camera}.` : '',
        `Visual: ${scene.realisticPrompt}`,
        subject.trim() ? `Context: ${subject.trim()}.` : '',
        'Smooth accelerated time, natural lighting, photorealistic motion, no on-screen text, no cartoon CGI look.',
    ]
    return parts.filter(Boolean).join(' ').slice(0, 3000)
}

function hasAnyChatApiKey(keys: {
    gemini: string
    groq: string
    openai: string
}): boolean {
    return (
        parseKeys(keys.gemini).length > 0 ||
        parseKeys(keys.groq).length > 0 ||
        parseKeys(keys.openai).length > 0
    )
}

export default function GenerateTimelapsePage() {
    const { toast } = useToast()
    const { apiKeys, recordApiUsage } = useAppStore()

    const [subject, setSubject] = useState('')
    const [aspectRatio, setAspectRatio] = useState('9:16')
    const [duration, setDuration] = useState(15)

    const [generating, setGenerating] = useState(false)
    const [jsonRaw, setJsonRaw] = useState<string>('')
    const [scenes, setScenes] = useState<TimelapseScene[]>([])

    // Image state per scene
    const [generatingImg, setGeneratingImg] = useState<Record<number, boolean>>({})
    const [generatedImgs, setGeneratedImgs] = useState<Record<number, string>>({})

    /** URL video per scene — blob (HF) atau https (fal). */
    const [generatingVideo, setGeneratingVideo] = useState<Record<number, boolean>>({})
    const [generatedVideos, setGeneratedVideos] = useState<Record<number, string>>({})
    const generatedVideosRef = useRef(generatedVideos)
    generatedVideosRef.current = generatedVideos

    useEffect(() => {
        return () => {
            Object.values(generatedVideosRef.current).forEach((url) => {
                if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
            })
        }
    }, [])

    // Session Storage Persistence
    useEffect(() => {
        const saved = sessionStorage.getItem('timelapseState')
        if (saved) {
            try {
                const s = JSON.parse(saved)
                setSubject(s.subject || '')
                setAspectRatio(s.aspectRatio || '9:16')
                setDuration(s.duration || 15)
                setJsonRaw(s.jsonRaw || '')
                setScenes(s.scenes || [])
                setGeneratedImgs(s.generatedImgs || {})
            } catch (e) {
                console.error('Failed to parse timelapseState', e)
            }
        }
    }, [])

    useEffect(() => {
        sessionStorage.setItem('timelapseState', JSON.stringify({
            subject, aspectRatio, duration, jsonRaw, scenes, generatedImgs
        }))
    }, [subject, aspectRatio, duration, jsonRaw, scenes, generatedImgs])

    async function handleGenerateJSON() {
        if (!subject.trim()) {
            toast({ title: 'Masukkan objek / subjek video', variant: 'destructive' })
            return
        }
        if (!hasAnyChatApiKey(apiKeys)) {
            toast({
                title: 'Belum ada kunci chat AI',
                description:
                    'Isi Gemini, Groq, atau OpenAI di Pengaturan. Beberapa key dalam satu kolom = dipisah koma (rotasi otomatis jika quota habis).',
                variant: 'destructive',
            })
            return
        }

        setGenerating(true)
        setJsonRaw('')
        setScenes([])
        setGeneratedImgs({})
        setGeneratedVideos((prev) => {
            Object.values(prev).forEach((url) => {
                if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
            })
            return {}
        })

        try {
            const sys = 'Return ONLY pure JSON. No markdown fences, no text before or after the array.'
            const userMessage = `You are a token-economizer video AI. You plan timelapse sequences highly efficiently.
Target: Output ONLY a raw JSON array. DO NOT use markdown fences (\`\`\`json). NO intro texts.
Task: Create a ${duration} seconds timelapse breakdown for the subject: "${subject}".
Rules:
1. Divide time logically into cuts taking 3 to 5 seconds each.
2. 'action': Maximum 50 chars describing the action/movement.
3. 'realisticPrompt': Must be comma-separated keywords ONLY. NO sentences. Describe subject exact state. End with: "raw photo, documentary, ultra realistic, fujifilm, natural lighting, NO CGI, NO artificial look".
Format:
[
  { "sceneNumber": 1, "timeRange": "0-3s", "action": "...", "realisticPrompt": "..." },
  ...
]`

            const { text: rawText, provider } = await callAIWithUsage(apiKeys.gemini, sys, userMessage, {
                maxTokens: 8192,
                openaiKeys: apiKeys.openai,
                groqKeys: apiKeys.groq,
                geminiTemperature: 0.7,
            })
            if (provider === 'gemini' || provider === 'openai') {
                recordApiUsage(provider)
            }

            let text = rawText
            if (!text?.trim()) throw new Error('Respons AI kosong')
            
            // Clean up possible markdown if AI disobeyed
            text = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
            
            // Validate JSON
            const parsed = JSON.parse(text) as TimelapseScene[]
            
            setJsonRaw(JSON.stringify(parsed, null, 2))
            setScenes(parsed)
            const providerLabel =
                provider === 'gemini' ? 'Gemini' : provider === 'groq' ? 'Groq' : 'OpenAI'
            toast({
                title: 'JSON adegan selesai',
                description: `Dibuat lewat ${providerLabel} (urutan: Gemini → Groq → OpenAI).`,
                variant: 'default',
            })

        } catch (e) {
            toast({ title: 'Generate failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' })
        } finally {
            setGenerating(false)
        }
    }

    async function copyJSON() {
        if (!jsonRaw) return
        await navigator.clipboard.writeText(jsonRaw)
        toast({ title: 'JSON Tersalin', description: 'Siap di-paste ke platform lain jika diperlukan.' })
    }

    async function handleGenerateCover(sceneNumber: number, prompt: string) {
        if (!apiKeys.imagen) {
            toast({ title: 'API Key Stability belum diset', variant: 'destructive' })
            return
        }

        setGeneratingImg(prev => ({ ...prev, [sceneNumber]: true }))

        try {
            // Append visual styling to ensure realism
            const finalPrompt = `${prompt}, highly realistic, cinematic lighting, 8k resolution, photography`
            const base64 = await generateImage(apiKeys.imagen, finalPrompt, {
                aspectRatio: aspectRatio
            })
            
            setGeneratedImgs(prev => ({ ...prev, [sceneNumber]: base64 }))
            toast({ title: `Gambar scene ${sceneNumber} selesai!` })
        } catch (e) {
            toast({ title: 'Gagal generate gambar', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' })
        } finally {
            setGeneratingImg(prev => ({ ...prev, [sceneNumber]: false }))
        }
    }

    function downloadImage(sceneNumber: number, base64: string) {
        const a = document.createElement('a')
        a.href = `data:image/png;base64,${base64}`
        a.download = `timelapse_scene_${sceneNumber}_${Date.now()}.png`
        a.click()
    }

    const handleGenerateSceneVideo = useCallback(
        async (scene: TimelapseScene) => {
            const hfKey = apiKeys.huggingface?.trim()
            const falKey = apiKeys.fal?.trim()
            if (!hfKey && !falKey) {
                toast({
                    title: 'Belum ada kunci video',
                    description: 'Isi token Hugging Face (hf_) atau key fal.ai di Pengaturan.',
                    variant: 'destructive',
                })
                return
            }
            const prompt = buildSceneVideoPrompt(subject, scene)
            if (!prompt.trim()) {
                toast({ title: 'Prompt kosong', variant: 'destructive' })
                return
            }

            const n = scene.sceneNumber
            setGeneratingVideo((prev) => ({ ...prev, [n]: true }))
            try {
                if (hfKey) {
                    const res = await fetch('/api/hf/video', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ apiKey: hfKey, prompt }),
                    })
                    const ct = res.headers.get('content-type') ?? ''
                    if (!res.ok) {
                        const data = (await res.json().catch(() => ({}))) as { error?: string }
                        throw new Error(typeof data.error === 'string' ? data.error : `HTTP ${res.status}`)
                    }
                    if (!ct.includes('video')) {
                        throw new Error('Respons bukan video (cek izin Inference Providers di token HF).')
                    }
                    const blob = await res.blob()
                    setGeneratedVideos((prev) => {
                        const old = prev[n]
                        if (old?.startsWith('blob:')) URL.revokeObjectURL(old)
                        return { ...prev, [n]: URL.createObjectURL(blob) }
                    })
                    recordApiUsage('huggingface')
                    toast({
                        title: `Video adegan ${n} siap`,
                        description: 'Hugging Face Inference (kuota HF).',
                    })
                } else {
                    const res = await fetch('/api/fal/video', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            apiKey: falKey,
                            prompt,
                            aspectRatio: aspectRatio,
                        }),
                    })
                    const data = (await res.json()) as { ok?: boolean; error?: string; videoUrl?: string }
                    if (!res.ok || !data.ok) {
                        throw new Error(typeof data.error === 'string' ? data.error : `HTTP ${res.status}`)
                    }
                    if (!data.videoUrl) throw new Error('URL video tidak ada')
                    setGeneratedVideos((prev) => {
                        const old = prev[n]
                        if (old?.startsWith('blob:')) URL.revokeObjectURL(old)
                        return { ...prev, [n]: data.videoUrl! }
                    })
                    recordApiUsage('fal')
                    toast({
                        title: `Video adegan ${n} siap`,
                        description: `fal.ai Vidu Q2 · ${aspectRatio}`,
                    })
                }
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Gagal'
                toast({ title: 'Gagal generate video', description: msg, variant: 'destructive' })
            } finally {
                setGeneratingVideo((prev) => ({ ...prev, [n]: false }))
            }
        },
        [apiKeys.fal, apiKeys.huggingface, aspectRatio, recordApiUsage, subject, toast]
    )

    function downloadSceneVideo(sceneNumber: number, url: string) {
        const a = document.createElement('a')
        a.href = url
        a.download = `timelapse_scene_${sceneNumber}_${Date.now()}.mp4`
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        a.click()
    }

    return (
        <div className="h-full w-full overflow-y-auto bg-[#000000] p-6 md:p-10 scrollbar-thin">
            <div className="mx-auto max-w-6xl pb-20">

                <div className="mb-10">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold tracking-widest text-purple-400 uppercase">
                        <Zap className="size-3.5" />
                        <span>Token Economizer</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Generate Timelapse</h1>
                    <p className="text-sm text-[#8b8b93] max-w-2xl">
                        Atur resolusi sesuai platform (TikTok/Shorts, YouTube), set durasi, dan sistem akan mengkreasi instruksi per-detik menggunakan JSON yang sangat terfokus. Metode ini <span className="text-white font-medium">memangkas penggunaan token</span> secara drastis dibanding model obrolan biasa.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Left Pane - Configuration */}
                    <div className="w-full lg:w-[420px] shrink-0 space-y-6">
                        <div className="rounded-2xl border border-[#1a1a1a] bg-[#0A0A0C] p-6 shadow-xl">
                            <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white">
                                <Settings className="size-4 text-purple-500" /> Sequence Settings
                            </h2>

                            <div className="space-y-5">
                                {/* Subject Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400">Video Subject / Object</label>
                                    <textarea
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        placeholder="e.g. Abandoned rusty Porsche 911 being washed and restored to pristine condition..."
                                        className="w-full resize-none rounded-xl border border-[#1a1a1a] bg-[#050505] p-3 text-sm text-zinc-200 outline-none transition-all hover:border-zinc-700 focus:border-purple-500/50"
                                        rows={3}
                                    />
                                </div>

                                {/* Aspect Ratio */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400">Platform Aspect Ratio (Resolution)</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {PLATFORMS.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setAspectRatio(p.id)}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                                                    aspectRatio === p.id 
                                                    ? "border-purple-500/50 bg-purple-500/10" 
                                                    : "border-[#1a1a1a] bg-[#050505] hover:border-zinc-700"
                                                )}
                                            >
                                                <p.icon className={cn("size-4 shrink-0", aspectRatio === p.id ? "text-purple-400" : "text-zinc-500")} />
                                                <div>
                                                    <p className={cn("text-xs font-bold", aspectRatio === p.id ? "text-purple-400" : "text-zinc-300")}>{p.label}</p>
                                                    <p className="text-[10px] text-zinc-500 mt-0.5">{p.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Duration */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400">Total Duration</label>
                                    <select
                                        value={duration}
                                        onChange={e => setDuration(Number(e.target.value))}
                                        className="w-full appearance-none rounded-xl border border-[#1a1a1a] bg-[#050505] p-3 text-sm text-zinc-200 outline-none cursor-pointer transition-all hover:border-zinc-700 focus:border-purple-500/50"
                                    >
                                        {DURATIONS.map(d => (
                                            <option key={d.value} value={d.value}>{d.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={handleGenerateJSON}
                                    disabled={generating}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3.5 text-sm font-bold text-white transition-all hover:bg-purple-500 disabled:opacity-50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                >
                                    {generating ? <Loader2 className="size-4 animate-spin" /> : <Code className="size-4" />}
                                    Generate Token-Saving JSON
                                </button>
                                
                                {!hasAnyChatApiKey(apiKeys) && (
                                    <p className="text-[11px] text-red-400 text-center mt-2">
                                        Isi minimal satu: <span className="text-zinc-300">Gemini</span>,{' '}
                                        <span className="text-zinc-300">Groq</span>, atau{' '}
                                        <span className="text-zinc-300">OpenAI</span> — bisa beberapa key dipisah koma
                                        (rotasi). <Link href="/settings" className="underline">Pengaturan</Link>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Pane - Results */}
                    <div className="flex-1 w-full min-w-0 space-y-6">
                        {/* Empty state */}
                        {!generating && !jsonRaw && (
                            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#222222] bg-[#0A0A0C]">
                                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#121214] border border-[#1a1a1a]">
                                    <FileJson className="size-6 text-zinc-600" />
                                </div>
                                <p className="text-sm font-medium text-zinc-400">Hasil struktur JSON akan muncul di sini.</p>
                                <p className="text-xs text-zinc-600">Sangat efisien dan instan diparsing.</p>
                            </div>
                        )}

                        {/* Loading state */}
                        {generating && (
                            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-[#1a1a1a] bg-[#0A0A0C]">
                                <Loader2 className="size-8 animate-spin text-purple-500 mb-4" />
                                <p className="text-sm font-medium text-purple-400 animate-pulse">Menghitung scene paling ekonomis...</p>
                            </div>
                        )}

                        {/* Result state */}
                        {!generating && jsonRaw && scenes.length > 0 && (
                            <div className="flex flex-col xl:flex-row items-start gap-8">
                                {/* Visual breakdown (Single Phone-like Card) */}
                                <div className="w-full max-w-[380px] shrink-0 overflow-hidden rounded-[2rem] border-[6px] border-[#1a1a1a] bg-[#0A0A0C] shadow-2xl relative">
                                    <div className="flex items-center justify-between border-b border-[#1a1a1a] bg-[#121214] px-5 py-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">Video Feed</h3>
                                        <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">{scenes.length} Scenes</span>
                                    </div>
                                    
                                    <div className="flex flex-col gap-4 p-4 max-h-[600px] overflow-y-auto scrollbar-thin">
                                        {scenes.map((scene) => (
                                            <div key={scene.sceneNumber} className="flex flex-col gap-3 rounded-xl border border-[#222222] bg-[#050505] p-4 relative">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/10">
                                                        {scene.timeRange}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold text-zinc-500">
                                                        Scene {scene.sceneNumber}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                                                    {scene.action}
                                                </p>
                                                
                                                <div className="pt-2 border-t border-[#1a1a1a]">
                                                    {generatedImgs[scene.sceneNumber] ? (
                                                        <div className="relative overflow-hidden rounded-lg bg-black border border-[#222222]">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img 
                                                                src={`data:image/png;base64,${generatedImgs[scene.sceneNumber]}`} 
                                                                alt={`Scene ${scene.sceneNumber}`}
                                                                className="w-full h-auto aspect-video object-cover"
                                                            />
                                                            <button 
                                                                onClick={() => downloadImage(scene.sceneNumber, generatedImgs[scene.sceneNumber])}
                                                                className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-md bg-black/60 backdrop-blur-sm text-white hover:bg-purple-600 transition-colors"
                                                            >
                                                                <Download className="size-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleGenerateCover(scene.sceneNumber, scene.realisticPrompt)}
                                                            disabled={generatingImg[scene.sceneNumber]}
                                                            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#121214] border border-[#222222] text-[10px] uppercase font-bold tracking-wider text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                                                        >
                                                            {generatingImg[scene.sceneNumber] ? <Loader2 className="size-3.5 animate-spin text-purple-400" /> : <ImageIcon className="size-3.5 text-zinc-500" />}
                                                            {generatingImg[scene.sceneNumber] ? 'Rendering...' : 'Generate Image'}
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="pt-3 border-t border-[#1a1a1a] space-y-2">
                                                    <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/90">
                                                        Video AI · per adegan
                                                    </p>
                                                    <p className="text-[10px] leading-snug text-zinc-600">
                                                        Text-to-video (±4 dtk). Prioritas{' '}
                                                        <span className="text-zinc-500">Hugging Face</span>, lalu{' '}
                                                        <span className="text-zinc-500">fal.ai</span> — rasio ikut &quot;Platform&quot; di kiri.
                                                    </p>
                                                    {generatedVideos[scene.sceneNumber] ? (
                                                        <div className="space-y-2">
                                                            <div className="relative overflow-hidden rounded-lg border border-emerald-500/25 bg-black">
                                                                <video
                                                                    src={generatedVideos[scene.sceneNumber]}
                                                                    controls
                                                                    playsInline
                                                                    className="aspect-video w-full object-contain"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    downloadSceneVideo(
                                                                        scene.sceneNumber,
                                                                        generatedVideos[scene.sceneNumber]!
                                                                    )
                                                                }
                                                                className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20"
                                                            >
                                                                <Download className="size-3.5" />
                                                                Unduh MP4
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => void handleGenerateSceneVideo(scene)}
                                                                disabled={generatingVideo[scene.sceneNumber]}
                                                                className="flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 text-[10px] font-semibold text-zinc-500 hover:border-zinc-700 hover:text-zinc-400 disabled:opacity-50"
                                                            >
                                                                {generatingVideo[scene.sceneNumber] ? (
                                                                    <Loader2 className="size-3 animate-spin" />
                                                                ) : null}
                                                                Generate ulang
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleGenerateSceneVideo(scene)}
                                                            disabled={
                                                                generatingVideo[scene.sceneNumber] ||
                                                                (!apiKeys.huggingface?.trim() && !apiKeys.fal?.trim())
                                                            }
                                                            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#121214] border border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider text-emerald-400/90 transition-all hover:bg-emerald-500/10 hover:border-emerald-500/35 disabled:opacity-45"
                                                        >
                                                            {generatingVideo[scene.sceneNumber] ? (
                                                                <Loader2 className="size-3.5 animate-spin text-emerald-400" />
                                                            ) : (
                                                                <Film className="size-3.5 text-emerald-500/80" />
                                                            )}
                                                            {generatingVideo[scene.sceneNumber]
                                                                ? 'Membuat video…'
                                                                : 'Generate video'}
                                                        </button>
                                                    )}
                                                    {!apiKeys.huggingface?.trim() && !apiKeys.fal?.trim() && (
                                                        <p className="text-[10px] text-amber-400/90">
                                                            <Link href="/settings" className="underline underline-offset-2">
                                                                Pengaturan
                                                            </Link>{' '}
                                                            — isi token HF atau key fal.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 w-full space-y-6">
                                    {/* Combined Script Output Card */}
                                    <div className="rounded-2xl border border-[#1a1a1a] bg-[#0A0A0C] overflow-hidden shadow-xl">
                                        <div className="flex items-center justify-between border-b border-[#1a1a1a] bg-[#121214] px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Code className="size-4 text-emerald-500" />
                                                <span className="text-xs font-bold text-zinc-200">Combined Master Prompt (Satu Kalimat Lurus)</span>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const masterText = scenes.map(s => `[${s.timeRange}] ${s.camera || ''} - ${s.action}`).join(' ');
                                                    navigator.clipboard.writeText(masterText);
                                                    toast({ title: 'Master Prompt Disalin!' });
                                                }}
                                                className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                            >
                                                <Copy className="size-3" /> COPY SEMUA
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <textarea
                                                readOnly
                                                className="w-full resize-none rounded-xl border border-[#1a1a1a] bg-[#050505] p-4 text-sm leading-relaxed text-zinc-300 outline-none"
                                                rows={10}
                                                value={scenes.map(s => `[${s.timeRange}] ${s.camera ? s.camera + ' - ' : ''}${s.action}`).join(' ')}
                                            />
                                            <p className="mt-3 text-[11px] text-zinc-500 font-medium">
                                                Teks ini telah digabungkan menjadi satu kesatuan paragraf. Anda bisa langsung melakukan *copy-paste* ke AI Video Generator (seperti Kling/Runway) untuk eksekusi langsung.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Raw JSON Output Card */}
                                    <div className="rounded-2xl border border-[#1a1a1a] bg-[#0A0A0C] overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
                                        <div className="flex items-center justify-between border-b border-[#1a1a1a] bg-[#121214] px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <FileJson className="size-4 text-zinc-600" />
                                                <span className="text-xs font-bold text-zinc-400">Raw JSON Data (Developer)</span>
                                            </div>
                                            <button 
                                                onClick={copyJSON}
                                                className="flex items-center gap-1.5 rounded-lg bg-zinc-800/50 px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:bg-zinc-800 transition-colors"
                                            >
                                                <Copy className="size-3" /> COPY JSON
                                            </button>
                                        </div>
                                        <div className="p-4 overflow-x-auto">
                                            <pre className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                                                {jsonRaw}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
