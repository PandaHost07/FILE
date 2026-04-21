'use client'

import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExpandablePromptBlockProps {
    label: string
    labelClassName: string
    text: string
    copyId: string
    copiedPrompt: string | null
    onCopy: (text: string, id: string) => void
}

export function ExpandablePromptBlock({
    label,
    labelClassName,
    text,
    copyId,
    copiedPrompt,
    onCopy,
}: ExpandablePromptBlockProps) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
                <span className={cn('text-[9px] font-semibold uppercase tracking-wider', labelClassName)}>{label}</span>
                <button
                    type="button"
                    onClick={() => void onCopy(text, copyId)}
                    className="flex shrink-0 items-center gap-1 text-[9px] text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                    {copiedPrompt === copyId ? <Check className="size-3 text-green-400" /> : <Copy className="size-3" />}
                    Salin
                </button>
            </div>
            <details className="group rounded-lg border border-zinc-800/80 bg-zinc-950/50">
                <summary className="cursor-pointer list-none px-2 py-1.5 text-[10px] text-zinc-500 marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="group-open:hidden">Pratinjau singkat — klik untuk teks penuh</span>
                    <span className="hidden group-open:inline text-sky-400/90">Teks penuh (boleh pilih & salin)</span>
                </summary>
                <div className="border-t border-zinc-800/60 p-2">
                    <textarea
                        readOnly
                        value={text}
                        rows={Math.min(20, Math.max(4, Math.ceil(text.length / 100)))}
                        onFocus={(e) => e.currentTarget.select()}
                        className="w-full resize-y rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1.5 font-mono text-[11px] leading-relaxed text-zinc-300 outline-none focus:border-sky-500/40"
                    />
                </div>
            </details>
        </div>
    )
}
