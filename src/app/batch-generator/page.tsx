'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, AlertTriangle, CheckCircle2, XCircle, Loader2, ArrowRight, Layers } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { generateImagePrompt, generateVideoPrompt } from '@/lib/gemini'
import { getProjectContentMode } from '@/lib/utils'
import { buildVisualConsistencyLock } from '@/lib/visualConsistency'
import type { SceneContext } from '@/types'

type SceneStatus = 'pending' | 'generating-image' | 'generating-video' | 'done' | 'error'

interface SceneProgress {
    sceneId: string
    sceneName: string
    status: SceneStatus
    error?: string
}

export default function BatchGeneratorPage() {
    const router = useRouter()
    const { projects, activeProjectId, apiKeys, updateScenePrompts } = useAppStore()

    const activeProject = projects.find((p) => p.id === activeProjectId) ?? null
    const scenes = activeProject
        ? activeProject.sceneOrder.map((id) => activeProject.scenes[id]).filter(Boolean)
        : []

    const [isRunning, setIsRunning] = useState(false)
    const [progress, setProgress] = useState<SceneProgress[]>([])
    const [done, setDone] = useState(false)
    const [overwrite, setOverwrite] = useState(false)

    const scenesWithPrompt = scenes.filter((s) => s.promptStatus === 'sudah').length
    const scenesToProcess = overwrite ? scenes : scenes.filter((s) => s.promptStatus !== 'sudah')

    async function handleBatchGenerate() {
        if (!activeProject || !apiKeys.gemini) return
        setIsRunning(true)
        setDone(false)

        const initialProgress: SceneProgress[] = scenesToProcess.map((s) => ({
            sceneId: s.id,
            sceneName: s.name,
            status: 'pending',
        }))
        setProgress(initialProgress)

        for (let i = 0; i < scenesToProcess.length; i++) {
            const scene = scenesToProcess[i]
            const context: SceneContext = {
                sceneName: scene.name,
                sceneDescription: scene.description || scene.name,
                category: activeProject.category,
                contentMode: getProjectContentMode(activeProject),
                visualStyle: 'photorealistic cinematic',
                projectName: activeProject.name,
                sceneOrder: scene.order,
                totalScenes: Math.max(scenes.length, 1),
                visualConsistencyLock: buildVisualConsistencyLock(activeProject),
            }

            // Generate image prompt
            setProgress((prev) => prev.map((p, idx) =>
                idx === i ? { ...p, status: 'generating-image' } : p
            ))

            let imagePrompt = ''
            let videoPrompt = ''

            try {
                imagePrompt = await generateImagePrompt(
                    apiKeys.gemini,
                    context,
                    apiKeys.openai || undefined
                )
            } catch (err) {
                setProgress((prev) => prev.map((p, idx) =>
                    idx === i ? { ...p, status: 'error', error: err instanceof Error ? err.message : 'Gagal generate image prompt' } : p
                ))
                continue
            }

            // Generate video prompt
            setProgress((prev) => prev.map((p, idx) =>
                idx === i ? { ...p, status: 'generating-video' } : p
            ))

            try {
                videoPrompt = await generateVideoPrompt(
                    apiKeys.gemini,
                    context,
                    imagePrompt,
                    apiKeys.openai || undefined
                )
            } catch (err) {
                setProgress((prev) => prev.map((p, idx) =>
                    idx === i ? { ...p, status: 'error', error: err instanceof Error ? err.message : 'Gagal generate video prompt' } : p
                ))
                continue
            }

            // Save to store
            updateScenePrompts(activeProject.id, scene.id, imagePrompt, videoPrompt)

            setProgress((prev) => prev.map((p, idx) =>
                idx === i ? { ...p, status: 'done' } : p
            ))

            // Small delay to avoid rate limiting
            if (i < scenesToProcess.length - 1) {
                await new Promise((r) => setTimeout(r, 1000))
            }
        }

        setIsRunning(false)
        setDone(true)
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

    const doneCount = progress.filter((p) => p.status === 'done').length
    const errorCount = progress.filter((p) => p.status === 'error').length
    const progressPercent = progress.length > 0 ? Math.round((doneCount / progress.length) * 100) : 0

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="mx-auto max-w-2xl space-y-6">

                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="size-5 text-emerald-400" />
                        <h1 className="text-2xl font-bold text-zinc-100">Batch Generator</h1>
                    </div>
                    <p className="text-zinc-400 text-sm">Generate semua prompt untuk semua scene sekaligus dengan 1 klik</p>
                </div>

                {/* Project info */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-zinc-500">Project Aktif</p>
                            <p className="text-base font-semibold text-zinc-100">{activeProject.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-zinc-100">{scenes.length}</p>
                            <p className="text-xs text-zinc-500">total scene</p>
                        </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <span className="text-amber-400">{scenesWithPrompt} sudah punya prompt</span>
                        <span className="text-zinc-500">{scenes.length - scenesWithPrompt} belum</span>
                    </div>
                </div>

                {/* API key warning */}
                {!apiKeys.gemini && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-800/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-300">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <span>
                            Gemini API key belum dikonfigurasi.{' '}
                            <Link href="/settings" className="underline hover:text-amber-200">Buka Pengaturan</Link>
                        </span>
                    </div>
                )}

                {/* Options */}
                {!isRunning && !done && (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-zinc-200">Opsi Generate</h2>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={overwrite}
                                onChange={(e) => setOverwrite(e.target.checked)}
                                className="rounded border-zinc-600 bg-zinc-800 text-amber-500"
                            />
                            <div>
                                <p className="text-sm text-zinc-200">Timpa prompt yang sudah ada</p>
                                <p className="text-xs text-zinc-500">Jika dicentang, semua scene akan di-generate ulang</p>
                            </div>
                        </label>

                        <div className="rounded-xl bg-zinc-800/60 p-3 text-sm text-zinc-400">
                            Akan memproses <span className="text-zinc-100 font-semibold">{scenesToProcess.length} scene</span>
                            {!overwrite && scenesWithPrompt > 0 && (
                                <span className="text-zinc-500"> (melewati {scenesWithPrompt} yang sudah ada)</span>
                            )}
                        </div>

                        <button
                            onClick={handleBatchGenerate}
                            disabled={!apiKeys.gemini || scenesToProcess.length === 0}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        >
                            <Zap className="size-4" />
                            Mulai Batch Generate ({scenesToProcess.length} scene)
                        </button>
                    </div>
                )}

                {/* Progress */}
                {(isRunning || done) && progress.length > 0 && (
                    <div className="space-y-4">
                        {/* Overall progress */}
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-zinc-200">
                                    {isRunning ? 'Sedang memproses...' : done ? 'Selesai!' : ''}
                                </span>
                                <span className="text-sm font-bold text-zinc-100">{doneCount}/{progress.length}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-zinc-800">
                                <div
                                    className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            {errorCount > 0 && (
                                <p className="text-xs text-red-400">{errorCount} scene gagal diproses</p>
                            )}
                        </div>

                        {/* Per-scene status */}
                        <div className="space-y-2">
                            {progress.map((p) => (
                                <div key={p.sceneId} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                                    <div className="shrink-0">
                                        {p.status === 'done' && <CheckCircle2 className="size-4 text-emerald-400" />}
                                        {p.status === 'error' && <XCircle className="size-4 text-red-400" />}
                                        {p.status === 'pending' && <div className="size-4 rounded-full border-2 border-zinc-600" />}
                                        {(p.status === 'generating-image' || p.status === 'generating-video') && (
                                            <Loader2 className="size-4 text-amber-400 animate-spin" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-200 truncate">{p.sceneName}</p>
                                        {p.status === 'generating-image' && <p className="text-xs text-amber-400">Generating image prompt...</p>}
                                        {p.status === 'generating-video' && <p className="text-xs text-amber-400">Generating video prompt...</p>}
                                        {p.status === 'done' && <p className="text-xs text-emerald-400">Image + video prompt selesai</p>}
                                        {p.status === 'error' && <p className="text-xs text-red-400 truncate">{p.error}</p>}
                                        {p.status === 'pending' && <p className="text-xs text-zinc-500">Menunggu...</p>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Done actions */}
                        {done && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setProgress([]); setDone(false) }}
                                    className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                                >
                                    Generate Lagi
                                </button>
                                <button
                                    onClick={() => router.push('/prompt-studio')}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400 transition-colors"
                                >
                                    Ke Prompt Studio <ArrowRight className="size-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}
