'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Lightbulb, Sparkles, Loader2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import useAppStore from '@/store/useAppStore'
import { generateIdeaPrompts } from '@/lib/gemini'
import { IdeaCard } from '@/components/idea-generator/IdeaCard'
import type { ContentMode, IdeaResult } from '@/types'
import { cn } from '@/lib/utils'

const STYLE_OPTIONS = ['Cinematic', 'Documentary', 'Aesthetic', 'Raw/Industrial', 'Warm & Cozy', 'Photorealistic'] as const

const VIRAL_OPTIONS: { label: string; value: string }[] = [
    { label: 'Transformasi ekstrem (before/after)', value: 'extreme transformation, shocking before-after contrast' },
    { label: 'Proses memuaskan (ASMR)', value: 'satisfying restoration process, ASMR-like details' },
    { label: 'Timelapse cepat', value: 'fast-paced timelapse, high energy, quick cuts' },
    { label: 'Reveal dramatis', value: 'dramatic reveal moment, emotional transformation' },
]

const QUICK_COMBOS: {
    label: string
    hint: string
    objectType: string
    initialCondition: string
    visualStyle: string
    viralAngle: string
    contentMode: ContentMode
}[] = [
    {
        label: 'Kabin — rangka & struktur',
        hint: 'Framing kayu di hutan',
        objectType: 'pembangunan kabin kayu kecil di lereng hutan',
        initialCondition: 'tahap framing dinding dan atap, debu serbuk kayu, cuaca cerah berawan',
        visualStyle: 'Documentary',
        viralAngle: 'fast-paced timelapse, structural progress, satisfying build rhythm',
        contentMode: 'cabin_build',
    },
    {
        label: 'Kabin — eksterior jadi',
        hint: 'Siding, stain, atap',
        objectType: 'penyelesaian eksterior kabin kayu di lokasi outdoor',
        initialCondition: 'pemasangan siding, stain kayu, atap logam, pemandangan hutan',
        visualStyle: 'Photorealistic',
        viralAngle: 'dramatic reveal moment, emotional transformation, hero wide shot',
        contentMode: 'cabin_build',
    },
    {
        label: 'Restorasi — furnitur',
        hint: 'Kursi / meja antik',
        objectType: 'kursi kayu antik',
        initialCondition: 'cat mengelupas parah, kaki patah, berdebu, ditinggal bertahun-tahun',
        visualStyle: 'Cinematic',
        viralAngle: 'extreme transformation, shocking before-after contrast',
        contentMode: 'restoration',
    },
    {
        label: 'Restorasi — motor klasik',
        hint: 'Bengkel & kilap',
        objectType: 'motor klasik',
        initialCondition: 'berkarat parah, kotor, tidak bisa jalan, ditinggal di gudang',
        visualStyle: 'Raw/Industrial',
        viralAngle: 'satisfying restoration process, ASMR-like details',
        contentMode: 'restoration',
    },
]

