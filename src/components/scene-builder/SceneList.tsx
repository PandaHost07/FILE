'use client'

import { useState } from 'react'
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Layers } from 'lucide-react'
import type { Scene } from '@/types'
import useAppStore from '@/store/useAppStore'
import { SceneCard } from './SceneCard'

interface SortableSceneCardProps {
    scene: Scene
    projectId: string
    onDelete: () => void
    onOpenPromptStudio: () => void
}

function SortableSceneCard({ scene, projectId, onDelete, onOpenPromptStudio }: SortableSceneCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: scene.id,
    })

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style}>
            <SceneCard
                scene={scene}
                projectId={projectId}
                onDelete={onDelete}
                onOpenPromptStudio={onOpenPromptStudio}
                dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>}
            />
        </div>
    )
}

interface SceneListProps {
    projectId: string
    scenes: Record<string, Scene>
    sceneOrder: string[]
    onOpenPromptStudio: (sceneId: string) => void
}

export function SceneList({ projectId, scenes, sceneOrder, onOpenPromptStudio }: SceneListProps) {
    const { addScene, deleteScene, reorderScenes } = useAppStore()

    const [newName, setNewName] = useState('')
    const [newDescription, setNewDescription] = useState('')

    const sensors = useSensors(useSensor(PointerSensor))

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = sceneOrder.indexOf(active.id as string)
        const newIndex = sceneOrder.indexOf(over.id as string)
        const newOrder = arrayMove(sceneOrder, oldIndex, newIndex)
        reorderScenes(projectId, newOrder)
    }

    function handleAddScene(e: React.FormEvent) {
        e.preventDefault()
        const trimmedName = newName.trim()
        if (!trimmedName) return
        addScene(projectId, trimmedName, newDescription.trim())
        setNewName('')
        setNewDescription('')
    }

    const orderedScenes = sceneOrder.map((id) => scenes[id]).filter(Boolean)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Daftar scene</h2>
                {orderedScenes.length > 0 && (
                    <span className="text-[10px] tabular-nums text-zinc-600">{orderedScenes.length} item</span>
                )}
            </div>

            {orderedScenes.length === 0 ? (
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-[#222222] bg-[#0A0A0C] px-3 py-3 sm:px-4">
                    <Layers className="size-8 shrink-0 text-zinc-700" />
                    <p className="text-left text-xs text-zinc-500">
                        Urutan bisa diubah dengan drag handle. Isi form di bawah untuk scene pertama.
                    </p>
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={sceneOrder} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {orderedScenes.map((scene) => (
                                <SortableSceneCard
                                    key={scene.id}
                                    scene={scene}
                                    projectId={projectId}
                                    onDelete={() => deleteScene(projectId, scene.id)}
                                    onOpenPromptStudio={() => onOpenPromptStudio(scene.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <form
                onSubmit={handleAddScene}
                className="rounded-xl border border-[#1a1a1a] bg-[#0A0A0C] p-3 sm:p-4"
            >
                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Tambah scene</p>
                <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:gap-2.5">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nama scene"
                        className="w-full rounded-lg border border-[#222222] bg-[#050505] px-2.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-amber-500/55 sm:text-sm"
                    />
                    <input
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Deskripsi (opsional)"
                        className="w-full rounded-lg border border-[#222222] bg-[#050505] px-2.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-amber-500/55 sm:text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newName.trim()}
                        className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-amber-500/12 px-3 py-2 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/22 disabled:pointer-events-none disabled:opacity-40 sm:w-auto sm:min-w-[7.5rem] sm:py-2 sm:text-sm"
                    >
                        <Plus className="size-3.5 sm:size-4" />
                        Tambah
                    </button>
                </div>
            </form>
        </div>
    )
}
