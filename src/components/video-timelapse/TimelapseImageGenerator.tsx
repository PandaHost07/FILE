'use client'

import { Loader2, ImageIcon, Download, Sparkles, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { aspectPreviewClass, type TimelapseImageAspect } from '@/lib/timelapseImageAspect'
import { TimelapseImageAspectPicker } from './TimelapseImageAspectPicker'
import { cardBase, sectionLabel, sectionScrollClass } from './constants'

interface TimelapseImageGeneratorProps {
    beforeImagePrompt: string | null
    afterImagePrompt: string | null
    selectedIdeaTitle: string | null
    selectedIdeaHook: string | null
    hasImagenKey: boolean
    imageAspect: TimelapseImageAspect
    onImageAspectChange: (v: TimelapseImageAspect) => void
    onGenerateBeforeImage: () => void
    onGenerateAfterImage: () => void
    onDownloadBeforeImage: () => void
    onDownloadAfterImage: () => void
    generatingBeforeImage: boolean
    generatingAfterImage: boolean
    generatedBeforeImage: string | null
    generatedAfterImage: string | null
    beforeImageError: string | null
    afterImageError: string | null
}

export function TimelapseImageGenerator({
    beforeImagePrompt,
    afterImagePrompt,
    selectedIdeaTitle,
    selectedIdeaHook,
    hasImagenKey,
    imageAspect,
    onImageAspectChange,
    onGenerateBeforeImage,
    onGenerateAfterImage,
    onDownloadBeforeImage,
    onDownloadAfterImage,
    generatingBeforeImage,
    generatingAfterImage,
    generatedBeforeImage,
    generatedAfterImage,
    beforeImageError,
    afterImageError,
}: TimelapseImageGeneratorProps) {
    // Only show if we have prompts and selected idea
    if (!beforeImagePrompt || !afterImagePrompt || !selectedIdeaTitle) {
        return null
    }

    return (
        <div id="section-timelapse-images" className={cn('space-y-4', sectionScrollClass)}>
            <div className="flex items-center gap-3">
                <span className={sectionLabel}>Generate Gambar</span>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-700/80 to-transparent" aria-hidden />
            </div>
            
            <div className={cn(cardBase, 'space-y-6 p-6 md:p-7')}>
                {/* Header dengan konteks ide */}
                <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-900/30">
                            <Sparkles className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-amber-100">Generate Gambar Timelapse</h3>
                            <p className="mt-1 text-xs text-amber-300/80 font-medium">
                                &ldquo;{selectedIdeaTitle}&rdquo;
                            </p>
                            {selectedIdeaHook && (
                                <p className="mt-1 text-xs text-amber-400/70 italic">{selectedIdeaHook}</p>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-medium text-amber-300">
                                    Before + After
                                </span>
                                <span className="text-[9px] text-amber-400/60">Berdasarkan prompt yang dihasilkan</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Aspect picker */}
                <TimelapseImageAspectPicker
                    value={imageAspect}
                    onChange={onImageAspectChange}
                    disabled={generatingBeforeImage || generatingAfterImage}
                    variant="amber"
                    videoKind="short"
                />

                {/* Grid untuk Before dan After */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Before Image */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-500">
                                <Camera className="size-3" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-zinc-100">Before - Persiapan</h4>
                                <p className="text-xs text-zinc-500">Gambar tahap awal/restoration</p>
                            </div>
                        </div>

                        {/* Prompt preview */}
                        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-zinc-400 font-medium">Image Prompt:</p>
                                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[9px] text-zinc-500">
                                    Before
                                </span>
                            </div>
                            <p className="text-xs text-zinc-300 line-clamp-4 leading-relaxed bg-zinc-950/40 p-2 rounded border border-zinc-800/40">
                                {beforeImagePrompt}
                            </p>
                        </div>

                        {/* Generate button */}
                        <button
                            type="button"
                            onClick={onGenerateBeforeImage}
                            disabled={generatingBeforeImage || !hasImagenKey}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/30 py-2.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-800/60 hover:border-zinc-600/60 disabled:pointer-events-none disabled:opacity-40"
                        >
                            {generatingBeforeImage ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    <span>Generating Before...</span>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="size-3.5" />
                                    <span>Generate Gambar Before</span>
                                </>
                            )}
                        </button>

                        {/* Error */}
                        {beforeImageError && (
                            <div className="rounded-lg border border-red-800/40 bg-red-950/25 px-3 py-2">
                                <p className="text-xs text-red-400 leading-relaxed">{beforeImageError}</p>
                            </div>
                        )}

                        {/* Generated image */}
                        {generatedBeforeImage && (
                            <div className="space-y-3">
                                <div
                                    className={cn(
                                        'relative mx-auto w-full overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-lg transition-all hover:border-zinc-700/60',
                                        aspectPreviewClass(imageAspect)
                                    )}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`data:image/png;base64,${generatedBeforeImage}`}
                                        alt="Before"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={onDownloadBeforeImage}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-800/30 py-2 text-[10px] font-medium text-zinc-300 transition-all hover:bg-zinc-800/60 hover:border-zinc-600/60"
                                >
                                    <Download className="size-3" />
                                    Download Before
                                </button>
                            </div>
                        )}
                    </div>

                    {/* After Image */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                                <Sparkles className="size-3" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-amber-100">After - Hasil Jadi</h4>
                                <p className="text-xs text-amber-400/60">Gambar hasil akhir/restoration</p>
                            </div>
                        </div>

                        {/* Prompt preview */}
                        <div className="rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-3">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-amber-400 font-medium">Image Prompt:</p>
                                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] text-amber-300">
                                    After
                                </span>
                            </div>
                            <p className="text-xs text-amber-100 line-clamp-4 leading-relaxed bg-amber-500/5 p-2 rounded border border-amber-500/20">
                                {afterImagePrompt}
                            </p>
                        </div>

                        {/* Generate button */}
                        <button
                            type="button"
                            onClick={onGenerateAfterImage}
                            disabled={generatingAfterImage || !hasImagenKey}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-semibold text-amber-400 transition-all hover:bg-amber-500/20 hover:border-amber-500/50 disabled:pointer-events-none disabled:opacity-40"
                        >
                            {generatingAfterImage ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    <span>Generating After...</span>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="size-3.5" />
                                    <span>Generate Gambar After</span>
                                </>
                            )}
                        </button>

                        {/* Error */}
                        {afterImageError && (
                            <div className="rounded-lg border border-red-800/40 bg-red-950/25 px-3 py-2">
                                <p className="text-xs text-red-400 leading-relaxed">{afterImageError}</p>
                            </div>
                        )}

                        {/* Generated image */}
                        {generatedAfterImage && (
                            <div className="space-y-3">
                                <div
                                    className={cn(
                                        'relative mx-auto w-full overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-zinc-950 shadow-lg transition-all hover:border-amber-500/30',
                                        aspectPreviewClass(imageAspect)
                                    )}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`data:image/png;base64,${generatedAfterImage}`}
                                        alt="After"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={onDownloadAfterImage}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 py-2 text-[10px] font-medium text-amber-300 transition-all hover:bg-amber-500/10 hover:border-amber-500/50"
                                >
                                    <Download className="size-3" />
                                    Download After
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions */}
                {!hasImagenKey && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                        <p className="text-xs text-amber-300">
                            <strong>Perlu API key:</strong> Tambahkan Stability AI key di{' '}
                            <a
                                href="/settings"
                                className="font-medium text-amber-200 underline-offset-2 hover:underline"
                            >
                                Pengaturan
                            </a>{' '}
                            untuk mulai generate gambar.
                        </p>
                    </div>
                )}

                {/* Tips dan konteks */}
                <div className="rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-zinc-900/40 px-4 py-3">
                    <div className="flex items-start gap-2">
                        <Sparkles className="size-3.5 text-amber-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs font-medium text-amber-300 mb-2">Konteks & Tips:</p>
                            <div className="space-y-2">
                                <div className="text-xs text-amber-200/80">
                                    <strong>Fokus utama:</strong> &ldquo;{selectedIdeaTitle}&rdquo;
                                </div>
                                <ul className="text-xs text-amber-100/60 space-y-1">
                                    <li>• Generate kedua gambar untuk kontras Before/After yang maksimal</li>
                                    <li>• Gambar Before: kondisi awal, material mentah, persiapan</li>
                                    <li>• Gambar After: hasil akhir, restoration sempurna, detail halus</li>
                                    <li>• Gunakan aspect ratio sama untuk konsistensi video timelapse</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
