'use client'

import { useState } from 'react'
import { GripVertical, Trash2, Wand2, Pencil, Copy, Check, X, ImageIcon } from 'lucide-react'
import type { Scene } from '@/types'
import { toTwoDigitOrder } from '@/lib/utils'
import useAppStore from '@/store/useAppStore'

interface SceneCardProps {
    scene: Scene
    projectId: string
    onDelete: () => void
    onOpenPromptStudio: () => void
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
}

export function SceneCard({ scene, projectId, onDelete, onOpenPromptStudio, dragHandleProps }: SceneCardProps) {
    const { updateScene, duplicateScene } = useAppStore()
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [editing, setEditing] = useState(false)
    const [editName, setEditName] = useState(scene.name)
    const [editDesc, setEditDesc] = useState(scene.description)

    function handleSaveEdit() {
        if (!editName.trim()) return
        updateScene(projectId, scene.id, editName.trim(), editDesc.trim())
        setEditing(false)
    }

    function handleCancelEdit() {
        setEditName(scene.name)
        setEditDesc(scene.description)
        setEditing(false)
    }

    return (
        <div className="relative flex items-start gap-2.5 rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-700 sm:gap-3 sm:p-3.5">
            {/* Drag handle */}
            <button
                {...dragHandleProps}
                className="mt-0.5 shrink-0 cursor-grab touch-none text-zinc-600 hover:text-zinc-400 active:cursor-grabbing"
                aria-label="Drag to reorder"
            >
                <GripVertical className="size-5" />
            </button>

            {/* Thumbnail mini */}
            {scene.imageData && (
                <div className="size-11 shrink-0 overflow-hidden rounded-md border border-zinc-700 sm:size-12 sm:rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`data:image/png;base64,${scene.imageData}`} alt={scene.name} className="w-full h-full object-cover" />
                </div>
            )}
            {!scene.imageData && (
                <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800/80 sm:size-12 sm:rounded-lg">
                    <ImageIcon className="size-4 text-zinc-600" />
                </div>
            )}

            {/* Content */}
            <div className="flex flex-1 flex-col gap-2 min-w-0">
                {editing ? (
                    <div className="space-y-2">
                        <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-lg border border-amber-500/60 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-100 outline-none"
                            placeholder="Nama scene"
                        />
                        <input
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 outline-none focus:border-zinc-600"
                            placeholder="Deskripsi (opsional)"
                        />
                        <div className="flex gap-1.5">
                            <button onClick={handleSaveEdit} className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/30 transition-colors">
                                <Check className="size-3" /> Simpan
                            </button>
                            <button onClick={handleCancelEdit} className="flex items-center gap-1 rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 hover:bg-zinc-800 transition-colors">
                                <X className="size-3" /> Batal
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400">
                                {toTwoDigitOrder(scene.order)}
                            </span>
                            <h3 className="truncate text-sm font-semibold text-zinc-100">{scene.name}</h3>
                        </div>
                        {scene.description && (
                            <p className="text-xs text-zinc-500 line-clamp-2">{scene.description}</p>
                        )}
                    </>
                )}

                {/* Status badges */}
                {!editing && (
                    <div className="flex flex-wrap gap-1">
                        {scene.imagePrompt && (
                            <span className="rounded-md bg-amber-500/12 px-1.5 py-px text-[9px] font-medium text-amber-400 sm:text-[10px]">Prompt</span>
                        )}
                        {scene.videoPrompt && (
                            <span className="rounded-md bg-zinc-700/50 px-1.5 py-px text-[9px] font-medium text-blue-400 sm:text-[10px]">Video</span>
                        )}
                        {scene.imageData && (
                            <span className="rounded-md bg-emerald-500/12 px-1.5 py-px text-[9px] font-medium text-emerald-400 sm:text-[10px]">Gambar</span>
                        )}
                    </div>
                )}

                {/* Actions */}
                {!editing && (
                    <div className="flex flex-wrap items-center gap-1 pt-0.5 sm:gap-1.5 sm:pt-1">
                        <button
                            type="button"
                            onClick={onOpenPromptStudio}
                            className="flex items-center gap-1 rounded-md bg-amber-500/12 px-2 py-1 text-[10px] font-semibold text-amber-400 transition-colors hover:bg-amber-500/22 sm:gap-1.5 sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-xs"
                        >
                            <Wand2 className="size-3 sm:size-3.5" /> Prompt
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-0.5 rounded-md border border-zinc-700/90 px-2 py-1 text-[10px] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 sm:text-xs"
                        >
                            <Pencil className="size-3" /> Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => duplicateScene(projectId, scene.id)}
                            className="flex items-center gap-0.5 rounded-md border border-zinc-700/90 px-2 py-1 text-[10px] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 sm:text-xs"
                        >
                            <Copy className="size-3" /> Copy
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            className="rounded-md p-1 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-red-400"
                            aria-label="Hapus scene"
                        >
                            <Trash2 className="size-3.5 sm:size-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Inline confirm delete */}
            {confirmDelete && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-zinc-900/95 p-4">
                    <p className="text-center text-sm text-zinc-200">
                        Hapus scene <span className="font-semibold text-zinc-100">{scene.name}</span>?
                    </p>
                    <div className="flex gap-2">
                        <button onClick={() => setConfirmDelete(false)} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800">Batal</button>
                        <button onClick={() => { setConfirmDelete(false); onDelete() }} className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30">Hapus</button>
                    </div>
                </div>
            )}
        </div>
    )
}
