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
        <div className="relative flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-amber-500/30">
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
                className="flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
            >
                <Copy className="size-4" />
                Gunakan Template
            </button>

            {/* Confirm delete dialog */}
            {confirmDelete && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-zinc-900/95 p-4">
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
