'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Layers } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { TimelineDndStrip } from '@/components/timeline-view/TimelineDndStrip'
import { loadImage } from '@/lib/imageStorage'

export default function TimelineViewPage() {
    const router = useRouter()
    const { projects, activeProjectId, setActiveScene, reorderScenes } = useAppStore()
    const [thumbs, setThumbs] = useState<Record<string, string>>({})

    const activeProject = projects.find((p) => p.id === activeProjectId) ?? null

    const sceneIdsKey = activeProject?.sceneOrder.join('|') ?? ''

    useEffect(() => {
        if (!activeProject) return
        let cancelled = false
        ;(async () => {
            const next: Record<string, string> = {}
            for (const id of activeProject.sceneOrder) {
                const img = await loadImage(id)
                if (img) next[id] = img
            }
            if (!cancelled) setThumbs(next)
        })()
        return () => {
            cancelled = true
        }
    }, [activeProject?.id, sceneIdsKey])

    const scenes = useMemo(() => {
        if (!activeProject) return []
        return activeProject.sceneOrder.map((id) => activeProject.scenes[id]).filter(Boolean)
    }, [activeProject])

    if (!activeProject) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 p-6 text-center">
                <Layers className="size-8 text-zinc-600" />
                <p className="text-sm text-zinc-400">Tidak ada project aktif.</p>
                <Link
                    href="/library"
                    className="rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
                >
                    Ke Library
                </Link>
            </div>
        )
    }

    const totalScenes = scenes.length
    const scenesWithImage = scenes.filter((s) => !!(s.imageData || thumbs[s.id])).length
    const scenesWithFullPrompt = scenes.filter((s) => !!s.imagePrompt && !!s.videoPrompt).length
    const allHaveImage = totalScenes > 0 && scenesWithImage === totalScenes

    function handleOpenScene(sceneId: string) {
        setActiveScene(sceneId)
        router.push('/prompt-studio')
    }

    return (
        <div className="min-h-full bg-zinc-950">
            <div className="mx-auto max-w-6xl space-y-5 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
                <header className="border-b border-zinc-800/80 pb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Timeline</p>
                    <h1 className="text-lg font-bold tracking-tight text-zinc-100">{activeProject.name}</h1>
                    <p className="mt-1 text-[11px] text-zinc-600">
                        Seret ikon grip untuk mengubah urutan (sama seperti Scene Builder). Klik kartu untuk Prompt
                        Studio.
                    </p>
                </header>

                <div className="flex flex-wrap gap-3">
                    <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/40 px-4 py-3 transition-colors hover:border-zinc-700">
                        <p className="text-xs text-zinc-500">Total Scene</p>
                        <p className="text-xl font-bold text-zinc-100">{totalScenes}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/40 px-4 py-3 transition-colors hover:border-zinc-700">
                        <p className="text-xs text-zinc-500">Dengan Gambar</p>
                        <p className="text-xl font-bold text-green-400">{scenesWithImage}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/40 px-4 py-3 transition-colors hover:border-zinc-700">
                        <p className="text-xs text-zinc-500">Prompt Lengkap</p>
                        <p className="text-xl font-bold text-amber-400">{scenesWithFullPrompt}</p>
                    </div>
                </div>

                {scenes.length > 0 && (
                    <TimelineDndStrip
                        scenes={scenes}
                        sceneOrder={activeProject.sceneOrder}
                        thumbs={thumbs}
                        projectId={activeProject.id}
                        onReorder={reorderScenes}
                        onOpenScene={handleOpenScene}
                    />
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => allHaveImage && router.push('/export-center')}
                        disabled={!allHaveImage}
                        title={
                            !allHaveImage
                                ? `${totalScenes - scenesWithImage} scene belum punya gambar`
                                : undefined
                        }
                        className={
                            allHaveImage
                                ? 'rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400'
                                : 'cursor-not-allowed rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-500'
                        }
                    >
                        Lanjut ke Export
                    </button>
                    {!allHaveImage && (
                        <p className="text-xs text-zinc-500">
                            {totalScenes - scenesWithImage} scene belum punya gambar
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
