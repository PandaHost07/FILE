import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface TimelapseHubShellProps {
    eyebrow?: string
    title: string
    children: ReactNode
}

/** Layout sub-halaman hub: hanya navigasi internal `/video-timelapse`. */
export function TimelapseHubShell({ eyebrow, title, children }: TimelapseHubShellProps) {
    return (
        <div className="min-h-full bg-zinc-950">
            <div className="w-full min-w-0 space-y-6 px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
                <Link
                    href="/video-timelapse"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-amber-400"
                >
                    <ChevronLeft className="size-3.5 shrink-0" />
                    Hub Video timelapse
                </Link>
                {eyebrow ? (
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">{eyebrow}</p>
                ) : null}
                <h1 className="text-2xl font-bold tracking-tight text-zinc-100">{title}</h1>
                <div className="space-y-4 text-sm leading-relaxed text-zinc-400">{children}</div>
            </div>
        </div>
    )
}
