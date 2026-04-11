'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Layers, Wand2, Film, ChevronLeft, ChevronRight,
    Wrench, BookCopy, X, Lightbulb, CheckCircle2, Download
} from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { SceneList } from '@/components/scene-builder/SceneList'
import { WORKFLOW_NAV } from '@/lib/workflowNav'

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
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 p-6 text-center">
                <Layers className="size-8 text-zinc-600" />
                <p className="text-sm text-zinc-400">Pilih atau buat project terlebih dahulu.</p>
                <div className="flex gap-3">
                    <Link href="/library" className="rounded-xl bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors">
                        Ke Library
                    </Link>
                    <Link href="/idea-generator" className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
                        Buat dari Ide
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-full bg-zinc-950">
            {/* Bar atas: navigasi + langkah + CTA utama */}
            <div className="sticky top-0 z-10 border-b border-zinc-800/70 bg-zinc-950/95 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2.5 sm:px-5 sm:py-3">
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
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-zinc-950 shadow-sm transition-colors hover:bg-amber-400 disabled:pointer-events-none disabled:opacity-35 sm:text-xs sm:px-3.5 sm:py-2"
                        >
                            <Wand2 className="size-3.5" />
                            Prompt Studio
                            <ChevronRight className="size-3.5 opacity-80" />
                        </button>
                    </div>
                    {/* Di xl: sidebar kanan + kiri sudah cukup; hindari triple navigasi */}
                    <div className="-mx-1 flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none [mask-image:linear-gradient(90deg,transparent,black_8px,black_calc(100%-8px),transparent)] xl:hidden">
                        {WORKFLOW_NAV.map((s, i) => (
                            <div key={s.step} className="flex shrink-0 items-center gap-1">
                                <Link
                                    href={s.href}
                                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all sm:px-2.5 sm:py-1 ${
                                        s.step === 2
                                            ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
                                            : s.step < 2
                                              ? 'text-emerald-500/80 hover:text-emerald-400'
                                              : 'text-zinc-600 hover:text-zinc-400'
                                    }`}
                                >
                                    {s.step < 2 ? <CheckCircle2 className="size-2.5 sm:size-3" /> : null}
                                    <span className="whitespace-nowrap">{s.shortLabel}</span>
                                </Link>
                                {i < WORKFLOW_NAV.length - 1 && (
                                    <ChevronRight className="size-2.5 shrink-0 text-zinc-700 sm:size-3" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl space-y-5 px-4 py-4 sm:px-5 sm:py-5 lg:space-y-6 lg:px-6 lg:py-6">
                <div className="min-w-0 space-y-4">
                        <section className="rounded-xl border border-zinc-800/90 bg-zinc-900/35 p-4 sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                        <Layers className="size-4 shrink-0 text-amber-400" />
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                                            Scene Builder
                                        </span>
                                    </div>
                                    <h1 className="truncate text-lg font-bold tracking-tight text-zinc-100 sm:text-xl">
                                        {activeProject.name}
                                    </h1>
                                    <p className="mt-0.5 text-[11px] capitalize text-zinc-500">{activeProject.category}</p>
                                </div>
                                <div className="flex shrink-0 gap-2 sm:gap-3">
                                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 px-2.5 py-1.5 text-center sm:px-3">
                                        <p className="text-base font-bold tabular-nums text-zinc-100 sm:text-lg">{scenes.length}</p>
                                        <p className="text-[9px] text-zinc-600">Scene</p>
                                    </div>
                                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 px-2.5 py-1.5 text-center sm:px-3">
                                        <p className="text-base font-bold tabular-nums text-amber-400 sm:text-lg">{scenesWithPrompt}</p>
                                        <p className="text-[9px] text-zinc-600">Prompt</p>
                                    </div>
                                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 px-2.5 py-1.5 text-center sm:px-3">
                                        <p className="text-base font-bold tabular-nums text-emerald-400 sm:text-lg">{scenesWithImage}</p>
                                        <p className="text-[9px] text-zinc-600">Gambar</p>
                                    </div>
                                </div>
                            </div>
                            {scenes.length > 0 && (
                                <div className="mt-4 space-y-1.5">
                                    <div className="flex justify-between text-[10px] text-zinc-500">
                                        <span>Progress gambar / scene</span>
                                        <span className="tabular-nums text-zinc-400">{progressPct}%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-amber-500/80 to-emerald-500/80 transition-all duration-300"
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
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-amber-400 sm:flex-initial sm:min-w-[200px] sm:text-sm"
                                >
                                    <Wand2 className="size-4" />
                                    {scenesWithPrompt === 0 ? 'Mulai prompt' : 'Lanjut prompt'}
                                </button>
                                <Link
                                    href="/tools"
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/40 px-4 py-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200 sm:flex-initial sm:text-sm"
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
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/40 px-4 py-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200 sm:flex-initial sm:text-sm"
                                >
                                    <BookCopy className="size-4" />
                                    Template
                                </button>
                            </div>
                        )}

                        {scenes.length === 0 && (
                            <div className="flex items-start gap-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/25 px-3 py-3.5 sm:px-4">
                                <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-400" />
                                <div className="min-w-0 text-left">
                                    <p className="text-sm font-medium text-zinc-300">Belum ada scene</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                                        Tambah di bawah atau{' '}
                                        <Link href="/idea-generator" className="font-medium text-amber-400 underline-offset-2 hover:text-amber-300 hover:underline">
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
                            <div className="flex flex-col gap-2 border-t border-zinc-800/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <Link
                                    href="/idea-generator"
                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-zinc-200 sm:justify-start sm:text-sm"
                                >
                                    <ChevronLeft className="size-4" />
                                    Ide
                                </Link>
                                <div className="flex flex-wrap gap-2 sm:justify-end">
                                    <Link
                                        href="/timeline-view"
                                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-zinc-200 sm:flex-initial sm:text-sm"
                                    >
                                        <Film className="size-4" />
                                        Timeline
                                    </Link>
                                    <Link
                                        href="/export-center"
                                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-zinc-200 sm:flex-initial sm:text-sm"
                                    >
                                        <Download className="size-4" />
                                        Export
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
                                    href="/timeline-view"
                                    className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300 sm:justify-end"
                                >
                                    Lanjut timeline <ChevronRight className="size-3.5" />
                                </Link>
                            </div>
                        )}
                </div>
            </div>

            {/* Template modal */}
            {templateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-zinc-100">Simpan sebagai Template</h3>
                            <button onClick={() => setTemplateModal(false)} className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300">
                                <X className="size-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTemplate} className="space-y-3">
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="Nama template"
                                autoFocus
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/60"
                            />
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setTemplateModal(false)}
                                    className="flex-1 rounded-xl border border-zinc-700 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={!templateName.trim()}
                                    className="flex-1 rounded-xl bg-amber-500 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none transition-colors">
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
