'use client'

import Link from 'next/link'
import { Check, Loader2, Search, Sparkles, ImageIcon, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimelapseInternationalIdeaItem } from '@/lib/gemini'
import type { TimelapseLandingMode } from '@/lib/videoTimelapseLandingMenu'
import { aspectPreviewClass, type TimelapseImageAspect, videoFormatToKind } from '@/lib/timelapseImageAspect'
import { ExpandablePromptBlock } from './ExpandablePromptBlock'
import { TimelapseImageAspectPicker } from './TimelapseImageAspectPicker'
import { cardBase, portraitHeroGradient, sectionLabel, sectionScrollClass } from './constants'

type VideoFormat = 'short-15' | 'short-30' | 'short-60' | 'long'

interface InternationalIdeasCardProps {
    mode: TimelapseLandingMode | null
    storeHydrated: boolean
    geminiKeyCount: number
    intlSearch: string
    onIntlSearchChange: (v: string) => void
    intlLoading: boolean
    onGenerateIdeas: () => void
    intlError: string | null
    intlIdeas: TimelapseInternationalIdeaItem[]
    selectedIdeaIdx: number | null
    onToggleSelectIdea: (idx: number) => void
    onClearPromptResults: () => void
    videoFormat: VideoFormat
    onVideoFormatChange: (f: VideoFormat) => void
    generatingPrompt: boolean
    generatingStep: string
    beforeImagePrompt: string | null
    beforeVideoPrompt: string | null
    afterImagePrompt: string | null
    afterVideoPrompt: string | null
    onGeneratePrompt: (idea: TimelapseInternationalIdeaItem) => void
    onCopyPrompt: (text: string, id: string) => void
    copiedPrompt: string | null
    hasImagenKey: boolean
    generatingImageBefore: boolean
    generatedImageBefore: string | null
    imageGenErrorBefore: string | null
    onGenerateImageBefore: () => void
    onDownloadImageBefore: () => void
    generatingImageAfter: boolean
    generatedImageAfter: string | null
    imageGenErrorAfter: string | null
    onGenerateImageAfter: () => void
    onDownloadImageAfter: () => void
    // Per-second breakdown
    secondsBreakdown: import('@/lib/gemini').VideoSecondsBreakdown | null
    generatingSeconds: boolean
    onGenerateSeconds: () => void
    // Continue story
    continueStoryResult: import('@/lib/gemini').ContinueStoryResult | null
    generatingContinue: boolean
    nextFocus: string
    onNextFocusChange: (v: string) => void
    onContinueStory: () => void
    imageAspect: TimelapseImageAspect
    onImageAspectChange: (v: TimelapseImageAspect) => void
}

const FORMAT_META: Record<VideoFormat, { label: string; sub: string }> = {
    'short-15': { label: '15s', sub: 'Short' },
    'short-30': { label: '30s', sub: 'Short' },
    'short-60': { label: '60s', sub: 'Short' },
    long: { label: 'Long', sub: '3-5 min' },
}

