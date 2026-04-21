'use client'

import Link from 'next/link'
import { ImageIcon, Loader2, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { aspectPreviewClass, type TimelapseImageAspect } from '@/lib/timelapseImageAspect'
import { TimelapseImageAspectPicker } from './TimelapseImageAspectPicker'
import { cardBase, sectionLabel, sectionScrollClass } from './constants'

interface QuickPhotoSectionProps {
    directImagePrompt: string
    onDirectImagePromptChange: (v: string) => void
    directGenerating: boolean
    directImageData: string | null
    directImageError: string | null
    hasImagenKey: boolean
    onGenerate: () => void
    onDownload: () => void
    imageAspect: TimelapseImageAspect
    onImageAspectChange: (v: TimelapseImageAspect) => void
    videoKind: 'short' | 'long'
}

const TEMPLATES = [
    'Weathered wooden cabin in forest, golden hour, cinematic',
    'Rusty vintage motorcycle in dusty garage, dramatic lighting',
    'Antique wooden chair with peeling paint, workshop setting',
    'Old stone building facade, overgrown vines, moody sky',
]

export function QuickPhotoSection({
    directImagePrompt,
    onDirectImagePromptChange,
    directGenerating,
    directImageData,
    directImageError,
    hasImagenKey,
    onGenerate,
    onDownload,
    imageAspect,
    onImageAspectChange,
    videoKind,
}: QuickPhotoSectionProps) {
    return (
        <div id="section-foto" className={cn('space-y-4', sectionScrollClass)}>
            <div className="flex items-center gap-3">
                <span className={sectionLabel}>Cepat</span>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-700/80 to-transparent" aria-hidden />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Input Controls */}
                <div className={cn(cardBase, 'space-y-4 p-6 md:p-7')}>
                    <div className="flex flex-wrap items-center gap-2">
                        <ImageIcon className="size-4 text-emerald-400" />
                        <h2 className="text-sm font-semibold text-zinc-100">Generate foto langsung</h2>
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            Stability AI
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                        Prompt bahasa Inggris biasanya memberi hasil terbaik. Klik chip untuk mengisi contoh.
                    </p>

                    <TimelapseImageAspectPicker
                        value={imageAspect}
                        onChange={onImageAspectChange}
                        disabled={directGenerating}
                        variant="emerald"
                        videoKind={videoKind}
                    />

                    <div className="flex flex-wrap gap-2">
                        {TEMPLATES.map((tmpl) => (
                            <button
                                key={tmpl}
                                type="button"
                                onClick={() => onDirectImagePromptChange(tmpl)}
                                className="max-w-full rounded-lg border border-zinc-700/90 bg-zinc-800/40 px-3 py-1.5 text-left text-[11px] leading-snug text-zinc-400 transition-colors hover:border-emerald-500/35 hover:bg-zinc-800/70 hover:text-zinc-200"
                            >
                                {tmpl.length > 48 ? tmpl.slice(0, 48) + '…' : tmpl}
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={directImagePrompt}
                        onChange={(e) => onDirectImagePromptChange(e.target.value)}
                        rows={3}
                        placeholder="Tulis prompt foto…"
                        className="w-full resize-none rounded-xl border border-zinc-700/80 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/45 focus:ring-1 focus:ring-emerald-500/20 focus:bg-zinc-950/90"
                    />

                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={directGenerating || !directImagePrompt.trim() || !hasImagenKey}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-3 text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-950/20 transition-all hover:from-emerald-400 hover:to-emerald-300 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
                    >
                        {directGenerating ? (
                            <>
                                <Loader2 className="size-4 animate-spin" /> <span>Generating foto...</span>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="size-4" /> <span>Generate foto</span>
                            </>
                        )}
                    </button>

                    {!hasImagenKey && (
                        <p className="text-center text-xs text-zinc-600">
                            Perlu Stability AI key.{' '}
                            <Link
                                href="/settings"
                                className="font-medium text-amber-400 hover:text-amber-300 underline-offset-2 hover:underline"
                            >
                                Pengaturan
                            </Link>
                        </p>
                    )}
                    {directImageError && (
                        <div className="rounded-xl border border-red-800/40 bg-red-950/25 px-4 py-3">
                            <p className="text-xs text-red-400 leading-relaxed">{directImageError}</p>
                        </div>
                    )}
                </div>

                {/* Right Column - Result Card */}
                <div className={cn(cardBase, 'space-y-4 p-6 md:p-7 border-zinc-800/60 bg-zinc-900/40')}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex size-6 items-center justify-center rounded-full bg-zinc-800/60">
                            <ImageIcon className="size-3 text-zinc-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-300">Hasil foto</h3>
                    </div>

                    {/* Image Preview Card - Always visible */}
                    <div
                        className={cn(
                            'relative w-full overflow-hidden rounded-xl border transition-all',
                            directGenerating
                                ? 'border-zinc-700/60 bg-zinc-800/40'
                                : directImageData
                                ? 'border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-zinc-950 shadow-lg ring-1 ring-emerald-500/10 hover:border-emerald-500/30'
                                : 'border-zinc-700/60 bg-zinc-800/40',
                            aspectPreviewClass(imageAspect)
                        )}
                    >
                        {directGenerating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/60 backdrop-blur-sm">
                                <Loader2 className="size-6 animate-spin text-emerald-400 mb-2" />
                                <p className="text-sm text-zinc-300">Generating foto...</p>
                                <p className="text-xs text-zinc-500 mt-1">Sedang membuat gambar AI</p>
                            </div>
                        ) : directImageData ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`data:image/png;base64,${directImageData}`}
                                    alt="Generated"
                                    className="h-full w-full object-cover"
                                />
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                                <div className="flex size-12 items-center justify-center rounded-full bg-zinc-800/60 mb-3">
                                    <ImageIcon className="size-6 text-zinc-600" />
                                </div>
                                <p className="text-sm text-zinc-400 text-center mb-1">Belum ada foto</p>
                                <p className="text-xs text-zinc-600 text-center">Generate foto untuk melihat hasil</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Download Button - Only show when image exists */}
                    {directImageData && (
                        <button
                            type="button"
                            onClick={onDownload}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/50"
                        >
                            <Download className="size-3.5" /> Download foto
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
