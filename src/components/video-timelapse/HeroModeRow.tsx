'use client'

import { Sparkles, Timer, Trees, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimelapseLandingMode } from '@/lib/videoTimelapseLandingMenu'
import { cardBase, sectionLabel, sectionScrollClass } from './constants'

interface HeroModeRowProps {
    mode: TimelapseLandingMode | null
    onSetMode: (m: TimelapseLandingMode) => void
}

export function HeroModeRow({ mode, onSetMode }: HeroModeRowProps) {
    return (
        <div id="section-mode" className={cn('grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch lg:gap-6', sectionScrollClass)}>
            <div
                className={cn(
                    cardBase,
                    'overflow-hidden p-6 md:p-8 lg:col-span-7 xl:col-span-8 lg:flex lg:min-h-[200px] lg:flex-col lg:justify-center'
                )}
            >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start lg:items-center">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent ring-1 ring-amber-500/25 sm:size-[4.5rem]">
                        <Timer className="size-8 text-amber-300 sm:size-9" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-balance text-2xl font-bold tracking-tight text-zinc-50 md:text-3xl lg:text-[1.75rem] xl:text-3xl">
                                Video timelapse
                            </h1>
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200/95">
                                <Sparkles className="size-3" />
                                Hub
                            </span>
                        </div>
                        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
                            Pusat panduan dan AI untuk konten timelapse.{' '}
                            <span className="text-zinc-500">
                                Sidebar global tidak berubah; kartu di bawah ini hanya menaut ke{' '}
                                <span className="font-medium text-zinc-400">/video-timelapse/…</span>.
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className={cn(cardBase, 'flex flex-col justify-center p-5 md:p-6 lg:col-span-5 xl:col-span-4')}>
                <p className={cn(sectionLabel, 'mb-3')}>Mode konten</p>
                <div className="flex rounded-xl bg-zinc-950/70 p-1 ring-1 ring-zinc-800/90">
                    <button
                        type="button"
                        onClick={() => onSetMode('cabin')}
                        className={cn(
                            'relative flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200',
                            mode === 'cabin'
                                ? 'bg-zinc-800 text-zinc-50 shadow-md shadow-black/30 ring-1 ring-emerald-500/30'
                                : 'text-zinc-500 hover:text-zinc-300'
                        )}
                    >
                        <span
                            className={cn(
                                'flex size-7 items-center justify-center rounded-lg transition-colors',
                                mode === 'cabin' ? 'bg-emerald-500/20' : 'bg-zinc-800/50'
                            )}
                        >
                            <Trees className="size-4 text-emerald-400" />
                        </span>
                        <span className="text-left leading-tight">
                            Cabin
                            <span className="block text-[10px] font-normal text-zinc-500">outdoor</span>
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onSetMode('restorasi')}
                        className={cn(
                            'relative flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200',
                            mode === 'restorasi'
                                ? 'bg-zinc-800 text-zinc-50 shadow-md shadow-black/30 ring-1 ring-amber-500/35'
                                : 'text-zinc-500 hover:text-zinc-300'
                        )}
                    >
                        <span
                            className={cn(
                                'flex size-7 items-center justify-center rounded-lg transition-colors',
                                mode === 'restorasi' ? 'bg-amber-500/20' : 'bg-zinc-800/50'
                            )}
                        >
                            <Wrench className="size-4 text-amber-400" />
                        </span>
                        <span className="text-left leading-tight">
                            Restorasi
                            <span className="block text-[10px] font-normal text-zinc-500">workshop</span>
                        </span>
                    </button>
                </div>
                {!mode && (
                    <p className="mt-4 text-xs leading-relaxed text-zinc-600">
                        Pilih mode untuk menu langkah dan menyelaraskan proyek aktif.
                    </p>
                )}
            </div>
        </div>
    )
}
