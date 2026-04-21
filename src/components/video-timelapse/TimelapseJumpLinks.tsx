'use client'

import { cn } from '@/lib/utils'

const linkClass =
    'rounded-md text-[11px] font-medium text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-amber-200/90 sm:text-xs'

export function TimelapseJumpLinks({ hasMode }: { hasMode: boolean }) {
    return (
        <nav
            aria-label="Lompat ke bagian halaman"
            className="-mt-1 flex flex-wrap items-center gap-x-1 gap-y-1 border-b border-zinc-800/55 pb-3 sm:gap-x-2"
        >
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">Bagian</span>
            <a href="#section-mode" className={cn(linkClass, 'px-1.5 py-0.5')}>
                Mode
            </a>
            <span className="text-zinc-700" aria-hidden>
                ·
            </span>
            <a href="#section-ide" className={cn(linkClass, 'px-1.5 py-0.5')}>
                Ide
            </a>
            <span className="text-zinc-700" aria-hidden>
                ·
            </span>
            <a
                href={hasMode ? '#section-hub' : '#section-mode'}
                title={hasMode ? 'Menu panduan' : 'Pilih mode Cabin atau Restorasi dulu'}
                className={cn(linkClass, 'px-1.5 py-0.5', !hasMode && 'text-zinc-600 hover:text-zinc-400')}
            >
                Hub
            </a>
            <span className="text-zinc-700" aria-hidden>
                ·
            </span>
            <a href="#section-foto" className={cn(linkClass, 'px-1.5 py-0.5')}>
                Foto
            </a>
        </nav>
    )
}
