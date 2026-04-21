export const cardBase =
    'rounded-2xl border border-zinc-800/80 bg-zinc-900/45 shadow-xl shadow-black/25 ring-1 ring-white/[0.04] backdrop-blur-sm'

export const sectionLabel = 'text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500'

/** Offset scroll agar anchor tidak tertutup header app (navbar section sudah dihapus) */
export const sectionScrollClass = 'scroll-mt-16'

/** Gradient hero per indeks — gaya kartu portrait “featured” (tanpa asset gambar) */
export const portraitHeroGradient = (idx: number) => {
    const g = [
        'from-indigo-950 via-violet-950/90 to-zinc-950',
        'from-amber-950 via-orange-950/85 to-zinc-950',
        'from-emerald-950 via-teal-950/80 to-zinc-950',
        'from-rose-950 via-fuchsia-950/75 to-zinc-950',
        'from-sky-950 via-blue-950/85 to-zinc-950',
        'from-zinc-800 via-zinc-900 to-black',
    ] as const
    return g[idx % g.length]
}
