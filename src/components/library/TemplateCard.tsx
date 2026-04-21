'use client'

import { useState } from 'react'
import { Trash2, Copy } from 'lucide-react'
import type { Template } from '@/types'
import { formatDate } from '@/lib/utils'

interface TemplateCardProps {
    template: Template
    onUse: () => void
    onDelete: () => void
}

export function TemplateCard({ template, onUse, onDelete }: TemplateCardProps) {
    const [confirmDelete, setConfirmDelete] = useState(false)

    function handleDeleteClick() {
        setConfirmDelete(true)
    }

    function handleConfirmDelete() {
        setConfirmDelete(false)
        onDelete()
    }

    function handleCancelDelete() {
        setConfirmDelete(false)
    }

    return (
        <div className="relative flex flex-col gap-3 rounded-2xl border border-[#1f1f24] bg-[#121214] p-4 shadow-lg shadow-black/15 transition-colors hover:border-cyan-500/35">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100 truncate">{template.name}</h3>
                </div>

                {/* Delete button */}
                <button
                    onClick={handleDeleteClick}
                    className="shrink-0 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-400"
                    aria-label="Hapus template"
                >
                    <Trash2 className="size-4" />
                </button>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span>{template.scenes.length} scene</span>
                <span>·</span>
                <span>Dibuat {formatDate(template.createdAt)}</span>
            </div>

            {/* Use button */}
            <button
                onClick={onUse}
                className="flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20"
            >
                <Copy className="size-4" />
                Gunakan Template
            </button>

            {/* Confirm delete dialog */}
            {confirmDelete && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#121214]/95 p-4 backdrop-blur-sm">
                    <p className="text-center text-sm text-zinc-200">
                        Hapus template <span className="font-semibold text-zinc-100">{template.name}</span>?
                    </p>
                    <p className="text-center text-xs text-zinc-500">Tindakan ini tidak dapat dibatalkan.</p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancelDelete}
                            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
