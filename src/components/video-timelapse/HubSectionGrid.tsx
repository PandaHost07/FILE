'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimelapseLandingSection } from '@/lib/videoTimelapseLandingMenu'
import { cardBase, sectionLabel, sectionScrollClass } from './constants'

interface HubSectionGridProps {
    sections: TimelapseLandingSection[]
}

export function HubSectionGrid({ sections }: HubSectionGridProps) {
    return (
        <div id="section-hub" className={cn('space-y-4', sectionScrollClass)}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className={sectionLabel}>Menu hub</span>
                    <div className="hidden h-px min-w-[2rem] flex-1 bg-gradient-to-r from-zinc-700/80 to-transparent sm:block" aria-hidden />
                </div>
                <p className="text-[11px] leading-snug text-zinc-600 sm:max-w-md sm:text-right">
                    Panduan, ide, dan checklist hanya untuk rute{' '}
                    <span className="font-medium text-zinc-500">/video-timelapse</span>
                </p>
            </div>

            <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                {sections.map((section, idx) => (
                    <div
                        key={section.title}
                        className={cn(
                            cardBase,
                            'flex min-h-[200px] min-w-0 flex-col overflow-hidden p-0 sm:min-h-[220px]',
                            'transition-shadow hover:shadow-lg hover:shadow-amber-950/10'
                        )}
                    >
                        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-950/80 to-zinc-900/40 px-3 py-2.5 sm:px-4 sm:py-3">
                            <p className="min-w-0 text-[10px] font-semibold uppercase leading-tight tracking-[0.12em] text-zinc-400 sm:text-[11px]">
                                {section.title}
                            </p>
                            <span className="shrink-0 rounded-md bg-zinc-800/80 px-1.5 py-0.5 tabular-nums text-[9px] font-bold text-zinc-500">
                                {idx + 1}/{sections.length}
                            </span>
                        </div>
                        <ul className="flex min-h-0 flex-1 flex-col divide-y divide-zinc-800/50 overflow-y-auto">
                            {section.items.map((item) => (
                                <li key={item.href + item.label} className="min-h-0 flex-1">
                                    <Link
                                        href={item.href}
                                        className="group flex h-full min-h-[3.25rem] items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-zinc-800/45 sm:gap-3 sm:px-4 sm:py-3"
                                    >
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800/90 text-zinc-400 ring-1 ring-zinc-700/60 transition-all group-hover:bg-amber-500/15 group-hover:text-amber-400 group-hover:ring-amber-500/30 sm:size-9 sm:rounded-xl">
                                            <item.icon className="size-3.5 sm:size-4" />
                                        </span>
                                        <span className="min-w-0 flex-1 text-[11px] font-medium leading-snug text-zinc-200 group-hover:text-zinc-50 sm:text-sm">
                                            {item.label}
                                        </span>
                                        <ChevronRight className="size-3.5 shrink-0 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-500/90 sm:size-4" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}