export default function IdeaGeneratorPage() {
    const router = useRouter()
    const { apiKeys, activeProjectId, createProject, addScenesFromIdea } = useAppStore()

    const [ideas, setIdeas] = useState<IdeaResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [objectType, setObjectType] = useState('')
    const [condition, setCondition] = useState('')
    const [visualStyle, setVisualStyle] = useState<string>('Cinematic')
    const [viralAngle, setViralAngle] = useState(VIRAL_OPTIONS[0].value)
    const [projectContentMode, setProjectContentMode] = useState<ContentMode>('restoration')

    const canGenerate = objectType.trim().length > 0 && condition.trim().length > 0 && Boolean(apiKeys.gemini)

    async function runGenerate(payload: {
        objectType: string
        condition: string
        visualStyle: string
        viralAngle: string
    }) {
        setIsLoading(true)
        setError(null)
        try {
            const results = await generateIdeaPrompts(apiKeys.gemini, {
                objectType: payload.objectType,
                initialCondition: `${payload.condition}. Viral angle: ${payload.viralAngle}`,
                visualStyle: payload.visualStyle,
            })
            setIdeas(results)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat generate ide.')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleGenerate() {
        if (!canGenerate) return
        await runGenerate({ objectType: objectType.trim(), condition: condition.trim(), visualStyle, viralAngle })
    }

    async function handleQuickCombo(combo: (typeof QUICK_COMBOS)[0]) {
        setProjectContentMode(combo.contentMode)
        setObjectType(combo.objectType)
        setCondition(combo.initialCondition)
        setVisualStyle(combo.visualStyle)
        setViralAngle(combo.viralAngle)
        if (!apiKeys.gemini) return
        await runGenerate({
            objectType: combo.objectType,
            condition: combo.initialCondition,
            visualStyle: combo.visualStyle,
            viralAngle: combo.viralAngle,
        })
    }

    function handleSelect(idea: IdeaResult) {
        let projectId = activeProjectId
        if (!projectId) {
            projectId = createProject(idea.title, 'lainnya', projectContentMode)
        }
        addScenesFromIdea(projectId, idea.suggestedScenes)
        router.push('/scene-builder')
    }

    const resultsPanel = (
        <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Hasil</h2>
                {ideas.length > 0 && !isLoading && canGenerate && (
                    <button
                        type="button"
                        onClick={() => void handleGenerate()}
                        className="text-[11px] font-medium text-amber-500/90 hover:text-amber-400 transition-colors"
                    >
                        Ulangi
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/40 py-12">
                    <Loader2 className="size-8 text-amber-400 animate-spin" />
                    <p className="text-xs text-zinc-500">Membuat ide…</p>
                </div>
            )}

            {!isLoading && ideas.length > 0 && (
                <div className="max-h-[calc(100vh-7rem)] space-y-3 overflow-y-auto pr-0.5 scrollbar-thin">
                    {ideas.map((idea, i) => (
                        <IdeaCard key={i} idea={idea} index={i} onSelect={handleSelect} />
                    ))}
                </div>
            )}

            {!isLoading && ideas.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-800/90 bg-zinc-900/25 px-4 py-10 text-center">
                    <Lightbulb className="mx-auto mb-2 size-8 text-zinc-700" />
                    <p className="text-sm text-zinc-400">Pilih salah satu mulai cepat atau isi form lalu generate.</p>
                </div>
            )}
        </div>
    )

    return (
        <div className="min-h-full bg-zinc-950">
            <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] lg:gap-10">
                    <div className="min-w-0 space-y-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/12">
                                    <Lightbulb className="size-5 text-amber-400" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">Idea Generator</h1>
                                    <p className="mt-1 max-w-xl text-sm text-zinc-500">
                                        Satu klik untuk pola siap pakai, atau isi dua kolom di bawah — tanpa deretan tombol preset.
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
                                <button
                                    type="button"
                                    onClick={() => setProjectContentMode('restoration')}
                                    className={cn(
                                        'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                                        projectContentMode === 'restoration'
                                            ? 'bg-amber-500/20 text-amber-400'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    )}
                                >
                                    Restorasi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setProjectContentMode('cabin_build')}
                                    className={cn(
                                        'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                                        projectContentMode === 'cabin_build'
                                            ? 'bg-amber-500/20 text-amber-400'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    )}
                                >
                                    Kabin
                                </button>
                            </div>
                        </div>

                        {!apiKeys.gemini && (
                            <div className="flex items-start gap-2 rounded-lg border border-amber-800/40 bg-amber-950/20 px-3 py-2.5 text-sm text-amber-200/90">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                                <span>
                                    API key Gemini belum diset.{' '}
                                    <Link href="/settings" className="font-medium underline underline-offset-2 hover:text-amber-100">
                                        Buka Pengaturan
                                    </Link>
                                </span>
                            </div>
                        )}

                        <section className="space-y-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Mulai cepat</h2>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {QUICK_COMBOS.map((combo) => (
                                    <button
                                        key={combo.label}
                                        type="button"
                                        onClick={() => void handleQuickCombo(combo)}
                                        disabled={isLoading || !apiKeys.gemini}
                                        className="group flex items-center justify-between gap-3 rounded-xl border border-zinc-800/90 bg-zinc-900/40 px-4 py-3.5 text-left transition-all hover:border-amber-500/30 hover:bg-zinc-900/70 disabled:pointer-events-none disabled:opacity-40"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-zinc-100">{combo.label}</p>
                                            <p className="mt-0.5 text-xs text-zinc-500">{combo.hint}</p>
                                        </div>
                                        <ChevronRight className="size-4 shrink-0 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-500/80" />
                                    </button>
                                ))}
                            </div>
                        </section>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden>
                                <div className="w-full border-t border-zinc-800" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-zinc-950 px-3 text-xs text-zinc-600">atau isi sendiri</span>
                            </div>
                        </div>

                        <section className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 p-4 sm:p-5">
                            <div className="space-y-2">
                                <label htmlFor="idea-object" className="text-xs font-medium text-zinc-400">
                                    Objek / fokus video
                                </label>
                                <input
                                    id="idea-object"
                                    type="text"
                                    value={objectType}
                                    onChange={(e) => setObjectType(e.target.value)}
                                    placeholder="Contoh: sofa vintage, kabin kayu, motor klasik…"
                                    disabled={isLoading}
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-amber-500/45 disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="idea-condition" className="text-xs font-medium text-zinc-400">
                                    Kondisi & suasana
                                </label>
                                <textarea
                                    id="idea-condition"
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value)}
                                    placeholder="Contoh: cat mengelupas, berkarat, debu tebal, suasana bengkel…"
                                    rows={3}
                                    disabled={isLoading}
                                    className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-amber-500/45 disabled:opacity-50"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="idea-style" className="text-xs font-medium text-zinc-400">
                                        Gaya visual
                                    </label>
                                    <select
                                        id="idea-style"
                                        value={visualStyle}
                                        onChange={(e) => setVisualStyle(e.target.value)}
                                        disabled={isLoading}
                                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500/45 disabled:opacity-50"
                                    >
                                        {STYLE_OPTIONS.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="idea-viral" className="text-xs font-medium text-zinc-400">
                                        Sudut viral
                                    </label>
                                    <select
                                        id="idea-viral"
                                        value={viralAngle}
                                        onChange={(e) => setViralAngle(e.target.value)}
                                        disabled={isLoading}
                                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500/45 disabled:opacity-50"
                                    >
                                        {VIRAL_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => void handleGenerate()}
                                disabled={isLoading || !canGenerate}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-400 disabled:pointer-events-none disabled:opacity-40"
                            >
                                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                                {isLoading ? 'Generating…' : 'Generate ide'}
                            </button>

                            {error && (
                                <div className="rounded-xl border border-red-900/50 bg-red-950/25 px-3 py-2.5 text-sm text-red-300">{error}</div>
                            )}
                        </section>

                        <div className="lg:hidden">{resultsPanel}</div>
                    </div>

                    <div className="hidden min-w-0 lg:block">{resultsPanel}</div>
                </div>
            </div>
        </div>
    )
}
