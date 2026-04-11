'use client'

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
    horizontalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowRight, GripVertical } from 'lucide-react'
import type { Scene } from '@/types'
import { TimelineCard } from './TimelineCard'
import { cn } from '@/lib/utils'

interface SortableSceneProps {
    scene: Scene
    thumb: string | undefined
    onOpen: () => void
}

function SortableSceneWrap({ scene, thumb, onOpen }: SortableSceneProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: scene.id,
    })

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const statusHint = [
        thumb || scene.imageData ? 'Gambar' : null,
        scene.imagePrompt ? 'IP' : null,
        scene.videoPrompt ? 'VP' : null,
    ]
        .filter(Boolean)
        .join(' · ')

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn('flex shrink-0 items-center gap-1', isDragging && 'z-20 opacity-90')}
        >
            <button
                type="button"
                className="touch-none rounded-lg border border-zinc-800/90 bg-zinc-900/80 p-1.5 text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300"
                aria-label="Seret untuk mengurutkan"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="size-4" />
            </button>
            <TimelineCard
                scene={scene}
                thumbnailOverride={thumb}
                onClick={onOpen}
                title={statusHint ? `Status: ${statusHint}` : scene.name}
            />
        </div>
    )
}

interface TimelineDndStripProps {
    scenes: Scene[]
    sceneOrder: string[]
    thumbs: Record<string, string>
    projectId: string
    onReorder: (projectId: string, newOrder: string[]) => void
    onOpenScene: (sceneId: string) => void
}

export function TimelineDndStrip({
    scenes,
    sceneOrder,
    thumbs,
    projectId,
    onReorder,
    onOpenScene,
}: TimelineDndStripProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        })
    )

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over || active.id === over.id) return
        const oldIndex = sceneOrder.indexOf(active.id as string)
        const newIndex = sceneOrder.indexOf(over.id as string)
        if (oldIndex < 0 || newIndex < 0) return
        onReorder(projectId, arrayMove(sceneOrder, oldIndex, newIndex))
    }

    const byId = Object.fromEntries(scenes.map((s) => [s.id, s]))

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sceneOrder} strategy={horizontalListSortingStrategy}>
                <div
                    className="flex snap-x snap-mandatory items-center gap-2 overflow-x-auto pb-4 scrollbar-thin [scrollbar-color:rgba(63,63,70,0.8)_transparent]"
                    style={{ minWidth: 'min-content' }}
                >
                    {sceneOrder.map((id, idx) => {
                        const scene = byId[id]
                        if (!scene) return null
                        return (
                            <div key={id} className="flex shrink-0 snap-center items-center gap-2">
                                <SortableSceneWrap
                                    scene={scene}
                                    thumb={thumbs[id]}
                                    onOpen={() => onOpenScene(id)}
                                />
                                {idx < sceneOrder.length - 1 && (
                                    <ArrowRight className="size-4 shrink-0 text-zinc-600" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </SortableContext>
        </DndContext>
    )
}
