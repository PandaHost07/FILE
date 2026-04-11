'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
    AlertTriangle, ChevronLeft, ChevronRight, Layers,
    Sparkles, Loader2, Copy, Check, Save, Wand2, Film, ImageIcon, Download,
    Maximize2, X, Keyboard,
} from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { generateImagePrompt, generateVideoPrompt } from '@/lib/gemini'
import { generateImage } from '@/lib/imagen'
import { buildVisualConsistencyLock, stabilitySeedForProject, STABILITY_NEGATIVE_PROMPT } from '@/lib/visualConsistency'
import { compressImage, saveImage, loadImage } from '@/lib/imageStorage'
import { useToast } from '@/components/ui/toast'
import type { SceneContext } from '@/types'
import { cn } from '@/lib/utils'

const VISUAL_STYLES = ['Cinematic', 'Documentary', 'Aesthetic', 'Raw/Industrial', 'Warm & Cozy', 'Photorealistic']
const SPLIT_STORAGE_KEY = 'rpg-prompt-studio-split-pct'

type GeneratePhase = 'idle' | 'image-prompt' | 'video-prompt'

export default function PromptStudioPage() {
    const { toast } = useToast()
    const {
        projects, activeProjectId, activeSceneId, apiKeys,
        setActiveScene, updateScenePrompts, updateSceneImage,
    } = useAppStore()

    const activeProject = projects.find((p) => p.id === activeProjectId) ?? null
    const activeScene = activeProject && activeSceneId ? activeProject.scenes[activeSceneId] ?? null : null

    const [imagePrompt, setImagePrompt] = useState(activeScene?.imagePrompt ?? '')
    const [videoPrompt, setVideoPrompt] = useState(activeScene?.videoPrompt ?? '')
    const [visualStyle, setVisualStyle] = useState('Cinematic')
    const [generating, setGenerating] = useState(false)
    const [generatePhase, setGeneratePhase] = useState<GeneratePhase>('idle')
    const [generatingImage, setGeneratingImage] = useState(false)
    const [saving, setSaving] = useState(false)
    const [imageError, setImageError] = useState<string | null>(null)
    const [copiedImg, setCopiedImg] = useState(false)
    const [copiedVid, setCopiedVid] = useState(false)
    const [localImageData, setLocalImageData] = useState<string | null>(activeScene?.imageData ?? null)
    const [lightbox, setLightbox] = useState(false)
    const [leftPct, setLeftPct] = useState(52)
    /** Kolom grid desktop: 3 segmen; undefined = satu kolom (mobile). */
    const [splitTemplate, setSplitTemplate] = useState<string | undefined>(undefined)
    const splitRef = useRef<HTMLDivElement>(null)
    const draggingSplit = useRef(false)
    const leftPctRef = useRef(52)
    leftPctRef.current = leftPct

    const [lastSceneId, setLastSceneId] = useState(activeSceneId)
    if (activeSceneId !== lastSceneId) {
        setLastSceneId(activeSceneId)
        setImagePrompt(activeScene?.imagePrompt ?? '')
        setVideoPrompt(activeScene?.videoPrompt ?? '')
        setImageError(null)
        setLocalImageData(activeScene?.imageData ?? null)
        if (activeSceneId && !activeScene?.imageData) {
            loadImage(activeSceneId).then((img) => {
                if (img) setLocalImageData(img)
            })
        }
    }

    useEffect(() => {
        try {
            const raw = localStorage.getItem(SPLIT_STORAGE_KEY)
            if (raw) {
                const n = Number(raw)
                if (n >= 30 && n <= 75) setLeftPct(n)
            }
        } catch { /* ignore */ }
    }, [])

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)')
        function sync() {
            setSplitTemplate(mq.matches ? `${leftPct}fr 8px ${100 - leftPct}fr` : undefined)
        }
        sync()
        mq.addEventListener('change', sync)
        return () => mq.removeEventListener('change', sync)
    }, [leftPct])

    const sceneOrder = activeProject?.sceneOrder ?? []
    const currentIndex = activeSceneId ? sceneOrder.indexOf(activeSceneId) : -1
    const prevSceneId = currentIndex > 0 ? sceneOrder[currentIndex - 1] : null
    const nextSceneId = currentIndex < sceneOrder.length - 1 ? sceneOrder[currentIndex + 1] : null

    const openaiKey = apiKeys.openai || undefined

    const goPrev = useCallback(() => {
        if (prevSceneId) setActiveScene(prevSceneId)
    }, [prevSceneId, setActiveScene])

    const goNext = useCallback(() => {
        if (nextSceneId) setActiveScene(nextSceneId)
    }, [nextSceneId, setActiveScene])

    const handleSavePrompts = useCallback(async () => {
        if (!activeProject || !activeSceneId) return
        setSaving(true)
        updateScenePrompts(activeProject.id, activeSceneId, imagePrompt, videoPrompt)
        toast({ title: 'Prompt disimpan', variant: 'default' })
        setSaving(false)
    }, [activeProject, activeSceneId, imagePrompt, videoPrompt, updateScenePrompts, toast])

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            const t = e.target as HTMLElement
            const typing = t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.isContentEditable

            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault()
                void handleSavePrompts()
                return
            }

            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault()
                goPrev()
                return
            }
            if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault()
                goNext()
                return
            }

            if (lightbox && e.key === 'Escape') {
                e.preventDefault()
                setLightbox(false)
                return
            }

            if (!typing && (e.key === 'g' || e.key === 'G') && !e.metaKey && !e.ctrlKey) {
                if (!generating && (apiKeys.gemini || apiKeys.openai)) {
                    e.preventDefault()
                    void handleGenerateBothRef.current()
                }
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [handleSavePrompts, goPrev, goNext, lightbox, generating, apiKeys.gemini, apiKeys.openai])

    function buildContext(): SceneContext {
        const total = Math.max(sceneOrder.length, 1)
        return {
            sceneName: activeScene!.name,
            sceneDescription: activeScene!.description || activeScene!.name,
            category: activeProject!.category,
            contentMode: activeProject!.contentMode ?? 'restoration',
            visualStyle,
            projectName: activeProject!.name,
            sceneOrder: activeScene!.order,
            totalScenes: total,
            visualConsistencyLock: buildVisualConsistencyLock(activeProject!),
        }
    }

    const handleGenerateBothRef = useRef<() => Promise<void>>(async () => {})

    async function handleGenerateBoth() {
        if (!activeScene || !activeProject) return
        setGenerating(true)
        setGeneratePhase('image-prompt')
        try {
            const imgResult = await generateImagePrompt(apiKeys.gemini, buildContext(), openaiKey)
            setImagePrompt(imgResult)
            setGeneratePhase('video-prompt')

            const vidResult = await generateVideoPrompt(apiKeys.gemini, buildContext(), imgResult, openaiKey)
            setVideoPrompt(vidResult)

            updateScenePrompts(activeProject.id, activeSceneId!, imgResult, vidResult)
            toast({ title: 'Image + Video prompt berhasil digenerate', variant: 'default' })
        } catch (err) {
            toast({
                title: 'Gagal generate prompt',
                description: err instanceof Error ? err.message : 'Terjadi kesalahan.',
                variant: 'destructive',
            })
        } finally {
            setGeneratePhase('idle')
            setGenerating(false)
        }
    }

    handleGenerateBothRef.current = handleGenerateBoth

    useEffect(() => {
        function onMove(e: MouseEvent) {
            if (!draggingSplit.current || !splitRef.current) return
            const rect = splitRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left
            const pct = (x / rect.width) * 100
            const clamped = Math.min(75, Math.max(28, pct))
            setLeftPct(clamped)
        }
        function onUp() {
            if (draggingSplit.current) {
                draggingSplit.current = false
                try {
                    localStorage.setItem(SPLIT_STORAGE_KEY, String(Math.round(leftPctRef.current)))
                } catch { /* ignore */ }
            }
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
    }, [])

    async function handleGenerateImage() {
        if (!activeProject || !activeSceneId) return
        setGeneratingImage(true)
        setImageError(null)
        try {
            const base64 = await generateImage(apiKeys.imagen, imagePrompt, {
                seed: stabilitySeedForProject(activeProject.id),
                negativePrompt: STABILITY_NEGATIVE_PROMPT,
            })
            const compressed = await compressImage(base64)
            await saveImage(activeSceneId, compressed)
            updateSceneImage(activeProject.id, activeSceneId, compressed)
            setLocalImageData(compressed)
        } catch (err) {
            setImageError(err instanceof Error ? err.message : 'Gagal generate gambar.')
        } finally {
            setGeneratingImage(false)
        }
    }

    async function handleCopy(text: string, type: 'img' | 'vid') {
        await navigator.clipboard.writeText(text)
        if (type === 'img') {
            setCopiedImg(true)
            setTimeout(() => setCopiedImg(false), 2000)
        } else {
            setCopiedVid(true)
            setTimeout(() => setCopiedVid(false), 2000)
        }
    }

    function handleDownloadImage() {
        if (!localImageData && !activeScene?.imageData) return
        const data = localImageData ?? activeScene!.imageData!
        const a = document.createElement('a')
        a.href = `data:image/jpeg;base64,${data}`
        a.download = `${activeScene!.name.replace(/\s+/g, '-')}.jpg`
        a.click()
    }

    if (!activeScene || !activeProject) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 p-6 text-center">
                <Layers className="size-8 text-zinc-600" />
                <p className="text-sm text-zinc-400">Pilih scene terlebih dahulu di Scene Builder.</p>
                <Link
                    href="/scene-builder"
                    className="rounded-xl bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                    Ke Scene Builder
                </Link>
            </div>
        )
    }

    const imageData = localImageData ?? activeScene.imageData ?? null
    const hasApiKey = !!(apiKeys.gemini || apiKeys.openai)

    const step1Done = !!imagePrompt.trim()
    const step2Done = !!videoPrompt.trim()
    const step3Done = !!imageData

    return (
        <div className="min-h-screen bg-zinc-950 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-xs text-zinc-500">{activeProject.name} · Prompt Studio</p>
                        <h1 className="text-lg font-bold text-zinc-100 mt-0.5">{activeScene.name}</h1>
                        {activeScene.description && (
                            <p className="text-xs text-zinc-500 mt-0.5">{activeScene.description}</p>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {apiKeys.openai && (
                            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                                GPT backup aktif
                            </span>
                        )}
                        <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400">
                            Scene {activeScene.order} / {sceneOrder.length}
                        </span>
                    </div>
                </div>

                {/* Langkah alur */}
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5">
                    {[
                        { id: 1, label: 'Prompt gambar', done: step1Done },
                        { id: 2, label: 'Prompt video', done: step2Done },
                        { id: 3, label: 'Render gambar', done: step3Done },
                    ].map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2">
                            {i > 0 && <ChevronRight className="size-3 text-zinc-700" />}
                            <span
                                className={cn(
                                    'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors',
                                    s.done
                                        ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25'
                                        : 'bg-zinc-800/80 text-zinc-500'
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex size-4 items-center justify-center rounded-full text-[9px]',
                                        s.done ? 'bg-emerald-500/30 text-emerald-200' : 'bg-zinc-700 text-zinc-400'
                                    )}
                                >
                                    {s.done ? '✓' : s.id}
                                </span>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                {!hasApiKey && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-800/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-300">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <span>
                            API key belum dikonfigurasi.{' '}
                            <Link href="/settings" className="underline hover:text-amber-200">
                                Buka Pengaturan
                            </Link>
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-600 shrink-0">Gaya:</span>
                    {VISUAL_STYLES.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setVisualStyle(s)}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                                visualStyle === s
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                    : 'border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => void handleGenerateBoth()}
                    disabled={generating || !hasApiKey}
                    className="w-full flex flex-col items-center justify-center gap-1 rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-zinc-950 hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                    {generating ? (
                        <>
                            <span className="flex items-center gap-2">
                                <Loader2 className="size-4 animate-spin" />
                                {generatePhase === 'image-prompt' && 'Membuat image prompt…'}
                                {generatePhase === 'video-prompt' && 'Membuat video prompt…'}
                                {generatePhase === 'idle' && 'Memproses…'}
                            </span>
                            <span className="text-[10px] font-normal opacity-90">
                                {generatePhase === 'video-prompt'
                                    ? 'Langkah 2 dari 2 (teks)'
                                    : 'Langkah 1 dari 2 (teks)'}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="flex items-center gap-2">
                                <Sparkles className="size-4" /> Generate Image + Video Prompt
                            </span>
                            <span className="text-[10px] font-normal opacity-80">Pintasan: tekan G (fokus tidak di kolom teks)</span>
                        </>
                    )}
                </button>

                <div
                    ref={splitRef}
                    className="grid w-full grid-cols-1 gap-4 lg:items-start"
                    style={{ gridTemplateColumns: splitTemplate }}
                >
                    <div className="min-w-0 space-y-4 lg:pr-1">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="size-3.5 text-amber-400" />
                                        <span className="text-xs font-semibold text-zinc-200">Image Prompt</span>
                                        {generating && generatePhase === 'image-prompt' && (
                                            <Loader2 className="size-3 text-amber-400 animate-spin" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(imagePrompt, 'img')}
                                        disabled={!imagePrompt}
                                        className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors disabled:opacity-30"
                                    >
                                        {copiedImg ? (
                                            <Check className="size-3.5 text-green-400" />
                                        ) : (
                                            <Copy className="size-3.5" />
                                        )}
                                    </button>
                                </div>
                                <textarea
                                    value={imagePrompt}
                                    onChange={(e) => setImagePrompt(e.target.value)}
                                    rows={6}
                                    placeholder="Image prompt akan muncul setelah generate..."
                                    className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-amber-500/50 transition-colors"
                                />
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Film className="size-3.5 text-blue-400" />
                                        <span className="text-xs font-semibold text-zinc-200">Video Prompt</span>
                                        {generating && generatePhase === 'video-prompt' && (
                                            <Loader2 className="size-3 text-blue-400 animate-spin" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(videoPrompt, 'vid')}
                                        disabled={!videoPrompt}
                                        className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors disabled:opacity-30"
                                    >
                                        {copiedVid ? (
                                            <Check className="size-3.5 text-green-400" />
                                        ) : (
                                            <Copy className="size-3.5" />
                                        )}
                                    </button>
                                </div>
                                <textarea
                                    value={videoPrompt}
                                    onChange={(e) => setVideoPrompt(e.target.value)}
                                    rows={6}
                                    placeholder="Video prompt otomatis setelah image prompt selesai..."
                                    className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => void handleSavePrompts()}
                                disabled={saving || (!imagePrompt && !videoPrompt)}
                                className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                            >
                                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                Simpan Prompt
                            </button>
                        </div>

                    <div
                        role="separator"
                        aria-orientation="vertical"
                        className="hidden cursor-col-resize select-none items-stretch justify-center self-stretch lg:flex"
                        onMouseDown={() => {
                            draggingSplit.current = true
                        }}
                    >
                        <div className="mx-auto my-6 w-1 max-w-1 shrink-0 rounded-full bg-zinc-700/80 hover:bg-amber-500/50 transition-colors" />
                    </div>

                    <div className="min-w-0 space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 lg:pl-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Wand2 className="size-3.5 text-emerald-400" />
                                    <span className="text-xs font-semibold text-zinc-200">Generate Gambar</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {imageData && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setLightbox(true)}
                                                className="p-1 text-zinc-600 hover:text-amber-400 transition-colors"
                                                title="Perbesar"
                                            >
                                                <Maximize2 className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDownloadImage}
                                                className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
                                            >
                                                <Download className="size-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => imageData && setLightbox(true)}
                                className="relative aspect-square w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-left transition-opacity hover:opacity-95"
                            >
                                {imageData ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={`data:image/jpeg;base64,${imageData}`}
                                        alt={activeScene.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-700">
                                        <ImageIcon className="size-10" />
                                        <span className="text-xs">Belum ada gambar</span>
                                    </div>
                                )}
                                {generatingImage && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950/80">
                                        <Loader2 className="size-8 animate-spin text-amber-400" />
                                        <span className="text-xs text-zinc-400">Generating…</span>
                                    </div>
                                )}
                            </button>

                            {imageError && (
                                <p className="rounded-lg border border-red-800/40 bg-red-950/20 px-3 py-2 text-xs text-red-400">
                                    {imageError}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={() => void handleGenerateImage()}
                                disabled={generatingImage || !imagePrompt.trim() || !apiKeys.imagen}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 py-2.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                            >
                                {generatingImage ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Wand2 className="size-4" />
                                )}
                                Generate Gambar dari Prompt
                            </button>

                            <p className="text-[10px] leading-relaxed text-zinc-600 text-center">
                                Seed &amp; negative prompt per project. Klik pratinjau untuk layar penuh.
                            </p>
                            {!apiKeys.imagen && (
                                <p className="text-xs text-zinc-600 text-center">
                                    Butuh Stability AI key.{' '}
                                    <Link href="/settings" className="text-amber-400 hover:text-amber-300 underline">
                                        Pengaturan
                                    </Link>
                                </p>
                            )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                        <Keyboard className="size-3.5 shrink-0" />
                        <span>
                            <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-px">Ctrl</kbd>+
                            <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-px">S</kbd> simpan ·{' '}
                            <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-px">Alt</kbd>+←/→ scene ·{' '}
                            <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-px">G</kbd> generate
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800/60 pt-4">
                    <button
                        type="button"
                        onClick={goPrev}
                        disabled={!prevSceneId}
                        className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <ChevronLeft className="size-4" /> Scene Sebelumnya
                    </button>
                    <span className="text-xs text-zinc-600">
                        {currentIndex + 1} / {sceneOrder.length}
                    </span>
                    <button
                        type="button"
                        onClick={goNext}
                        disabled={!nextSceneId}
                        className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                        Scene Berikutnya <ChevronRight className="size-4" />
                    </button>
                </div>
            </div>

            {lightbox && imageData && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setLightbox(false)}
                >
                    <button
                        type="button"
                        className="absolute right-4 top-4 rounded-full border border-zinc-600 bg-zinc-900 p-2 text-zinc-300 hover:bg-zinc-800"
                        onClick={() => setLightbox(false)}
                        aria-label="Tutup"
                    >
                        <X className="size-5" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`data:image/jpeg;base64,${imageData}`}
                        alt=""
                        className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    )
}
