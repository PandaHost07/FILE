'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
    Clapperboard,
    LayoutGrid,
    Sparkles,
    Film,
    Video,
    Copy,
    Loader2,
    ImageIcon,
    Wrench,
    Settings,
    ArrowRight,
    Cloud,
    Database,
    RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { cardBodyPad, cardHeaderBar, cardSurface, inputField, pageGradient, shellBg } from '@/lib/uiTokens'
import { useToast } from '@/components/ui/toast'
import useAppStore from '@/store/useAppStore'
import { parseKeys } from '@/lib/keyRotation'
import { generateFilmmakerScenesAI } from '@/lib/gemini'
import { buildLocalFilmmakerScenes, type FilmmakerSceneItem } from '@/lib/filmmakerScenes'

/** Mode generate prompt adegan — untuk percobaan hemat (lokal) vs API. */
type PromptSourceMode = 'auto' | 'local' | 'api'

const SOURCE_OPTIONS: { id: PromptSourceMode; label: string; hint: string; icon: typeof Cloud }[] = [
    {
        id: 'auto',
        label: 'Otomatis',
        hint: 'Ada API → pakai model; tidak → template lokal',
        icon: RefreshCw,
    },
    {
        id: 'local',
        label: 'Lokal',
        hint: 'Tanpa panggilan API — template cepat, hemat',
        icon: Database,
    },
    {
        id: 'api',
        label: 'API',
        hint: 'Wajib kunci di Pengaturan (Gemini/Groq/OpenAI)',
        icon: Cloud,
    },
]

const SHORTCUTS = [
    {
        href: '/settings',
        label: 'Pengaturan',
        hint: 'Kunci API untuk mode API',
        icon: Settings,
    },
    {
        href: '/storyboard',
        label: 'Storyboard',
        hint: 'Panel visual proyek aktif',
        icon: LayoutGrid,
    },
    {
        href: '/idea-generator',
        label: 'Idea Generator',
        hint: 'Variasi konsep awal',
        icon: Sparkles,
    },
] as const

