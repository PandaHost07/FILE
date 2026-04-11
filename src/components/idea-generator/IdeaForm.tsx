'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import type { IdeaInput } from '@/types'

const VISUAL_STYLES = [
    'Cinematic',
    'Documentary',
    'Aesthetic',
    'Raw/Industrial',
    'Warm & Cozy',
]

interface IdeaFormProps {
    onGenerate: (input: IdeaInput) => void
    isLoading: boolean
    error: string | null
}

export function IdeaForm({ onGenerate, isLoading, error }: IdeaFormProps) {
    const [objectType, setObjectType] = useState('')
    const [initialCondition, setInitialCondition] = useState('')
    const [visualStyle, setVisualStyle] = useState(VISUAL_STYLES[0])

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!objectType.trim() || !initialCondition.trim()) return
        onGenerate({ objectType: objectType.trim(), initialCondition: initialCondition.trim(), visualStyle })
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
            <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400">Jenis Objek</label>
                <input
                    type="text"
                    value={objectType}
                    onChange={(e) => setObjectType(e.target.value)}
                    placeholder="Contoh: kursi kayu antik, motor klasik"
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-colors disabled:opacity-50"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400">Kondisi Awal</label>
                <textarea
                    value={initialCondition}
                    onChange={(e) => setInitialCondition(e.target.value)}
                    placeholder="Contoh: cat mengelupas, kaki patah, berdebu"
                    rows={3}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-colors resize-none disabled:opacity-50"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400">Gaya Visual</label>
                <select
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-colors disabled:opacity-50"
                >
                    {VISUAL_STYLES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading || !objectType.trim() || !initialCondition.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Sparkles className="size-4" />
                        Generate Ide
                    </>
                )}
            </button>
        </form>
    )
}

export { VISUAL_STYLES }
