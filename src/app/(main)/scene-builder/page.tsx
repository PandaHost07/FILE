'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Layers, Wand2, ChevronLeft, ChevronRight,
    Wrench, BookCopy, X, Lightbulb, CheckCircle2
} from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { WorkflowNavStrip } from '@/components/layout/WorkflowNavStrip'
import { cardBodyPad, cardHeaderBar, cardSurface, inputField, pageGradient, shellBg } from '@/lib/uiTokens'
import { cn } from '@/lib/utils'

const SceneList = dynamic(
    () => import('@/components/scene-builder/SceneList').then((m) => ({ default: m.SceneList })),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-[200px] rounded-xl border border-zinc-800/80 bg-zinc-900/30 animate-pulse" aria-hidden />
        ),
    }
)

export default function SceneBuilderPage() {
    const router = useRouter()
    const { projects, activeProjectId, setActiveScene, saveAsTemplate } = useAppStore()

    const activeProject = projects.find((p) => p.id === activeProjectId) ?? null
    const scenes = activeProject
        ? activeProject.sceneOrder.map((id) => activeProject.scenes[id]).filter(Boolean)
        : []

    const scenesWithPrompt = scenes.filter((s) => s.promptStatus === 'sudah').length
    const scenesWithImage = scenes.filter((s) => s.imageData).length
    const allHavePrompt = scenes.length > 0 && scenesWithPrompt === scenes.length
    const progressPct =
        scenes.length > 0 ? Math.round((scenesWithImage / scenes.length) * 100) : 0

    const [templateModal, setTemplateModal] = useState(false)
    const [templateName, setTemplateName] = useState('')

    function handleOpenPromptStudio(sceneId: string) {
        setActiveScene(sceneId)
        router.push('/prompt-studio')
    }

    function handleGoToFirstScene() {
        if (scenes.length === 0) return
        setActiveScene(scenes[0].id)
        router.push('/prompt-studio')
    }

    function handleSaveTemplate(e: React.FormEvent) {
        e.preventDefault()
        const trimmed = templateName.trim()
        if (!trimmed || !activeProjectId) return
        saveAsTemplate(activeProjectId, trimmed)
        setTemplateName('')
        setTemplateModal(false)
    }

    if (!activeProject) {
        return (
            <div className={cn('relative flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center', shellBg)}>
                <div className={pageGradient.violet} aria-hidden />
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <Layers className="size-8 text-violet-400/80" />
                    <p className="text-sm text-zinc-400">Pilih atau buat project terlebih dahulu.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            href="/library"
                            className="rounded-xl bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-300 ring-1 ring-violet-500/30 transition hover:bg-violet-500/25"
                        >
                            Ke Library
                        </Link>
                        <Link
                            href="/idea-generator"
                            className="rounded-xl border border-[#2a2a2e] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-[#121214]"
                        >
                            Buat dari ide
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={cn('relative min-h-full', shellBg)}>
            <div className={pageGradient.violet} aria-hidden />
            {/* Bar atas: navigasi + langkah + CTA utama */}
            <div className="sticky top-0 z-20 border-b border-[#1a1a1a] bg-[#050505]/92 backdrop-blur-md">
                <div className="flex w-full min-w-0 flex-col gap-2 px-4 py-2.5 sm:px-5 sm:py-3 lg:px-8 xl:px-10">
                    <div className="flex items-center justify-between gap-3">
                        <Link
                            href="/idea-generator"
                            className="flex min-w-0 items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300 sm:text-xs"
                        >
                            <ChevronLeft className="size-3.5 shrink-0" />
                            <span className="truncate">Ide</span>
                        </Link>
                        <button
                            type="button"
                            onClick={handleGoToFirstScene}
                            disabled={scenes.length === 0}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-400 disabled:pointer-events-none disabled:opacity-35 sm:text-xs sm:px-3.5 sm:py-2"
                        >
                            <Wand2 className="size-3.5" />
                            Prompt Studio
                            <ChevronRight className="size-3.5 opacity-80" />
                        </button>
                    </div>
                    <WorkflowNavStrip />
                </div>
            </div>

            <div className="relative z-10 w-full min-w-0 space-y-5 px-4 py-4 sm:px-5 sm:py-5 lg:space-y-6 lg:px-8 lg:py-6 xl:px-10">
                <div className="min-w-0 space-y-4">
                        <section className={cardSurface}>
                            <div className={cn(cardHeaderBar, 'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between')}>
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                        <Layers className="size-4 shrink-0 text-violet-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                            Scene Builder
                                        </span>
                                    </div>
                                    <h1 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">
                                        {activeProject.name}
                                    </h1>
                                    <p className="mt-0.5 text-[11px] capitalize text-zinc-500">{activeProject.category}</p>
                                </div>
                                <div className="flex shrink-0 gap-2 sm:gap-3">
                                    <div className="rounded-lg border border-[#2a2a2e] bg-[#0d0d10] px-2.5 py-1.5 text-center sm:px-3">
                                        <p className="text-base font-bold tabular-nums text-zinc-100 sm:text-lg">{scenes.length}</p>
                                        <p className="text-[9px] text-zinc-600">Scene</p>
                                    </div>
                                    <div className="rounded-lg border border-violet-500/25 bg-violet-500/10 px-2.5 py-1.5 text-center sm:px-3">
                                        <p className="text-base font-bold tabular-nums text-violet-300 sm:text-lg">{scenesWithPrompt}</p>
                                        <p className="text-[9px] text-violet-400/90">Prompt</p>
                                    </div>
                                    <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 text-center sm:px-3">
                                        <p className="text-base font-bold tabular-nums text-emerald-300 sm:text-lg">{scenesWithImage}</p>
                                        <p className="text-[9px] text-emerald-400/90">Gambar</p>
                                    </div>
                                </div>
                            </div>
                            {scenes.length > 0 && (
                                <div className={cn(cardBodyPad, 'space-y-1.5 pt-0')}>
                                    <div className="flex justify-between text-[10px] text-zinc-500">
                                        <span>Progress gambar / scene</span>
                                        <span className="tabular-nums text-zinc-400">{progressPct}%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a1e]">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-violet-500/90 to-emerald-500/80 transition-all duration-300"
                                            style={{ width: `${progressPct}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        {scenes.length > 0 && (
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                <button
                                    type="button"
                                    onClick={handleGoToFirstScene}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400 sm:flex-initial sm:min-w-[200px] sm:text-sm"
                                >
                                    <Wand2 className="size-4" />
                                    {scenesWithPrompt === 0 ? 'Mulai prompt' : 'Lanjut prompt'}
                                </button>
                                <Link
                                    href="/tools"
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#2a2a2e] bg-[#121214] px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200 sm:flex-initial sm:text-sm"
                                >
                                    <Wrench className="size-4" />
                                    Tools
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTemplateName(activeProject.name)
                                        setTemplateModal(true)
                                    }}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#2a2a2e] bg-[#121214] px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-fuchsia-500/30 hover:text-fuchsia-300 sm:flex-initial sm:text-sm"
                                >
                                    <BookCopy className="size-4" />
                                    Template
                                </button>
                            </div>
                        )}

                        {scenes.length === 0 && (
                            <div className="flex items-start gap-3 rounded-2xl border border-dashed border-[#2a2a2e] bg-[#0c0c0e] px-3 py-3.5 sm:px-4">
                                <Lightbulb className="mt-0.5 size-4 shrink-0 text-violet-400" />
                                <div className="min-w-0 text-left">
                                    <p className="text-sm font-medium text-zinc-300">Belum ada scene</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                                        Tambah di bawah atau{' '}
                                        <Link href="/idea-generator" className="font-medium text-violet-400 underline-offset-2 hover:text-violet-300 hover:underline">
                                            dari Idea Generator
                                        </Link>
                                        .
                                    </p>
                                </div>
                            </div>
                        )}

                        <SceneList
                            projectId={activeProject.id}
                            scenes={activeProject.scenes}
                            sceneOrder={activeProject.sceneOrder}
                            onOpenPromptStudio={handleOpenPromptStudio}
                        />

                        {scenes.length > 0 && (
                            <div className="flex flex-col gap-2 border-t border-[#1a1a1a] pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <Link
                                    href="/idea-generator"
                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-zinc-200 sm:justify-start sm:text-sm"
                                >
                                    <ChevronLeft className="size-4" />
                                    Ide
                                </Link>
                                <div className="flex flex-wrap gap-2 sm:justify-end">
                                    <Link
                                        href="/prompt-studio"
                                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 sm:flex-initial sm:text-sm"
                                    >
                                        Prompt Studio
                                    </Link>
                                </div>
                            </div>
                        )}

                        {allHavePrompt && (
                            <div className="flex flex-col gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                                    <p className="text-sm font-medium text-emerald-200/95">Semua scene sudah punya prompt</p>
                                </div>
                                <Link
                                    href="/prompt-studio"
                                    className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300 sm:justify-end"
                                >
                                    Buka Prompt Studio <ChevronRight className="size-3.5" />
                                </Link>
                            </div>
                        )}
                </div>
            </div>

            {/* Template modal */}
            {templateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className={cn(cardSurface, 'w-full max-w-sm')}>
                        <div className={cn(cardHeaderBar, 'flex items-center justify-between')}>
                            <h3 className="text-sm font-bold text-zinc-100">Simpan sebagai template</h3>
                            <button
                                type="button"
                                onClick={() => setTemplateModal(false)}
                                className="rounded-md p-1 text-zinc-500 hover:bg-[#1a1a1e] hover:text-zinc-300"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTemplate} className={cn(cardBodyPad, 'space-y-3')}>
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="Nama template"
                                autoFocus
                                className={inputField('violet')}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTemplateModal(false)}
                                    className="flex-1 rounded-xl border border-[#2a2a2e] py-2.5 text-sm text-zinc-300 transition hover:bg-[#1a1a1e]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={!templateName.trim()}
                                    className="flex-1 rounded-xl bg-fuchsia-500 py-2.5 text-sm font-bold text-white shadow-md shadow-fuchsia-500/20 transition hover:bg-fuchsia-400 disabled:pointer-events-none disabled:opacity-40"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
