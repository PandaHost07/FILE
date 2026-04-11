'use client'

import { useState, useRef } from 'react'
import { Film, Copy, Check, Loader2, Wand2, Save, ChevronDown, ChevronUp } from 'lucide-react'

interface VideoPromptPanelProps {
    value: string
    onChange: (v: string) => void
    onGenerate: () => void
    onRefine: (instruction: string) => void
    onSave: () => void
    isGenerating: boolean
    hasImagePrompt: boolean
}

export function VideoPromptPanel({
    value,
    onChange,
    onGenerate,
    onRefine,
    onSave,
    isGenerating,
    hasImagePrompt,
}: VideoPromptPanelProps) {
    const [copied, setCopied] = useState(false)
    const [refineOpen, setRefineOpen] = useState(false)
    const [refineInstruction, setRefineInstruction] = useState('')
    const refineInputRef = useRef<HTMLInputElement>(null)

    async function handleCopy() {
        if (!value) return
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    function handleToggleRefine() {
        setRefineOpen((prev) => {
            if (!prev) setTimeout(() => refineInputRef.current?.focus(), 50)
            return !prev
        })
    }

    function handleRefineSubmit(e: React.FormEvent) {
        e.preventDefault()
        const trimmed = refineInstruction.trim()
        if (!trimmed) return
        onRefine(trimmed)
        setRefineInstruction('')
        setRefineOpen(false)
    }

    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
            {/* Label */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Film className="size-4 text-amber-400" />
                    <span className="text-sm font-semibold text-zinc-100">Video Prompt</span>
                </div>
                <button
                    onClick={handleCopy}
                    disabled={!value}
                    title="Copy to clipboard"
                    className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30 disabled:pointer-events-none"
                >
                    {copied ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
                </button>
            </div>

            {/* Textarea */}
            <div className="relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={6}
                    placeholder="Video prompt akan muncul di sini setelah di-generate..."
                    className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                />
                {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-900/70">
                        <Loader2 className="size-5 animate-spin text-amber-400" />
                    </div>
                )}
            </div>

            {/* Refine inline input */}
            {refineOpen && (
                <form onSubmit={handleRefineSubmit} className="flex gap-2">
                    <input
                        ref={refineInputRef}
                        type="text"
                        value={refineInstruction}
                        onChange={(e) => setRefineInstruction(e.target.value)}
                        placeholder="Instruksi refinement..."
                        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30"
                    />
                    <button
                        type="submit"
                        disabled={!refineInstruction.trim() || isGenerating}
                        className="rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-600 disabled:opacity-40 disabled:pointer-events-none"
                    >
                        OK
                    </button>
                </form>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
                <div className="relative group/generate">
                    <button
                        onClick={onGenerate}
                        disabled={isGenerating || !hasImagePrompt}
                        className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isGenerating ? (
                            <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                            <Wand2 className="size-3.5" />
                        )}
                        Generate Video Prompt
                    </button>
                    {!hasImagePrompt && (
                        <div className="pointer-events-none absolute bottom-full left-0 mb-1.5 hidden w-max max-w-xs rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 shadow-lg group-hover/generate:block">
                            Generate Image Prompt dulu
                        </div>
                    )}
                </div>

                <button
                    onClick={handleToggleRefine}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none"
                >
                    {refineOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    Refine
                </button>

                <button
                    onClick={onSave}
                    disabled={!value}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none"
                >
                    <Save className="size-3.5" />
                    Simpan
                </button>
            </div>
        </div>
    )
}
