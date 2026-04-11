'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Lightbulb, Layers, Wand2, BookOpen,
    Plus, ArrowRight, Wrench, ImageIcon, TrendingUp, Film,
} from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { formatDate } from '@/lib/utils'
import { CountUp } from '@/components/ui/CountUp'

export default function DashboardPage() {
    const router = useRouter()
    const { projects, activeProjectId, createProject, setActiveProject, setActiveScene } = useAppStore()

    const activeProject = projects.find((p) => p.id === activeProjectId) ?? null
    const scenes = activeProject
        ? activeProject.sceneOrder.map((id) => activeProject.scenes[id]).filter(Boolean)
        : []
    const scenesWithImage = scenes.filter((s) => s.imageData).length
    const scenesWithPrompt = scenes.filter((s) => s.promptStatus === 'sudah').length
    const progress = scenes.length > 0 ? Math.round((scenesWithImage / scenes.length) * 100) : 0

    const continueTarget = useMemo(() => {
        if (!activeProject) return null
        const ordered = activeProject.sceneOrder.map((id) => activeProject.scenes[id]).filter(Boolean)
        const needPrompt = ordered.find((s) => !s.imagePrompt?.trim() || !s.videoPrompt?.trim())
        if (needPrompt) {
            return {
                label: `Lanjut prompt: ${needPrompt.name}`,
                sub: 'Scene berikutnya belum punya image + video prompt lengkap.',
                sceneId: needPrompt.id,
                href: '/prompt-studio' as const,
            }
        }
        const needImg = ordered.find((s) => !s.imageData)
        if (needImg) {
            return {
                label: `Generate gambar: ${needImg.name}`,
                sub: 'Prompt ada, belum ada render gambar.',
                sceneId: needImg.id,
                href: '/prompt-studio' as const,
            }
        }
        if (ordered.length > 0) {
            return {
                label: 'Review timeline & export',
                sub: 'Semua scene punya gambar — susun urutan atau ekspor.',
                sceneId: null,
                href: '/timeline-view' as const,
            }
        }
        return {
            label: 'Tambah scene',
            sub: 'Project aktif belum punya scene.',
            sceneId: null,
            href: '/scene-builder' as const,
        }
    }, [activeProject])

    function handleContinue() {
        if (!continueTarget) return
        if (continueTarget.sceneId) setActiveScene(continueTarget.sceneId)
        router.push(continueTarget.href)
    }

    const quickActions = [
        { label: 'Idea Generator', icon: Lightbulb, href: '/idea-generator', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Scene Builder', icon: Layers, href: '/scene-builder', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Prompt Studio', icon: Wand2, href: '/prompt-studio', color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Tools & lanjutan', icon: Wrench, href: '/tools', color: 'text-zinc-300', bg: 'bg-zinc-800/80' },
    ]

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-100">Dashboard</h1>
                        <p className="text-zinc-400 mt-1 text-sm">
                            RestoreGen — AI Prompt Generator untuk konten restorasi
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            createProject('Project Baru', 'lainnya')
                            router.push('/scene-builder')
                        }}
                        className="flex shrink-0 items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400 transition-colors"
                    >
                        <Plus className="size-4" />
                        Project Baru
                    </button>
                </div>

                {activeProject ? (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 transition-shadow hover:shadow-lg hover:shadow-black/20">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">Project Aktif</p>
                                <h2 className="text-xl font-bold text-zinc-100 mt-0.5">{activeProject.name}</h2>
                                <p className="text-xs text-zinc-500 mt-1">
                                    <span className="capitalize">{activeProject.category}</span> · Diubah{' '}
                                    {formatDate(activeProject.updatedAt)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black text-amber-400 tabular-nums">
                                    <CountUp value={progress} />%
                                </p>
                                <p className="text-xs text-zinc-500">selesai</p>
                            </div>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                            <div
                                className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-700 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="rounded-xl bg-zinc-800/60 p-3 text-center transition-transform hover:scale-[1.02]">
                                <p className="text-2xl font-bold tabular-nums text-zinc-100">
                                    <CountUp value={scenes.length} />
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">Total Scene</p>
                            </div>
                            <div className="rounded-xl bg-zinc-800/60 p-3 text-center transition-transform hover:scale-[1.02]">
                                <p className="text-2xl font-bold tabular-nums text-amber-400">
                                    <CountUp value={scenesWithPrompt} />
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">Prompt Selesai</p>
                            </div>
                            <div className="rounded-xl bg-zinc-800/60 p-3 text-center transition-transform hover:scale-[1.02]">
                                <p className="text-2xl font-bold tabular-nums text-emerald-400">
                                    <CountUp value={scenesWithImage} />
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">Gambar Selesai</p>
                            </div>
                        </div>

                        {continueTarget && (
                            <button
                                type="button"
                                onClick={handleContinue}
                                className="group flex w-full flex-col items-start gap-1 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-left transition-all hover:border-amber-500/55 hover:bg-amber-500/15"
                            >
                                <span className="flex w-full items-center justify-between gap-2">
                                    <span className="text-sm font-semibold text-amber-300">{continueTarget.label}</span>
                                    <ArrowRight className="size-4 shrink-0 text-amber-500 transition-transform group-hover:translate-x-0.5" />
                                </span>
                                <span className="text-xs text-amber-200/70">{continueTarget.sub}</span>
                            </button>
                        )}

                        <div className="flex gap-2 pt-1 flex-wrap">
                            <Link
                                href="/prompt-studio"
                                className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl bg-amber-500/10 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
                            >
                                <Wand2 className="size-4" />
                                Prompt Studio
                            </Link>
                            <Link
                                href="/tools"
                                className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/40 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800/70 transition-colors"
                            >
                                <Wrench className="size-4" />
                                Tools
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 p-10 text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="rounded-full bg-amber-500/10 p-4">
                                <TrendingUp className="size-8 text-amber-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-zinc-200 font-semibold">Belum ada project aktif</p>
                            <p className="text-zinc-500 text-sm mt-1">Buat project baru atau pilih dari Library</p>
                        </div>
                        <div className="flex justify-center gap-3 flex-wrap">
                            <button
                                type="button"
                                onClick={() => {
                                    createProject('Project Pertama', 'furniture')
                                    router.push('/scene-builder')
                                }}
                                className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400 transition-colors"
                            >
                                <Plus className="size-4" />
                                Buat Project
                            </button>
                            <Link
                                href="/library"
                                className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                            >
                                <BookOpen className="size-4" />
                                Buka Library
                            </Link>
                        </div>
                    </div>
                )}

                <div>
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {quickActions.map(({ label, icon: Icon, href, color, bg }) => (
                            <Link
                                key={href}
                                href={href}
                                className="flex flex-col items-center gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-center hover:border-amber-500/30 hover:bg-zinc-800/50 transition-all group hover:-translate-y-0.5"
                            >
                                <div className={`rounded-xl ${bg} p-2.5 transition-transform group-hover:scale-105`}>
                                    <Icon className={`size-5 ${color}`} />
                                </div>
                                <span className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors leading-tight">
                                    {label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {projects.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                                Project Terbaru
                            </h2>
                            <Link
                                href="/library"
                                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                            >
                                Lihat semua <ArrowRight className="size-3" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {projects
                                .slice(-3)
                                .reverse()
                                .map((project) => {
                                    const pScenes = project.sceneOrder.map((id) => project.scenes[id]).filter(Boolean)
                                    const pImages = pScenes.filter((s) => s.imageData).length
                                    return (
                                        <div
                                            key={project.id}
                                            className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-all hover:border-amber-500/40"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveProject(project.id)
                                                    router.push('/scene-builder')
                                                }}
                                                className={`w-full text-left p-4 ${project.id === activeProjectId ? 'ring-1 ring-amber-500/50 bg-amber-500/5' : ''}`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-zinc-100 truncate">
                                                            {project.name}
                                                        </p>
                                                        <p className="text-xs text-zinc-500 mt-0.5 capitalize">
                                                            {project.category}
                                                        </p>
                                                    </div>
                                                    {project.id === activeProjectId && (
                                                        <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                                                            Aktif
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
                                                    <span className="flex items-center gap-1">
                                                        <Layers className="size-3" />
                                                        {pScenes.length} scene
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <ImageIcon className="size-3" />
                                                        {pImages} gambar
                                                    </span>
                                                </div>
                                            </button>
                                            <div className="absolute inset-x-0 bottom-0 flex gap-1 border-t border-zinc-800/80 bg-zinc-950/90 p-1.5 opacity-0 translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setActiveProject(project.id)
                                                        router.push('/scene-builder')
                                                    }}
                                                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-zinc-800 py-1.5 text-[10px] font-medium text-zinc-300 hover:bg-zinc-700"
                                                >
                                                    <Layers className="size-3" /> Scene
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setActiveProject(project.id)
                                                        const first = project.sceneOrder[0]
                                                        if (first) setActiveScene(first)
                                                        router.push('/prompt-studio')
                                                    }}
                                                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-amber-500/15 py-1.5 text-[10px] font-medium text-amber-400 hover:bg-amber-500/25"
                                                >
                                                    <Wand2 className="size-3" /> Prompt
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setActiveProject(project.id)
                                                        router.push('/timeline-view')
                                                    }}
                                                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-zinc-800 py-1.5 text-[10px] font-medium text-zinc-300 hover:bg-zinc-700"
                                                >
                                                    <Film className="size-3" /> Timeline
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>
                )}

                <div>
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Lainnya</h2>
                    <Link
                        href="/tools"
                        className="group flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-gradient-to-br from-amber-500/5 to-zinc-900 p-5 hover:border-amber-500/30 transition-all sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex items-start gap-3 sm:items-center">
                            <div className="rounded-xl bg-zinc-800/80 p-2.5">
                                <Wrench className="size-5 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-100">Tools &amp; lanjutan</h3>
                                <p className="mt-0.5 text-xs text-zinc-500 leading-relaxed">
                                    Prompt library, batch, translator, enhancer, storyboard, script.
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-amber-400 group-hover:gap-2 transition-all sm:pl-4">
                            Buka halaman Tools <ArrowRight className="size-3" />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
