'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
    FileText, Zap, Languages, Sparkles, LayoutGrid, FileVideo,
    ArrowRight, Wrench,
} from 'lucide-react'

interface ToolCardItem {
    href: string
    title: string
    desc: string
    icon: LucideIcon
    badge?: string
}

const TOOL_CARDS: ToolCardItem[] = [
    {
        href: '/prompt-library',
        title: 'Prompt Library',
        desc: 'Template siap pakai untuk scene gambar & video.',
        icon: FileText,
        badge: '50+',
    },
    {
        href: '/batch-generator',
        title: 'Batch Generate',
        desc: 'Generate prompt untuk semua scene sekaligus.',
        icon: Zap,
        badge: 'Cepat',
    },
    {
        href: '/prompt-translator',
        title: 'Translator',
        desc: 'Sesuaikan prompt untuk Imagen, SD, dll.',
        icon: Languages,
    },
    {
        href: '/prompt-enhancer',
        title: 'Enhancer',
        desc: 'Perhalus prompt dengan instruksi singkat.',
        icon: Sparkles,
    },
    {
        href: '/storyboard',
        title: 'Storyboard',
        desc: 'Susun visual urutan adegan.',
        icon: LayoutGrid,
    },
    {
        href: '/video-script',
        title: 'Video Script',
        desc: 'Naskah narasi untuk YouTube, TikTok, Reels.',
        icon: FileVideo,
    },
]

export default function ToolsPage() {
    return (
        <div className="min-h-full bg-zinc-950">
            <div className="mx-auto max-w-6xl space-y-6 px-4 py-5 sm:px-5 sm:py-6 lg:px-6">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
                        <Wrench className="size-5 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-zinc-100 sm:text-xl">Tools &amp; lanjutan</h1>
                        <p className="mt-0.5 max-w-2xl text-xs text-zinc-500 sm:text-sm">
                            Alat tambahan di luar alur utama (Ide → Scene → Prompt → Timeline → Export). Pilih sesuai kebutuhan—tidak harus dipakai semua.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {TOOL_CARDS.map(({ href, title, desc, icon: Icon, badge }) => (
                        <Link
                            key={href}
                            href={href}
                            className="group flex flex-col rounded-xl border border-zinc-800/90 bg-zinc-900/35 p-4 transition-colors hover:border-amber-500/35 hover:bg-zinc-900/60"
                        >
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Icon className="size-4 text-amber-400" />
                                    <span className="text-sm font-semibold text-zinc-100">{title}</span>
                                </div>
                                {badge && (
                                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-500">
                                        {badge}
                                    </span>
                                )}
                            </div>
                            <p className="flex-1 text-xs leading-relaxed text-zinc-500">{desc}</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-amber-400/90 group-hover:text-amber-300">
                                Buka <ArrowRight className="size-3" />
                            </span>
                        </Link>
                    ))}
                </div>

                <p className="text-center text-[11px] text-zinc-600">
                    Kembali ke{' '}
                    <Link href="/dashboard" className="text-amber-500/90 hover:text-amber-400">
                        Dashboard
                    </Link>{' '}
                    atau{' '}
                    <Link href="/idea-generator" className="text-amber-500/90 hover:text-amber-400">
                        Idea Generator
                    </Link>
                    .
                </p>
            </div>
        </div>
    )
}
