'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Lightbulb, Layers, Wand2, BookOpen,
    Plus, ArrowRight, Wrench, ImageIcon, TrendingUp,
    Zap, Sparkles, LayoutDashboard, Clock
} from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { formatDate, cn } from '@/lib/utils'

export default function DashboardPage() {
    const router = useRouter()
    const { projects, activeProjectId, createProject, setActiveProject, setActiveScene } = useAppStore()

    const activeProject = projects.find((p) => p.id === activeProjectId) ?? null
    const scenes = activeProject
        ? activeProject.sceneOrder.map((id) => activeProject.scenes[id]).filter(Boolean)
        : []
    const scenesWithImage = scenes.filter((s) => s.imageData).length
    const scenesWithPrompt = scenes.filter((s) => s.promptStatus === 'sudah').length

    const continueTarget = useMemo(() => {
        if (!activeProject) return null
        const ordered = activeProject.sceneOrder.map((id) => activeProject.scenes[id]).filter(Boolean)
        const needPrompt = ordered.find((s) => !s.imagePrompt?.trim() || !s.videoPrompt?.trim())
        if (needPrompt) return { label: `Continue: ${needPrompt.name}`, sceneId: needPrompt.id, href: '/prompt-studio' as const }
        const needImg = ordered.find((s) => !s.imageData)
        if (needImg) return { label: `Gen Image: ${needImg.name}`, sceneId: needImg.id, href: '/prompt-studio' as const }
        if (ordered.length > 0) return { label: 'Review Prompt Studio', sceneId: null, href: '/prompt-studio' as const }
        return { label: 'Add New Scene', sceneId: null, href: '/scene-builder' as const }
    }, [activeProject])

    function handleContinue() {
        if (!continueTarget) return
        if (continueTarget.sceneId) setActiveScene(continueTarget.sceneId)
        router.push(continueTarget.href)
    }

    const quickActions = [
        { label: 'Idea Generator', icon: Lightbulb, href: '/idea-generator', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        { label: 'Scene Builder', icon: Layers, href: '/scene-builder', color: 'text-zinc-300', bg: 'bg-[#121214] border-zinc-800' },
        { label: 'Prompt Studio', icon: Wand2, href: '/prompt-studio', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
        { label: 'Asset Library', icon: BookOpen, href: '/library', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    ]

    return (
        <div className="h-full w-full overflow-y-auto bg-[#000000] p-6 md:p-10 scrollbar-thin">
            <div className="mx-auto max-w-6xl space-y-10 pb-20">

                {/* Dashboard Header */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold tracking-widest text-[#10B981] uppercase">
                            <Zap className="size-3.5" />
                            <span>System Active</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1.5">Master Dashboard</h1>
                        <p className="text-sm text-[#8b8b93]">AI Prompt Generator for viral restoration concepts.</p>
                    </div>
                    <button type="button"
                        onClick={() => { createProject('Project Baru', 'lainnya'); router.push('/scene-builder') }}
                        className="group flex h-11 items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110">
                        <Plus className="size-4" />
                        <span>Create New Project</span>
                    </button>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                        { label: 'Total Projects', value: projects.length, color: 'text-blue-400', glow: 'from-blue-500/20', icon: LayoutDashboard },
                        { label: 'Active Scenes', value: scenes.length, color: 'text-purple-400', glow: 'from-purple-500/20', icon: Layers },
                        { label: 'Generated Prompts', value: scenesWithPrompt, color: 'text-amber-400', glow: 'from-amber-500/20', icon: Wand2 },
                        { label: 'Rendered Assets', value: scenesWithImage, color: 'text-[#10B981]', glow: 'from-[#10B981]/20', icon: ImageIcon },
                    ].map(({ label, value, color, glow, icon: Icon }) => (
                        <div key={label} className="relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0A0A0C] p-6">
                            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl block`}></div>
                            <div className="relative z-10 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#8b8b93]">{label}</p>
                                <Icon className={`size-4 ${color}`} />
                            </div>
                            <p className="relative z-10 mt-4 text-[2rem] font-bold text-white">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Active Project Highlight */}
                {activeProject ? (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8b8b93]">Active Workspace</h2>
                        </div>
                        <div className="relative overflow-hidden rounded-3xl border border-[#1a1a1a] bg-[#0A0A0C] p-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent"></div>
                            <div className="relative rounded-[20px] bg-[#050505] p-6 md:p-8">
                                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
                                            <Sparkles className="size-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <div className="mb-1 flex items-center gap-2">
                                                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-indigo-400 uppercase">Live</span>
                                                <h2 className="text-xl font-bold text-white tracking-wide">{activeProject.name}</h2>
                                            </div>
                                            <p className="text-sm text-[#8b8b93]">Running {scenes.length} sequence shots.</p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-3">
                                        <button type="button" onClick={() => router.push('/scene-builder')}
                                            className="flex h-10 items-center gap-2 rounded-xl border border-zinc-800 bg-[#0A0A0C] px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800/80">
                                            <Wrench className="size-4 text-zinc-400" />
                                            Manage Scenes
                                        </button>
                                        {continueTarget && (
                                            <button type="button" onClick={handleContinue}
                                                className="group flex h-10 items-center gap-2.5 rounded-xl bg-[#10B981] px-5 text-sm font-bold text-[#050505] transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20">
                                                <span>{continueTarget.label}</span>
                                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Modern Progress Segment */}
                                {scenes.length > 0 && (
                                    <div className="mt-8 rounded-2xl border border-[#1a1a1a] bg-[#0A0A0C] p-4 sm:p-6 transition-all hover:border-zinc-800">
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-xs font-semibold text-zinc-400">Rendering Progress</p>
                                            <p className="text-xs font-bold text-indigo-400">{Math.round((scenesWithImage / scenes.length) * 100)}% Complete</p>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#1A1A1E]">
                                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-[#10B981] transition-all duration-1000 ease-out"
                                                style={{ width: `${scenes.length > 0 ? (scenesWithImage / scenes.length) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-3xl border border-dashed border-[#222222] bg-[#050505] p-12 text-center relative max-w-3xl mx-auto">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-[#050505] to-[#050505]"></div>
                        <div className="relative">
                            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-zinc-900/80 border border-zinc-800/50 shadow-xl">
                                <TrendingUp className="size-8 text-zinc-500" />
                            </div>
                            <h2 className="mb-2 text-xl font-bold tracking-tight text-white">No Project Running</h2>
                            <p className="mx-auto max-w-sm text-sm text-[#8b8b93] mb-8">
                                You don&apos;t have an active workspace. Create a new generative project or load one from your library to begin.
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <Link href="/library" className="flex h-11 items-center justify-center rounded-xl border border-zinc-800 bg-[#0A0A0C] px-6 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800">
                                    Browse Library
                                </Link>
                                <button type="button" onClick={() => { createProject('Project One', 'furniture'); router.push('/scene-builder') }}
                                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-500">
                                    <Plus className="size-4" /> Start New Video
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Two Column Layout for Quick Actions & Recent */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_350px]">
                    {/* Recent Projects */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8b8b93]">Recent Workspaces</h2>
                            <Link href="/library" className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 transition-colors hover:text-blue-300">
                                VIEW ALL <ArrowRight className="size-3" />
                            </Link>
                        </div>
                        {projects.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {projects.slice(-4).reverse().map((project) => {
                                    const pScenes = project.sceneOrder.map((id) => project.scenes[id]).filter(Boolean)
                                    const pImages = pScenes.filter((s) => s.imageData).length
                                    const isActive = project.id === activeProjectId
                                    return (
                                        <button key={project.id} type="button"
                                            onClick={() => { setActiveProject(project.id); router.push('/scene-builder') }}
                                            className={cn(
                                                "group relative flex flex-col items-start rounded-2xl border bg-[#0A0A0C] p-5 text-left transition-all hover:border-zinc-700",
                                                isActive ? "border-blue-500/40 bg-blue-500/5 shadow-lg shadow-blue-500/5" : "border-[#1a1a1a]"
                                            )}>
                                            {isActive && <div className="absolute right-4 top-4 size-2 rounded-full bg-blue-500 animate-pulse"></div>}
                                            <p className="mb-1 w-5/6 truncate text-[15px] font-bold text-white group-hover:text-blue-400 transition-colors">{project.name}</p>
                                            <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-[#8b8b93]">{project.category}</p>
                                            <div className="mt-auto flex w-full items-center justify-between border-t border-[#1a1a1a] pt-3">
                                                <div className="flex items-center gap-3 text-[11px] font-medium text-zinc-500">
                                                    <span className="flex items-center gap-1"><Layers className="size-3.5" /> {pScenes.length}</span>
                                                    <span className="flex items-center gap-1"><ImageIcon className="size-3.5" /> {pImages}</span>
                                                </div>
                                                <span className="flex items-center gap-1 text-[10px] text-zinc-600"><Clock className="size-3" /> {formatDate(project.updatedAt).split(' ')[0]}</span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center rounded-xl border border-dashed border-[#222222] bg-[#000000] py-12 text-center">
                                <span className="text-sm text-zinc-600">No project history</span>
                            </div>
                        )}
                    </div>

                    {/* Quick Launch */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8b8b93]">Launchpad</h2>
                        <div className="flex flex-col gap-3">
                            {quickActions.map(({ label, icon: Icon, href, color, bg }) => (
                                <Link key={href} href={href}
                                    className="group flex h-14 items-center justify-between rounded-xl border border-[#1a1a1a] bg-[#0A0A0C] px-4 transition-all hover:border-zinc-700 hover:bg-[#121214]">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("flex size-8 items-center justify-center rounded-lg border", bg)}>
                                            <Icon className={cn("size-4", color)} />
                                        </div>
                                        <span className="text-[13px] font-semibold text-zinc-200 group-hover:text-white transition-colors">{label}</span>
                                    </div>
                                    <ArrowRight className="size-4 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-zinc-400" />
                                </Link>
                            ))}
                            
                            {/* Upsell / Tools box */}
                            <Link href="/tools" className="group mt-2 relative overflow-hidden rounded-2xl border border-[#1a1a1a] p-5 hover:border-amber-500/30 transition-all">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-[#0A0A0C]"></div>
                                <div className="relative">
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex size-7 items-center justify-center rounded-full bg-amber-500/20">
                                            <Wrench className="size-3.5 text-amber-500" />
                                        </div>
                                        <ArrowRight className="size-4 text-amber-500/50 transition-transform group-hover:translate-x-1" />
                                    </div>
                                    <h3 className="mb-1 text-[13px] font-bold text-amber-500/90">Advanced Tools</h3>
                                    <p className="text-[11px] leading-relaxed text-[#8b8b93]">Batch generation, translator, scene enhancer & video scripts.</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