export function InternationalIdeasCard(props: InternationalIdeasCardProps) {
    const {
        mode,
        storeHydrated,
        geminiKeyCount,
        intlSearch,
        onIntlSearchChange,
        intlLoading,
        onGenerateIdeas,
        intlError,
        intlIdeas,
        selectedIdeaIdx,
        onToggleSelectIdea,
        onClearPromptResults,
        videoFormat,
        onVideoFormatChange,
        generatingPrompt,
        generatingStep,
        beforeImagePrompt,
        beforeVideoPrompt,
        afterImagePrompt,
        afterVideoPrompt,
        onGeneratePrompt,
        onCopyPrompt,
        copiedPrompt,
        hasImagenKey,
        generatingImageBefore,
        generatedImageBefore,
        imageGenErrorBefore,
        onGenerateImageBefore,
        onDownloadImageBefore,
        generatingImageAfter,
        generatedImageAfter,
        imageGenErrorAfter,
        onGenerateImageAfter,
        onDownloadImageAfter,
        secondsBreakdown,
        generatingSeconds,
        onGenerateSeconds,
        continueStoryResult,
        generatingContinue,
        nextFocus,
        onNextFocusChange,
        onContinueStory,
        imageAspect,
        onImageAspectChange,
    } = props

    return (
        <div id="section-ide" className={cn('relative', sectionScrollClass)}>
            <div className="mb-4 flex items-center gap-3">
                <span className={sectionLabel}>Alur kerja</span>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-700/80 to-transparent" aria-hidden />
            </div>

            <div className={cn(cardBase, 'overflow-hidden p-0 rounded-3xl')}>
                <div className="relative min-h-[11rem] overflow-hidden sm:min-h-[12.5rem]">
                    <div
                        className={cn('absolute inset-0 bg-gradient-to-br', portraitHeroGradient(4))}
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 18% 28%, white 0%, transparent 45%), radial-gradient(circle at 82% 72%, white 0%, transparent 40%)',
                        }}
                        aria-hidden
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-black/15" aria-hidden />
                    <span className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-2xl bg-white/10 text-sky-200 ring-1 ring-white/20 backdrop-blur-md sm:left-5 sm:top-5">
                        <Search className="size-5" aria-hidden />
                    </span>
                    <div className="absolute inset-x-0 bottom-0 px-4 pb-5 pt-16 sm:px-6 sm:pb-6 sm:pt-20">
                        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Ide konten global</h2>
                        <p className="mt-1.5 text-[13px] text-white/80 sm:text-sm">Shorts · TikTok · Reels · judul & hook EN</p>
                    </div>
                </div>

                <div className="border-t border-zinc-800/70 bg-zinc-950/50 px-4 py-3 md:px-6">
                    <label htmlFor="intl-search" className="sr-only">
                        Kata kunci / niche (opsional)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                            <input
                                id="intl-search"
                                type="text"
                                value={intlSearch}
                                onChange={(e) => onIntlSearchChange(e.target.value)}
                                placeholder="Kata kunci / niche (opsional) — cedar cabin, motorcycle tank…"
                                disabled={intlLoading}
                                className="w-full min-h-[2.75rem] rounded-xl border border-zinc-700/80 bg-zinc-950/80 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-sky-500/45 focus:ring-1 focus:ring-sky-500/20 focus:bg-zinc-950/90 disabled:opacity-50"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={onGenerateIdeas}
                            disabled={!storeHydrated || !mode || intlLoading || geminiKeyCount === 0}
                            className="inline-flex h-[2.75rem] shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 px-6 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 transition-all hover:from-sky-400 hover:to-sky-300 hover:shadow-sky-900/40 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
                        >
                            {intlLoading ? (
                                <>
                                    <Loader2 className="size-4 shrink-0 animate-spin" />
                                    <span className="hidden xs:inline">Mencari ide…</span>
                                    <span className="xs:hidden">Cari</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-4 shrink-0" />
                                    <span className="hidden xs:inline">Generate ide konten</span>
                                    <span className="xs:hidden">Generate</span>
                                </>
                            )}
                        </button>
                    </div>
                {!mode && (
                    <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                        <p className="text-xs text-amber-300 flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Pilih mode Cabin atau Restorasi di atas untuk mengaktifkan tombol
                        </p>
                    </div>
                )}
                {!storeHydrated && (
                    <div className="mt-3 rounded-lg border border-zinc-700/50 bg-zinc-800/20 px-3 py-2">
                        <p className="text-xs text-zinc-400 flex items-center gap-2">
                            <Loader2 className="size-3 animate-spin" />
                            Memuat penyimpanan lokal (API key dari Pengaturan)…
                        </p>
                    </div>
                )}
                {storeHydrated && mode && geminiKeyCount === 0 && (
                    <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                        <p className="text-xs text-amber-300">
                            <Link href="/settings" className="font-medium hover:text-amber-200 underline-offset-2 hover:underline">
                                Pasang API key Gemini
                            </Link>{' '}
                            di Pengaturan untuk mulai generate ide
                        </p>
                    </div>
                )}
                {intlError && (
                    <div className="mt-3 rounded-lg border border-red-800/40 bg-red-950/25 px-3 py-2">
                        <p className="text-xs text-red-400 leading-relaxed">{intlError}</p>
                    </div>
                )}
                {intlIdeas.length > 0 && (
                    <div
                        className={cn(
                            'mt-8 space-y-5 border-t border-zinc-800/70 pt-8',
                            'border-l-2 border-l-sky-500/50 pl-4 sm:pl-5'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <p className={cn(sectionLabel, '!tracking-[0.12em] text-zinc-400')}>1 · Pilih ide</p>
                            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400">
                                {intlIdeas.length} ide tersedia
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                            {intlIdeas.map((idea, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        onToggleSelectIdea(idx)
                                        onClearPromptResults()
                                    }}
                                    className={cn(
                                        'group relative aspect-square flex-col items-stretch justify-between rounded-xl border p-3.5 text-left shadow-lg transition-all duration-300 sm:p-4 overflow-hidden',
                                        selectedIdeaIdx === idx
                                            ? 'border-sky-500/60 bg-gradient-to-br from-sky-500/15 to-sky-600/10 shadow-sky-950/30 ring-2 ring-sky-500/30 scale-[1.02]'
                                            : 'border-zinc-800/80 bg-zinc-950/50 hover:border-zinc-600/60 hover:bg-zinc-900/40 hover:scale-[1.01] hover:shadow-xl'
                                    )}
                                >
                                    {/* Background decoration */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                        <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-sky-400/10 to-transparent blur-xl" />
                                    </div>
                                    
                                    {/* Number badge */}
                                    <div className="relative flex items-start justify-between">
                                        <span
                                            className={cn(
                                                'flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300',
                                                selectedIdeaIdx === idx 
                                                    ? 'bg-gradient-to-br from-sky-400 to-sky-500 text-white shadow-lg shadow-sky-900/30' 
                                                    : 'bg-zinc-800/80 text-zinc-500 group-hover:bg-zinc-700/80'
                                            )}
                                        >
                                            {idx + 1}
                                        </span>
                                        {selectedIdeaIdx === idx && (
                                            <div className="flex size-2 shrink-0 items-center justify-center">
                                                <div className="size-2 rounded-full bg-sky-400 animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="relative min-w-0 flex-1 overflow-hidden pt-3">
                                        <p
                                            className={cn(
                                                'line-clamp-3 text-xs font-bold leading-snug sm:text-sm transition-colors duration-300',
                                                selectedIdeaIdx === idx ? 'text-sky-100' : 'text-zinc-100 group-hover:text-zinc-50'
                                            )}
                                        >
                                            {idea.titleEN}
                                        </p>
                                        <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-zinc-500 sm:text-[11px] group-hover:text-zinc-400 transition-colors duration-300">
                                            {idea.hookEN}
                                        </p>
                                        
                                        {/* Category tag */}
                                        <div className="mt-2 flex items-center gap-1">
                                            <span className={cn(
                                                'inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium transition-all duration-300',
                                                selectedIdeaIdx === idx
                                                    ? 'bg-sky-500/20 text-sky-300'
                                                    : 'bg-zinc-800/60 text-zinc-600 group-hover:bg-zinc-700/60'
                                            )}>
                                                {mode === 'cabin' ? 'Cabin' : 'Restoration'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Selection indicator */}
                                    {selectedIdeaIdx === idx && (
                                        <div className="absolute -bottom-1 -right-1 size-3 rounded-full bg-sky-400 shadow-lg shadow-sky-900/50">
                                            <Check className="size-2 text-white m-auto" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {selectedIdeaIdx !== null && selectedIdeaIdx >= 0 && (
                            <div
                                id="section-prompt"
                                className={cn(
                                    'space-y-6 rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-950/50 to-zinc-950/80 p-5 shadow-xl shadow-black/20 sm:p-6',
                                    sectionScrollClass
                                )}
                            >
                                {/* Selected idea summary */}
                                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                                            <span className="text-sm font-bold">{selectedIdeaIdx + 1}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-semibold text-sky-100">{intlIdeas[selectedIdeaIdx].titleEN}</h3>
                                            <p className="mt-1 text-xs text-sky-300/80">{intlIdeas[selectedIdeaIdx].hookEN}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <p className={cn(sectionLabel, 'text-zinc-400')}>2 · Format video</p>
                                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                                            Durasi video
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2">
                                        {(Object.keys(FORMAT_META) as VideoFormat[]).map((fmt) => (
                                            <button
                                                key={fmt}
                                                type="button"
                                                onClick={() => onVideoFormatChange(fmt)}
                                                className={cn(
                                                    'flex min-h-[3.25rem] flex-col items-center justify-center rounded-xl border px-1 py-2.5 text-center transition-all active:scale-[0.98]',
                                                    videoFormat === fmt
                                                        ? 'border-amber-500/55 bg-amber-500/15 ring-1 ring-amber-500/25'
                                                        : 'border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/35'
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'text-sm font-bold tabular-nums',
                                                        videoFormat === fmt ? 'text-amber-400' : 'text-zinc-300'
                                                    )}
                                                >
                                                    {FORMAT_META[fmt].label}
                                                </span>
                                                <span className="mt-0.5 text-[9px] text-zinc-500">{FORMAT_META[fmt].sub}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <TimelapseImageAspectPicker
                                    value={imageAspect}
                                    onChange={onImageAspectChange}
                                    disabled={generatingPrompt}
                                    variant="amber"
                                    videoKind={videoFormatToKind(videoFormat)}
                                />

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <p className={cn(sectionLabel, 'text-zinc-400')}>3 · Generate prompt</p>
                                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                                            4 prompts otomatis
                                        </span>
                                    </div>
                                    
                                    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4">
                                        <div className="mb-3 text-xs text-zinc-500">
                                            AI akan generate 4 prompts untuk video timelapse:
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="flex items-center gap-2 rounded-lg border border-zinc-800/40 bg-zinc-800/20 p-2">
                                                <span className="text-amber-400">🖼️</span>
                                                <span className="text-zinc-300">Before Image</span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg border border-zinc-800/40 bg-zinc-800/20 p-2">
                                                <span className="text-blue-400">🎬</span>
                                                <span className="text-zinc-300">Before Video</span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg border border-zinc-800/40 bg-zinc-800/20 p-2">
                                                <span className="text-amber-400">🖼️</span>
                                                <span className="text-zinc-300">After Image</span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg border border-zinc-800/40 bg-zinc-800/20 p-2">
                                                <span className="text-blue-400">🎬</span>
                                                <span className="text-zinc-300">After Video</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={() => onGeneratePrompt(intlIdeas[selectedIdeaIdx])}
                                        disabled={generatingPrompt}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-950/30 transition-all hover:from-amber-400 hover:to-amber-300 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
                                    >
                                        {generatingPrompt ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" /> {generatingStep || 'Generating...'}
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="size-4" /> Generate 4 Prompts (Before + After)
                                            </>
                                        )}
                                    </button>
                                </div>

                                {generatingPrompt && (
                                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Loader2 className="size-4 animate-spin text-amber-400" />
                                            <span className="text-sm font-medium text-amber-300">{generatingStep || 'Generating prompts...'}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { key: 'Before — Image', done: !!beforeImagePrompt, icon: '🖼️' },
                                                { key: 'Before — Video', done: !!beforeVideoPrompt, icon: '🎬' },
                                                { key: 'After — Image', done: !!afterImagePrompt, icon: '🖼️' },
                                                { key: 'After — Video', done: !!afterVideoPrompt, icon: '🎬' },
                                            ].map((step) => (
                                                <div key={step.key} className="flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-2">
                                                    <span className="text-sm">{step.icon}</span>
                                                    {step.done ? (
                                                        <Check className="size-3.5 shrink-0 text-emerald-400" />
                                                    ) : (
                                                        <div className="size-3.5 shrink-0 rounded-full border-2 border-zinc-700" />
                                                    )}
                                                    <span className={cn('text-xs flex-1', step.done ? 'text-emerald-400' : 'text-zinc-600')}>
                                                        {step.key}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(beforeImagePrompt || afterImagePrompt) && (
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
                                        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 transition-all hover:border-zinc-700/60">
                                            <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/60 bg-zinc-950/40 px-3 py-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                    Before — Persiapan
                                                </span>
                                            </div>
                                            <div className="flex min-h-0 flex-1 flex-col space-y-3 p-3">
                                                {beforeImagePrompt && (
                                                    <ExpandablePromptBlock
                                                        label="Image Prompt"
                                                        labelClassName="text-amber-400"
                                                        text={beforeImagePrompt}
                                                        copyId="before-img"
                                                        copiedPrompt={copiedPrompt}
                                                        onCopy={onCopyPrompt}
                                                    />
                                                )}
                                                {beforeVideoPrompt && (
                                                    <ExpandablePromptBlock
                                                        label="Video Prompt"
                                                        labelClassName="text-blue-400"
                                                        text={beforeVideoPrompt}
                                                        copyId="before-vid"
                                                        copiedPrompt={copiedPrompt}
                                                        onCopy={onCopyPrompt}
                                                    />
                                                )}
                                                {beforeImagePrompt && (
                                                    <div className="mt-auto space-y-2 border-t border-zinc-800/60 pt-3">
                                                        <button
                                                            type="button"
                                                            onClick={onGenerateImageBefore}
                                                            disabled={generatingImageBefore || !hasImagenKey}
                                                            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/50 disabled:pointer-events-none disabled:opacity-40"
                                                        >
                                                            {generatingImageBefore ? (
                                                                <>
                                                                    <Loader2 className="size-3.5 animate-spin" /> <span>Generating foto...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ImageIcon className="size-3.5" /> <span>Generate foto Before</span>
                                                                </>
                                                            )}
                                                        </button>
                                                        {imageGenErrorBefore && (
                                                            <p className="text-[10px] text-red-400">{imageGenErrorBefore}</p>
                                                        )}
                                                        {generatedImageBefore && (
                                                            <div className="space-y-1.5">
                                                                <div
                                                                    className={cn(
                                                                        'relative mx-auto w-full max-h-[min(32rem,70vh)] overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-lg transition-all hover:border-zinc-700/60',
                                                                        aspectPreviewClass(imageAspect)
                                                                    )}
                                                                >
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={`data:image/png;base64,${generatedImageBefore}`}
                                                                        alt="Before"
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={onDownloadImageBefore}
                                                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-800/30 py-2 text-[10px] font-medium text-zinc-300 transition-all hover:bg-zinc-800/60 hover:border-zinc-600/60"
                                                                >
                                                                    <Download className="size-3" /> Download Before
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-zinc-900/40 transition-all hover:border-amber-500/30">
                                            <div className="flex shrink-0 items-center justify-between border-b border-amber-500/20 bg-amber-500/5 px-3 py-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                                    After — Hasil Jadi
                                                </span>
                                            </div>
                                            <div className="flex min-h-0 flex-1 flex-col space-y-3 p-3">
                                                {afterImagePrompt && (
                                                    <ExpandablePromptBlock
                                                        label="Image Prompt"
                                                        labelClassName="text-amber-400"
                                                        text={afterImagePrompt}
                                                        copyId="after-img"
                                                        copiedPrompt={copiedPrompt}
                                                        onCopy={onCopyPrompt}
                                                    />
                                                )}
                                                {afterVideoPrompt && (
                                                    <ExpandablePromptBlock
                                                        label="Video Prompt"
                                                        labelClassName="text-blue-400"
                                                        text={afterVideoPrompt}
                                                        copyId="after-vid"
                                                        copiedPrompt={copiedPrompt}
                                                        onCopy={onCopyPrompt}
                                                    />
                                                )}

                                                {afterImagePrompt && (
                                                    <div className="mt-auto space-y-2 border-t border-amber-500/15 pt-3">
                                                        <button
                                                            type="button"
                                                            onClick={onGenerateImageAfter}
                                                            disabled={generatingImageAfter || !hasImagenKey}
                                                            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/50 disabled:pointer-events-none disabled:opacity-40"
                                                        >
                                                            {generatingImageAfter ? (
                                                                <>
                                                                    <Loader2 className="size-3.5 animate-spin" /> <span>Generating foto...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ImageIcon className="size-3.5" /> <span>Generate foto After</span>
                                                                </>
                                                            )}
                                                        </button>
                                                        {imageGenErrorAfter && (
                                                            <p className="text-[10px] text-red-400">{imageGenErrorAfter}</p>
                                                        )}
                                                        {generatedImageAfter && (
                                                            <div className="space-y-1.5">
                                                                <div
                                                                    className={cn(
                                                                        'relative mx-auto w-full max-h-[min(32rem,70vh)] overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-zinc-950 shadow-lg transition-all hover:border-amber-500/30',
                                                                        aspectPreviewClass(imageAspect)
                                                                    )}
                                                                >
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={`data:image/png;base64,${generatedImageAfter}`}
                                                                        alt="After"
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={onDownloadImageAfter}
                                                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 py-2 text-[10px] font-medium text-amber-300 transition-all hover:bg-amber-500/10 hover:border-amber-500/50"
                                                                >
                                                                    <Download className="size-3" /> Download After
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Per-second breakdown ── */}
                                {afterVideoPrompt && (
                                    <div className="space-y-4 border-t border-zinc-800/60 pt-6">
                                        <div className="flex items-center gap-3">
                                            <p className={cn(sectionLabel, 'text-zinc-400')}>4 · Breakdown video</p>
                                            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                                                Timeline detail
                                            </span>
                                        </div>
                                        
                                        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4">
                                            <div className="mb-3 text-xs text-zinc-500">
                                                AI akan membuat timeline detail untuk video {videoFormat === 'long' ? 'dokumenter panjang' : 'short-form'}:
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="flex items-center gap-2 rounded-lg border border-zinc-800/40 bg-zinc-800/20 p-2">
                                                    <span className="text-purple-400">⏱️</span>
                                                    <span className="text-zinc-300">Per detik</span>
                                                </div>
                                                <div className="flex items-center gap-2 rounded-lg border border-zinc-800/40 bg-zinc-800/20 p-2">
                                                    <span className="text-purple-400">🎥</span>
                                                    <span className="text-zinc-300">Camera angle</span>
                                                </div>
                                                <div className="flex items-center gap-2 rounded-lg border border-zinc-800/40 bg-zinc-800/20 p-2">
                                                    <span className="text-purple-400">🎬</span>
                                                    <span className="text-zinc-300">Aksi scene</span>
                                                </div>
                                                <div className="flex items-center gap-2 rounded-lg border border-zinc-800/40 bg-zinc-800/20 p-2">
                                                    <span className="text-purple-400">🎨</span>
                                                    <span className="text-zinc-300">Color grade</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button type="button" onClick={onGenerateSeconds} disabled={generatingSeconds}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-400 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-950/30 transition-all hover:from-purple-400 hover:to-purple-300 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none">
                                            {generatingSeconds ? <><Loader2 className="size-3.5 animate-spin" /> <span>Generating timeline...</span></> : <>Generate Timeline Video</>}
                                        </button>
                                        
                                        {secondsBreakdown && (
                                            <div className="rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-zinc-950/50 overflow-hidden shadow-lg">
                                                <div className="border-b border-purple-500/20 bg-purple-500/5 px-4 py-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                                                            Timeline Video
                                                        </span>
                                                        <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[9px] font-medium text-purple-300">
                                                            {secondsBreakdown.totalSeconds}s · {secondsBreakdown.fps}fps
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 text-[10px] text-purple-400/80">
                                                        Color grade: {secondsBreakdown.colorGrade}
                                                    </div>
                                                </div>
                                                <div className="divide-y divide-zinc-800/50 max-h-80 overflow-y-auto">
                                                    {secondsBreakdown.seconds.map((s) => (
                                                        <div key={s.second} className="flex gap-3 px-4 py-3 hover:bg-zinc-900/30 transition-colors">
                                                            <div className="flex shrink-0 items-center gap-2">
                                                                <span className="flex size-6 items-center justify-center rounded-full bg-purple-500/10 text-[10px] font-bold text-purple-400 tabular-nums">
                                                                    {s.second}s
                                                                </span>
                                                                <div className="w-px bg-zinc-700" />
                                                            </div>
                                                            <div className="min-w-0 flex-1 space-y-1">
                                                                <p className="text-[11px] font-medium text-zinc-200">{s.action}</p>
                                                                <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                                    <span className="text-purple-400">🎥</span> {s.camera}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Lanjutkan Cerita ── */}
                                {afterImagePrompt && afterVideoPrompt && (
                                    <div className="space-y-4 border-t border-zinc-800/60 pt-6">
                                        <div className="flex items-center gap-3">
                                            <p className={cn(sectionLabel, 'text-zinc-400')}>5 · Scene berikutnya</p>
                                            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
                                                Continue story
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                                            Generate scene lanjutan dari &ldquo;{intlIdeas[selectedIdeaIdx].titleEN}&rdquo; — interior,
                                            detail, progress, atau angle baru.
                                        </p>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Fokus scene berikutnya</label>
                                            <input type="text" value={nextFocus} onChange={(e) => onNextFocusChange(e.target.value)}
                                                placeholder="Contoh: interior framing, roof installation, window details..."
                                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-purple-500/50" />
                                        </div>
                                        <button type="button" onClick={onContinueStory} disabled={generatingContinue}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500/15 border border-purple-500/30 py-2.5 text-xs font-bold text-purple-400 transition-colors hover:bg-purple-500/25 disabled:pointer-events-none disabled:opacity-40">
                                            {generatingContinue ? <><Loader2 className="size-3.5 animate-spin" /> Generating...</> : <>Lanjutkan Cerita →</>}
                                        </button>
                                        {continueStoryResult && (
                                            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 overflow-hidden">
                                                <div className="border-b border-purple-500/20 bg-purple-500/10 px-3 py-2">
                                                    <p className="text-xs font-bold text-purple-300">{continueStoryResult.sceneTitle}</p>
                                                    <p className="text-[10px] text-zinc-500 mt-0.5">{continueStoryResult.sceneSummary}</p>
                                                </div>
                                                <div className="p-3 space-y-3">
                                                    <ExpandablePromptBlock label="Image Prompt (lanjutan)" labelClassName="text-amber-400"
                                                        text={continueStoryResult.imagePrompt} copyId="continue-img" copiedPrompt={copiedPrompt} onCopy={onCopyPrompt} />
                                                    <ExpandablePromptBlock label="Video Prompt (lanjutan)" labelClassName="text-blue-400"
                                                        text={continueStoryResult.videoPrompt} copyId="continue-vid" copiedPrompt={copiedPrompt} onCopy={onCopyPrompt} />
                                                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">Catatan Konsistensi</p>
                                                        <p className="text-[10px] text-zinc-400">{continueStoryResult.continuityNote}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
        </div>
    )
}
