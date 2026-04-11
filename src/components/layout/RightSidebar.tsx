'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Wrench } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { formatDate } from '@/lib/utils'
import { WORKFLOW_NAV, nextWorkflowStep, workflowStepFromPathname } from '@/lib/workflowNav'

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
        <aside className="hidden xl:flex h-screen w-56 shrink-0 flex-col border-l border-zinc-800/60 bg-zinc-900/40">
            {/* Ringkas: posisi workflow (tanpa duplikasi 5 link — sudah di sidebar kiri) */}
            <div className="border-b border-zinc-800/60 p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Workflow</p>
                {currentStep > 0 && currentMeta ? (
                    <p className="text-xs leading-snug text-zinc-400">
                        <span className="font-semibold text-zinc-200">{currentMeta.label}</span>
                        <span className="text-zinc-600"> · langkah </span>
                        <span className="tabular-nums text-zinc-300">{currentStep}</span>
                        <span className="text-zinc-600"> / 5</span>
                    </p>
                ) : (
                    <p className="text-xs text-zinc-500">Pilih langkah dari menu kiri.</p>
                )}
            </div>

            {/* Project stats */}
            {activeProject && (
                <div className="space-y-3 border-b border-zinc-800/60 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Project</p>
                    <p className="truncate text-xs font-semibold text-zinc-200">{activeProject.name}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                        <div className="rounded-lg bg-zinc-800/60 p-2 text-center">
                            <p className="text-sm font-bold text-zinc-100">{scenes.length}</p>
                            <p className="mt-0.5 text-[9px] text-zinc-600">Scene</p>
                        </div>
                        <div className="rounded-lg bg-zinc-800/60 p-2 text-center">
                            <p className="text-sm font-bold text-amber-400">{scenesWithPrompt}</p>
                            <p className="mt-0.5 text-[9px] text-zinc-600">Prompt</p>
                        </div>
                        <div className="rounded-lg bg-zinc-800/60 p-2 text-center">
                            <p className="text-sm font-bold text-emerald-400">{scenesWithImage}</p>
                            <p className="mt-0.5 text-[9px] text-zinc-600">Gambar</p>
                        </div>
                    </div>
                    {scenes.length > 0 && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-zinc-600">
                                <span>Progress</span>
                                <span>{Math.round((scenesWithImage / scenes.length) * 100)}%</span>
                            </div>
                            <div className="h-1 w-full rounded-full bg-zinc-800">
                                <div
                                    className="h-1 rounded-full bg-amber-500 transition-all"
                                    style={{ width: `${(scenesWithImage / scenes.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                    <p className="text-[10px] text-zinc-600">Diubah {formatDate(activeProject.updatedAt)}</p>
                </div>
            )}

            {/* Tools hub */}
            <div className="flex-1 overflow-y-auto p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Lanjutan</p>
                <Link
                    href="/tools"
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-xs transition-all ${
                        pathname.startsWith('/tools')
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
                    }`}
                >
                    <Wrench className="size-3.5 shrink-0" />
                    <span className="font-medium">Tools &amp; lanjutan</span>
                </Link>
                <p className="mt-2 text-[10px] leading-relaxed text-zinc-600">
                    Library, batch, translator, enhancer, storyboard, script—satu halaman.
                </p>
            </div>

            {next && (
                <div className="border-t border-zinc-800/60 p-3">
                    <Link
                        href={next.href}
                        className="flex items-center justify-between gap-2 rounded-xl bg-amber-500/10 px-3 py-2.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
                    >
                        <span>Lanjut: {next.label}</span>
                        <ArrowRight className="size-3.5 shrink-0" />
                    </Link>
                </div>
            )}
        </aside>
    )
}
