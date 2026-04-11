'use client'

import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Scene } from '@/types'

interface TimelineCardProps {
    scene: Scene
    onClick: () => void
    /** Gambar dari IndexedDB bila tidak ada di `scene.imageData` (persist). */
    thumbnailOverride?: string | null
    title?: string
}

export function TimelineCard({ scene, onClick, thumbnailOverride, title }: TimelineCardProps) {
    const imgB64 = thumbnailOverride ?? scene.imageData
    const hasImage = !!imgB64
    const hasImagePrompt = !!scene.imagePrompt
    const hasVideoPrompt = !!scene.videoPrompt

    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={cn(
                'group relative flex w-40 shrink-0 flex-col rounded-xl border bg-zinc-900 transition-all',
                'border-zinc-800 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500/50'
            )}
        >
            <span className="absolute left-2 top-2 z-10 rounded-full bg-zinc-800/90 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400">
                {String(scene.order).padStart(2, '0')}
            </span>

            <div className="relative h-28 w-full overflow-hidden rounded-t-xl bg-zinc-800">
                {hasImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={`data:image/jpeg;base64,${imgB64}`}
                        alt={scene.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-2">
                        <ImageIcon className="size-6 text-zinc-600" />
                        <span className="text-center text-[10px] leading-tight text-zinc-500 line-clamp-2">
                            {scene.name}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1.5 px-2 pt-2">
                <span className={cn('size-2 shrink-0 rounded-full', hasImage ? 'bg-green-500' : 'bg-red-500')} />
                {hasImagePrompt && (
                    <span className="rounded px-1 py-0.5 text-[9px] font-semibold bg-amber-500/20 text-amber-400">IP</span>
                )}
                {hasVideoPrompt && (
                    <span className="rounded px-1 py-0.5 text-[9px] font-semibold bg-blue-500/20 text-blue-400">VP</span>
                )}
            </div>

            <p className="px-2 pb-2 pt-1 text-left text-[11px] font-medium leading-tight text-zinc-300 line-clamp-2">
                {scene.name}
            </p>
        </button>
    )
}
