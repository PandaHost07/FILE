'use client'

import { useState } from 'react'
import { Trash2, FolderOpen, Copy } from 'lucide-react'
import type { Project } from '@/types'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
    project: Project
    isActive: boolean
    onOpen: () => void
    onDelete: () => void
    onDuplicate?: () => void
}

const categoryLabel: Record<string, string> = {
    furniture: 'Furniture',
    bangunan: 'Bangunan',
    kendaraan: 'Kendaraan',
    elektronik: 'Elektronik',
    lainnya: 'Lainnya',
}

export function ProjectCard({ project, isActive, onOpen, onDelete, onDuplicate }: ProjectCardProps) {
    const [confirmDelete, setConfirmDelete] = useState(false)

    const sceneCount = project.sceneOrder.length

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
        <div
            className={cn(
                'relative flex flex-col gap-3 rounded-xl border bg-zinc-900 p-4 transition-all',
                isActive
                    ? 'border-amber-500/60 shadow-md shadow-amber-500/5'
                    : 'border-zinc-800 hover:border-amber-500/30 hover:shadow-lg hover:shadow-black/20'
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-zinc-100 truncate">{project.name}</h3>
                        {isActive && (
                            <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                                Aktif
                            </span>
                        )}
                    </div>
                    <span className="mt-1 inline-block rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                        {categoryLabel[project.category] ?? project.category}
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                    {onDuplicate && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDuplicate()
                            }}
                            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-amber-400"
                            title="Duplikat project"
                            aria-label="Duplikat project"
                        >
                            <Copy className="size-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleDeleteClick}
                        className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-400"
                        aria-label="Hapus project"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span>{sceneCount} scene</span>
                <span>·</span>
                <span>Diubah {formatDate(project.updatedAt)}</span>
            </div>

            {/* Open button */}
            <button
                onClick={onOpen}
                className="flex items-center justify-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
            >
                <FolderOpen className="size-4" />
                Buka Project
            </button>

            {/* Confirm delete dialog */}
            {confirmDelete && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-zinc-900/95 p-4">
                    <p className="text-center text-sm text-zinc-200">
                        Hapus <span className="font-semibold text-zinc-100">{project.name}</span>?
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
