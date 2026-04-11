'use client'

import { ImageIcon, Download, Loader2, Wand2 } from 'lucide-react'

interface ImagePreviewProps {
    imageData: string | null
    imagePrompt: string
    onGenerate: () => void
    isGenerating: boolean
    error: string | null
}

export function ImagePreview({
    imageData,
    imagePrompt,
    onGenerate,
    isGenerating,
    error,
}: ImagePreviewProps) {
    function handleDownload() {
        if (!imageData) return
        const link = document.createElement('a')
        link.href = `data:image/png;base64,${imageData}`
        link.download = 'image.png'
        link.click()
    }

    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ImageIcon className="size-4 text-amber-400" />
                    <span className="text-sm font-semibold text-zinc-100">Preview Gambar</span>
                </div>
                {imageData && (
                    <button
                        onClick={handleDownload}
                        title="Download gambar"
                        className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                    >
                        <Download className="size-3.5" />
                    </button>
                )}
            </div>

            {/* Image area */}
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                {imageData ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={`data:image/png;base64,${imageData}`}
                        alt="Generated image"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-700">
                        <ImageIcon className="size-10" />
                        <span className="text-xs">Belum ada gambar</span>
                    </div>
                )}

                {/* Loading overlay */}
                {isGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950/80">
                        <Loader2 className="size-8 animate-spin text-amber-400" />
                        <span className="text-xs text-zinc-400">Generating...</span>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <p className="rounded-lg border border-red-800/50 bg-red-950/30 px-3 py-2 text-xs text-red-300">
                    {error}
                </p>
            )}

            {/* Generate button */}
            <button
                onClick={onGenerate}
                disabled={isGenerating || !imagePrompt.trim()}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-50 disabled:pointer-events-none"
            >
                {isGenerating ? (
                    <Loader2 className="size-3.5 animate-spin" />
                ) : (
                    <Wand2 className="size-3.5" />
                )}
                Generate Image
            </button>
        </div>
    )
}
