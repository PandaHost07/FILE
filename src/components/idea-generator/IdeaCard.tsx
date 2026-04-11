'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import type { IdeaResult } from '@/types'

interface IdeaCardProps {
    idea: IdeaResult
    index: number
    onSelect: (idea: IdeaResult) => void
}

export function IdeaCard({ idea, index, onSelect }: IdeaCardProps) {
    const scenes = idea.suggestedScenes
    const visible = scenes.slice(0, 6)
    const rest = scenes.length - visible.length

    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-900/45 transition-colors hover:border-zinc-700">
            <div className="p-4">
                <div className="flex items-start gap-2.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-xs font-bold text-amber-400">
                        {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold leading-snug text-zinc-100">{idea.title}</h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{idea.description}</p>
                    </div>
                </div>
                {visible.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-zinc-800/60 pt-3">
                        {visible.map((scene, i) => (
                            <span
                                key={`${scene}-${i}`}
                                className="rounded-md border border-zinc-700/80 bg-zinc-950/50 px-2 py-0.5 text-[10px] text-zinc-400"
                            >
                                {scene}
                            </span>
                        ))}
                        {rest > 0 && <span className="self-center text-[10px] text-zinc-600">+{rest} scene</span>}
                    </div>
                )}
            </div>
            <div className="mt-auto border-t border-zinc-800/60 p-3">
                <button
                    type="button"
                    onClick={() => onSelect(idea)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-xs font-bold text-zinc-950 transition-colors hover:bg-amber-400"
                >
                    <Sparkles className="size-3.5" />
                    Pakai ide ini
                    <ArrowRight className="size-3.5 opacity-80" />
                </button>
            </div>
        </div>
    )
}
