'use client'

import { useState } from 'react'
import useAppStore from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import { Sparkles, Download, Loader2, Palette } from 'lucide-react'
import { aspectPreviewClass, type TimelapseImageAspect } from '@/lib/timelapseImageAspect'
import { TimelapseImageAspectPicker } from '@/components/video-timelapse/TimelapseImageAspectPicker'
import { cardBase } from '@/components/video-timelapse/constants'
import { generateImage } from '@/lib/imagen'
import { useToast } from '@/components/ui/toast'

export default function GenerateImagePage() {
    const { toast } = useToast()
    const { apiKeys } = useAppStore()
    const [prompt, setPrompt] = useState('')
    const [imageAspect, setImageAspect] = useState<TimelapseImageAspect>('9:16')
    const [generating, setGenerating] = useState(false)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showTemplates, setShowTemplates] = useState(false)

    async function handleGenerate() {
        if (!prompt.trim() || !apiKeys.imagen) return

        setGenerating(true)
        setError(null)
        setGeneratedImage(null)

        try {
            const base64 = await generateImage(apiKeys.imagen, prompt, {
                aspectRatio: imageAspect,
            })
            setGeneratedImage(base64)
            toast({ title: 'Gambar berhasil digenerate', variant: 'default' })
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Gagal generate gambar'
            setError(errorMessage)
            toast({ 
                title: 'Gagal generate gambar', 
                description: errorMessage, 
                variant: 'destructive' 
            })
        } finally {
            setGenerating(false)
        }
    }

    function downloadImage() {
        if (!generatedImage) return
        const a = document.createElement('a')
        a.href = `data:image/png;base64,${generatedImage}`
        a.download = `generated-image-${Date.now()}.png`
        a.click()
    }

    const templates = [
        'Weathered wooden cabin in forest, golden hour, cinematic',
        'Rusty vintage motorcycle in dusty garage, dramatic lighting',
        'Antique wooden chair with peeling paint, workshop setting',
        'Old stone building facade, overgrown vines, moody sky',
        'Abandoned farmhouse, overgrown garden, misty morning',
        'Vintage typewriter on wooden desk, warm lighting',
    ]

    return (
        <div className="min-h-full bg-zinc-950">
            <div className="mx-auto w-full min-w-0 max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Clean Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Palette className="size-5 text-emerald-400" />
                        </div>
                        <h1 className="text-2xl font-medium text-zinc-100">Generate Image</h1>
                    </div>
                    <p className="text-sm text-zinc-500 max-w-md mx-auto">
                        Create stunning images with AI using simple text prompts
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Input Controls */}
                    <div className={cn(cardBase, 'space-y-4 p-6 border-zinc-800/60 bg-zinc-900/40')}>
                        {/* Aspect Ratio */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Aspect Ratio</label>
                            <TimelapseImageAspectPicker
                                value={imageAspect}
                                onChange={setImageAspect}
                                disabled={generating}
                                variant="emerald"
                                videoKind="short"
                            />
                        </div>

                        {/* Templates */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-zinc-300">Templates</label>
                                <button
                                    type="button"
                                    onClick={() => setShowTemplates(!showTemplates)}
                                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showTemplates ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {showTemplates && (
                                <div className="flex flex-wrap gap-2">
                                    {templates.map((tmpl, idx) => (
                                        <button
                                            key={tmpl}
                                            type="button"
                                            onClick={() => setPrompt(tmpl)}
                                            className="rounded-lg border border-zinc-700/60 bg-zinc-800/40 px-3 py-1.5 text-xs text-zinc-400 hover:border-emerald-500/30 hover:bg-zinc-700/40 hover:text-zinc-200 transition-colors"
                                        >
                                            {['🏠', '🏍️', '🪑', '🏛️', '🏚️', '⌨️'][idx]} {tmpl.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Prompt Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Prompt</label>
                            <div className="relative">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows={4}
                                    placeholder="Describe your image... (e.g., A weathered wooden cabin in forest, golden hour lighting)"
                                    className="w-full resize-none rounded-lg border border-zinc-700/60 bg-zinc-800/40 px-3 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-500/50 focus:bg-zinc-800/60"
                                />
                                <div className="absolute bottom-2 right-2 text-xs text-zinc-600">
                                    {prompt.length}/500
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Be specific about lighting, mood, and colors for best results.
                            </p>
                        </div>

                        {/* Generate Button */}
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={generating || !prompt.trim() || !apiKeys.imagen}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-sm font-medium text-white hover:bg-emerald-600 disabled:bg-zinc-700 disabled:text-zinc-400 transition-colors"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-4" />
                                    Generate Image
                                </>
                            )}
                        </button>

                        {/* API Key Warning */}
                        {!apiKeys.imagen && (
                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                                <p className="text-sm text-amber-300">
                                    <strong>API Key Required:</strong> Add your Stability AI key in{' '}
                                    <a
                                        href="/settings"
                                        className="text-amber-200 underline hover:no-underline"
                                    >
                                        Settings
                                    </a>{' '}
                                    to start generating images.
                                </p>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                                <p className="text-sm text-red-300">
                                    <strong>Error:</strong> {error}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Result Card */}
                    <div className={cn(cardBase, 'space-y-4 p-6 border-zinc-800/60 bg-zinc-900/40')}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex size-6 items-center justify-center rounded-full bg-zinc-800/60">
                                <Palette className="size-3 text-zinc-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-zinc-300">Generated Image</h3>
                        </div>

                        {/* Image Preview Card - Always visible */}
                        <div
                            className={cn(
                                'relative w-full overflow-hidden rounded-lg border transition-all',
                                generating
                                    ? 'border-zinc-700/60 bg-zinc-800/40'
                                    : generatedImage
                                    ? 'border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-zinc-950 shadow-lg ring-1 ring-emerald-500/10 hover:border-emerald-500/30'
                                    : 'border-zinc-700/60 bg-zinc-800/40',
                                aspectPreviewClass(imageAspect)
                            )}
                        >
                            {generating ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/60 backdrop-blur-sm">
                                    <Loader2 className="size-6 animate-spin text-emerald-400 mb-2" />
                                    <p className="text-sm text-zinc-300">Generating image...</p>
                                    <p className="text-xs text-zinc-500 mt-1">Creating your AI masterpiece</p>
                                </div>
                            ) : generatedImage ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`data:image/png;base64,${generatedImage}`}
                                        alt="Generated"
                                        className="h-full w-full object-cover"
                                    />
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                                    <div className="flex size-12 items-center justify-center rounded-full bg-zinc-800/60 mb-3">
                                        <Palette className="size-6 text-zinc-600" />
                                    </div>
                                    <p className="text-sm text-zinc-400 text-center mb-1">No image yet</p>
                                    <p className="text-xs text-zinc-600 text-center">Generate an image to see result</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Download Button - Only show when image exists */}
                        {generatedImage && (
                            <button
                                type="button"
                                onClick={downloadImage}
                                className="w-full flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-sm text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50"
                            >
                                <Download className="size-4" />
                                Download Image
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
