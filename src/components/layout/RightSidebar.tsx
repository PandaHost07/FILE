'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Wrench, TrendingUp, Zap, Layers, Palette, Sparkles, FileText, Settings, HelpCircle, BookOpen } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { formatDate } from '@/lib/utils'
import { WORKFLOW_NAV, WORKFLOW_STEP_COUNT, nextWorkflowStep, workflowStepFromPathname } from '@/lib/workflowNav'

export function RightSidebar() {
    const pathname = usePathname()
    const { projects, activeProjectId } = useAppStore()

    const activeProject = projects.find((p) => p.id === activeProjectId) ?? null
    const scenes = activeProject
        ? activeProject.sceneOrder.map((id) => activeProject.scenes[id]).filter(Boolean)
        : []
    const scenesWithImage = scenes.filter((s) => s.imageData).length
    const scenesWithPrompt = scenes.filter((s) => s.promptStatus === 'sudah').length

    const currentStep = workflowStepFromPathname(pathname)
    const currentMeta = WORKFLOW_NAV.find((s) => s.step === currentStep)
    const next = nextWorkflowStep(pathname)

    return (
        <aside className="hidden xl:flex h-screen w-64 shrink-0 flex-col border-l border-zinc-800/60 bg-zinc-900/40">
            {/* Header */}
            <div className="border-b border-zinc-800/60 p-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Workspace</p>
                    <button className="text-zinc-600 hover:text-zinc-400 transition-colors">
                        <Settings className="size-4" />
                    </button>
                </div>
                
                {/* Workflow Progress */}
                {currentStep > 0 && currentMeta ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-zinc-300">
                                {currentMeta.label}
                            </p>
                            <span className="text-xs text-zinc-600">
                                {currentStep} / {WORKFLOW_STEP_COUNT}
                            </span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-zinc-800">
                            <div
                                className="h-1 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all"
                                style={{ width: `${(currentStep / WORKFLOW_STEP_COUNT) * 100}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-zinc-500">Select workflow from left menu</p>
                )}
            </div>

            {/* Project Overview */}
            {activeProject && (
                <div className="space-y-4 border-b border-zinc-800/60 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Active Project</p>
                        <button className="text-zinc-600 hover:text-zinc-400 transition-colors">
                            <HelpCircle className="size-4" />
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        <div>
                            <p className="truncate text-sm font-semibold text-zinc-200">{activeProject.name}</p>
                            <p className="text-xs text-zinc-600">{formatDate(activeProject.updatedAt)}</p>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-lg bg-zinc-800/60 p-3 text-center border border-zinc-700/40">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Layers className="size-3 text-zinc-400" />
                                    <span className="text-[9px] text-zinc-600">Scenes</span>
                                </div>
                                <p className="text-lg font-bold text-zinc-100">{scenes.length}</p>
                            </div>
                            <div className="rounded-lg bg-zinc-800/60 p-3 text-center border border-amber-500/30">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <FileText className="size-3 text-amber-400" />
                                    <span className="text-[9px] text-zinc-600">Prompts</span>
                                </div>
                                <p className="text-lg font-bold text-amber-400">{scenesWithPrompt}</p>
                            </div>
                            <div className="rounded-lg bg-zinc-800/60 p-3 text-center border border-emerald-500/30">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Palette className="size-3 text-emerald-400" />
                                    <span className="text-[9px] text-zinc-600">Images</span>
                                </div>
                                <p className="text-lg font-bold text-emerald-400">{scenesWithImage}</p>
                            </div>
                        </div>
                        
                        {/* Progress Bar */}
                        {scenes.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-600">Completion</span>
                                    <span className="font-medium text-zinc-300">{Math.round((scenesWithImage / scenes.length) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-zinc-800">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all"
                                        style={{ width: `${(scenesWithImage / scenes.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Quick Stats */}
                <div className="space-y-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Quick Stats</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-zinc-800/60 p-3 border border-zinc-700/40">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="size-4 text-emerald-400" />
                                <span className="text-xs font-medium text-zinc-300">Performance</span>
                            </div>
                            <p className="text-lg font-bold text-emerald-400">98%</p>
                            <p className="text-[9px] text-zinc-600">Excellent</p>
                        </div>
                        <div className="rounded-lg bg-zinc-800/60 p-3 border border-zinc-700/40">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="size-4 text-amber-400" />
                                <span className="text-xs font-medium text-zinc-300">Speed</span>
                            </div>
                            <p className="text-lg font-bold text-amber-400">1.2s</p>
                            <p className="text-[9px] text-zinc-600">Average</p>
                        </div>
                    </div>
                    
                    {/* Activity Feed */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Recent Activity</p>
                        <div className="space-y-2">
                            {[
                                { icon: Sparkles, title: 'Generated 5 images', time: '2 min ago', color: 'emerald' },
                                { icon: FileText, title: 'Created 3 prompts', time: '15 min ago', color: 'amber' },
                                { icon: Layers, title: 'Built 2 scenes', time: '1 hour ago', color: 'blue' },
                                { icon: Palette, title: 'Edited 1 image', time: '2 hours ago', color: 'purple' },
                            ].map((activity, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg border border-zinc-700/40 hover:bg-zinc-800/50 transition-colors">
                                    <div className={`flex size-6 items-center justify-center rounded-full bg-${activity.color}-500/10`}>
                                        <activity.icon className={`size-3 text-${activity.color}-400`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-zinc-300 truncate">{activity.title}</p>
                                        <p className="text-[9px] text-zinc-600">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Tools Section */}
                <div className="space-y-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Tools & Resources</p>
                    <div className="space-y-2">
                        <Link
                            href="/tools"
                            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all ${
                                pathname.startsWith('/tools')
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                    : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300 border border-zinc-700/40'
                            }`}
                        >
                            <Wrench className="size-4 shrink-0" />
                            <div className="flex-1">
                                <span className="font-medium">Tools & Lanjutan</span>
                                <p className="text-[9px] text-zinc-600">Advanced utilities</p>
                            </div>
                            {pathname.startsWith('/tools') && (
                                <div className="size-1.5 rounded-full bg-amber-400" />
                            )}
                        </Link>
                        
                        <Link
                            href="/library"
                            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all ${
                                pathname.startsWith('/library')
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300 border border-zinc-700/40'
                            }`}
                        >
                            <BookOpen className="size-4 shrink-0" />
                            <div className="flex-1">
                                <span className="font-medium">Library</span>
                                <p className="text-[9px] text-zinc-600">Asset management</p>
                            </div>
                            {pathname.startsWith('/library') && (
                                <div className="size-1.5 rounded-full bg-emerald-400" />
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-zinc-800/60 p-4 space-y-3">
                {next && (
                    <Link
                        href={next.href}
                        className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 px-4 py-3 text-sm font-medium text-amber-400 transition-all hover:from-amber-500/20 hover:to-amber-600/20 border border-amber-500/30"
                    >
                        <div className="flex items-center gap-2">
                            <span>Next: {next.label}</span>
                            <ArrowRight className="size-4 shrink-0" />
                        </div>
                    </Link>
                )}
                
                {/* Quick Help */}
                <div className="flex items-center justify-between">
                    <p className="text-[9px] text-zinc-600">Need help?</p>
                    <button className="text-zinc-600 hover:text-zinc-400 transition-colors">
                        <HelpCircle className="size-4" />
                    </button>
                </div>
            </div>
        </aside>
    )
}