export default function FilmmakerPage() {
    const { toast } = useToast()
    const { apiKeys } = useAppStore()
    const [idea, setIdea] = useState('')
    const [sceneCount, setSceneCount] = useState(5)
    const [promptSource, setPromptSource] = useState<PromptSourceMode>('auto')
    const [scenes, setScenes] = useState<FilmmakerSceneItem[]>([])
    const [source, setSource] = useState<'idle' | 'ai' | 'local'>('idle')
    const [loading, setLoading] = useState(false)
    const [copiedId, setCopiedId] = useState('')

    const inputClass = inputField('cyan')

    const hasAiKeys = useMemo(
        () =>
            parseKeys(apiKeys.gemini).length > 0 ||
            parseKeys(apiKeys.openai).length > 0 ||
            parseKeys(apiKeys.groq).length > 0,
        [apiKeys.gemini, apiKeys.openai, apiKeys.groq]
    )

    const handleCopyPrompt = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(''), 2000)
    }

    const handleGenerateScenes = async () => {
        const trimmed = idea.trim()
        if (!trimmed) {
            toast({
                title: 'Isi ide dulu',
                description: 'Tulis konsep atau logline film di kolom ide.',
                variant: 'destructive',
            })
            return
        }

        setLoading(true)

        const runLocal = () => {
            setScenes(buildLocalFilmmakerScenes(trimmed, sceneCount))
            setSource('local')
        }

        const runApi = async () => {
            const { scenes: next } = await generateFilmmakerScenesAI(
                apiKeys.gemini,
                trimmed,
                sceneCount,
                apiKeys.openai,
                apiKeys.groq
            )
            setScenes(next)
            setSource('ai')
        }

        try {
            if (promptSource === 'local') {
                runLocal()
                toast({
                    title: 'Adegan siap (lokal)',
                    description: 'Prompt dari template — tidak memakai kuota API.',
                })
                return
            }

            if (promptSource === 'api') {
                if (!hasAiKeys) {
                    toast({
                        title: 'Belum ada kunci API',
                        description: 'Isi Gemini, Groq, atau OpenAI di Pengaturan untuk mode API.',
                        variant: 'destructive',
                    })
                    return
                }
                try {
                    await runApi()
                    toast({
                        title: 'Adegan siap (API)',
                        description: 'Prompt per adegan dari model.',
                    })
                } catch (e) {
                    const msg = e instanceof Error ? e.message : 'Gagal'
                    toast({
                        title: 'API gagal',
                        description: msg,
                        variant: 'destructive',
                    })
                }
                return
            }

            // Otomatis
            if (!hasAiKeys) {
                runLocal()
                toast({
                    title: 'Adegan siap (lokal)',
                    description: 'Tidak ada kunci API — memakai template. Tambahkan API di Pengaturan untuk variasi AI.',
                })
                return
            }

            try {
                await runApi()
                toast({
                    title: 'Adegan siap',
                    description: 'Prompt per adegan dari API (Gemini/Groq/OpenAI).',
                })
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Gagal'
                runLocal()
                toast({
                    title: 'Fallback lokal',
                    description: `API: ${msg}. Prompt diisi dari template lokal.`,
                })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={cn('relative flex min-h-0 flex-1 flex-col', shellBg)}>
            <div className={pageGradient.cyan} aria-hidden />

            <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto">
                <header className="border-b border-[#1f1f24] px-4 py-6 sm:px-8">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-500/90">
                        RestoreGen
                    </p>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                                <Clapperboard className="size-7 text-cyan-400" aria-hidden />
                                Filmmaker
                            </h1>
                            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-zinc-500">
                                Generate <span className="text-zinc-400">prompt visual per adegan</span>. Pilih sumber{' '}
                                <span className="text-zinc-400">Lokal</span> untuk percobaan tanpa API, atau{' '}
                                <span className="text-zinc-400">API</span> jika kunci sudah di Pengaturan. Generate foto
                                masih <span className="text-zinc-400">maintenance</span>.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 space-y-6 px-4 py-6 sm:px-8 sm:py-8">
                    <div className={cardSurface}>
                        <div className={cn(cardHeaderBar, 'flex flex-wrap items-center justify-between gap-2')}>
                            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                                <Sparkles className="size-4 text-cyan-400" />
                                Generate adegan & prompt
                            </span>
                            {source !== 'idle' && (
                                <span
                                    className={cn(
                                        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                        source === 'ai'
                                            ? 'bg-emerald-500/15 text-emerald-300'
                                            : 'bg-amber-500/15 text-amber-200'
                                    )}
                                >
                                    {source === 'ai' ? 'Terpakai: API' : 'Terpakai: lokal'}
                                </span>
                            )}
                        </div>
                        <div className={cardBodyPad}>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                                Sumber prompt (percobaan)
                            </p>
                            <div className="grid gap-2 sm:grid-cols-3">
                                {SOURCE_OPTIONS.map((opt) => {
                                    const active = promptSource === opt.id
                                    const disabledApi = opt.id === 'api' && !hasAiKeys
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setPromptSource(opt.id)}
                                            disabled={disabledApi}
                                            title={
                                                disabledApi
                                                    ? 'Isi kunci API di Pengaturan untuk mode ini'
                                                    : opt.hint
                                            }
                                            className={cn(
                                                'flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition',
                                                active
                                                    ? 'border-cyan-500/50 bg-cyan-500/10 ring-1 ring-cyan-500/25'
                                                    : 'border-[#2a2a2e] bg-[#121214] hover:border-zinc-600',
                                                disabledApi && 'cursor-not-allowed opacity-45'
                                            )}
                                        >
                                            <span className="flex items-center gap-2">
                                                <opt.icon
                                                    className={cn(
                                                        'size-4',
                                                        active ? 'text-cyan-400' : 'text-zinc-500'
                                                    )}
                                                    aria-hidden
                                                />
                                                <span
                                                    className={cn(
                                                        'text-[12px] font-bold',
                                                        active ? 'text-cyan-200' : 'text-zinc-400'
                                                    )}
                                                >
                                                    {opt.label}
                                                </span>
                                            </span>
                                            <span className="text-[10px] leading-snug text-zinc-500">{opt.hint}</span>
                                        </button>
                                    )
                                })}
                            </div>

                            <label className="mt-4 block text-[11px] font-semibold text-zinc-400">
                                Ide / logline film
                            </label>
                            <textarea
                                value={idea}
                                onChange={(e) => setIdea(e.target.value)}
                                placeholder="Contoh: Dua sahabat menemukan radio tua di loteng; suara asing mulai mengubah ingatan mereka..."
                                rows={4}
                                className={cn(inputClass, 'mt-1.5 min-h-[100px] resize-y text-[13px] leading-relaxed')}
                            />
                            <div className="mt-4 flex flex-wrap items-end gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-400">
                                        Jumlah adegan
                                    </label>
                                    <select
                                        value={sceneCount}
                                        onChange={(e) => setSceneCount(Number(e.target.value))}
                                        className={cn(inputClass, 'mt-1.5 w-[min(100%,220px)] text-[13px]')}
                                    >
                                        {Array.from({ length: 18 }, (_, i) => i + 3).map((n) => (
                                            <option key={n} value={n}>
                                                {n} adegan
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => void handleGenerateScenes()}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/20 px-4 py-2.5 text-[13px] font-bold text-cyan-200 ring-1 ring-cyan-500/35 transition hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="size-4 animate-spin" aria-hidden />
                                    ) : (
                                        <Film className="size-4" aria-hidden />
                                    )}
                                    {loading ? 'Membuat adegan…' : 'Generate adegan & prompt'}
                                </button>
                            </div>
                            <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
                                Kunci API:{' '}
                                {hasAiKeys ? (
                                    <span className="text-emerald-400/90">terdeteksi</span>
                                ) : (
                                    <span className="text-zinc-400">belum ada</span>
                                )}
                                {' · '}
                                <Link href="/settings" className="text-cyan-400 underline-offset-2 hover:underline">
                                    Pengaturan
                                </Link>
                            </p>
                        </div>
                    </div>

                    {scenes.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-[12px] font-bold uppercase tracking-wide text-zinc-500">
                                Adegan & prompt visual ({scenes.length})
                            </h2>
                            <div className="grid gap-4 lg:grid-cols-2">
                                {scenes.map((scene, idx) => (
                                    <div
                                        key={scene.id}
                                        className="flex flex-col rounded-2xl border border-[#1f1f24] bg-[#0c0c0f] p-4 shadow-lg shadow-black/20"
                                    >
                                        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase text-zinc-500">
                                                    Adegan {idx + 1}
                                                </span>
                                                <h3 className="text-[15px] font-semibold text-zinc-100">{scene.title}</h3>
                                            </div>
                                            <span className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-200/95">
                                                Maintenance
                                            </span>
                                        </div>
                                        <label className="text-[10px] font-semibold uppercase text-zinc-500">
                                            Prompt visual (key frame)
                                        </label>
                                        <textarea
                                            readOnly
                                            value={scene.imagePrompt}
                                            rows={5}
                                            className={cn(
                                                inputClass,
                                                'mt-1 min-h-[100px] resize-y font-mono text-[11px] leading-relaxed text-zinc-300'
                                            )}
                                        />
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCopyPrompt(scene.imagePrompt, `p-${scene.id}`)
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-bold text-cyan-200 hover:bg-cyan-500/20"
                                            >
                                                <Copy className="size-3.5" aria-hidden />
                                                {copiedId === `p-${scene.id}` ? 'Disalin' : 'Salin prompt'}
                                            </button>
                                            <button
                                                type="button"
                                                disabled
                                                title="Generate gambar dari prompt belum tersedia"
                                                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-zinc-600/80 bg-zinc-800/50 px-3 py-1.5 text-[11px] font-semibold text-zinc-500"
                                            >
                                                <ImageIcon className="size-3.5 opacity-50" aria-hidden />
                                                Generate foto
                                                <Wrench className="size-3.5 opacity-60" aria-hidden />
                                            </button>
                                        </div>
                                        <p className="mt-2 text-[10px] leading-snug text-zinc-500">
                                            Generate foto dari prompt akan ditambahkan nanti — salin prompt untuk tool
                                            eksternal atau storyboard manual.
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Menu ringkas — hanya tautan yang relevan */}
                    <div className={cardSurface}>
                        <div className={cn(cardHeaderBar, 'flex items-center gap-2')}>
                            <Video className="size-4 text-cyan-400" />
                            <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                                Menu ringkas
                            </span>
                        </div>
                        <div className={cardBodyPad}>
                            <p className="mb-3 text-[12px] text-zinc-500">
                                Akses cepat untuk API, storyboard, dan ide — tanpa daftar panjang.
                            </p>
                            <div className="grid gap-2 sm:grid-cols-3">
                                {SHORTCUTS.map((t) => (
                                    <Link
                                        key={t.href}
                                        href={t.href}
                                        className="group flex items-center justify-between gap-2 rounded-xl border border-[#2a2a2e] bg-[#0d0d10] px-3 py-3 transition hover:border-cyan-500/35 hover:bg-cyan-500/[0.06]"
                                    >
                                        <span className="flex min-w-0 items-center gap-2">
                                            <t.icon className="size-4 shrink-0 text-cyan-400/90" aria-hidden />
                                            <span className="min-w-0">
                                                <span className="block text-[12px] font-semibold text-zinc-200">
                                                    {t.label}
                                                </span>
                                                <span className="block truncate text-[10px] text-zinc-500">{t.hint}</span>
                                            </span>
                                        </span>
                                        <ArrowRight className="size-4 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-400/80" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
