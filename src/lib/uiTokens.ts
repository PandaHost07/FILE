import { cn } from '@/lib/utils'

/** Latar halaman konten (gelap) */
export const shellBg = 'bg-[#050505]'

/** Aksen radial berbeda per halaman — tema sama, warna tidak monoton. */
export const pageGradient = {
    emerald:
        'pointer-events-none fixed inset-x-0 top-0 z-0 h-[min(380px,45vh)] bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(34,197,94,0.11),transparent_55%)]',
    cyan: 'pointer-events-none fixed inset-x-0 top-0 z-0 h-[min(380px,45vh)] bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(34,211,238,0.1),transparent_55%)]',
    violet:
        'pointer-events-none fixed inset-x-0 top-0 z-0 h-[min(380px,45vh)] bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(139,92,246,0.12),transparent_55%)]',
    /** TikTok Affiliate / short-form affiliate */
    fuchsia:
        'pointer-events-none fixed inset-x-0 top-0 z-0 h-[min(380px,45vh)] bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(217,70,239,0.11),transparent_55%)]',
    /** Clipper / alat video amber */
    amber:
        'pointer-events-none fixed inset-x-0 top-0 z-0 h-[min(420px,50vh)] bg-[radial-gradient(ellipse_75%_55%_at_50%_-8%,rgba(245,158,11,0.14),transparent_58%)]',
} as const

export const cardSurface = 'overflow-hidden rounded-2xl border border-[#1f1f24] bg-[#121214] shadow-xl shadow-black/25'
export const cardHeaderBar = 'border-b border-[#1a1a1a] bg-[#0f0f12] px-4 py-3'
export const cardBodyPad = 'p-4 sm:p-5'

export const inputBase =
    'w-full rounded-xl border border-[#2a2a2e] bg-[#0d0d10] px-3 py-2.5 text-[13px] text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors'

const focus = {
    emerald: 'focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20',
    cyan: 'focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20',
    violet: 'focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20',
    amber: 'focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20',
    fuchsia: 'focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20',
} as const

export function inputField(variant: keyof typeof focus = 'emerald') {
    return cn(inputBase, focus[variant])
}
