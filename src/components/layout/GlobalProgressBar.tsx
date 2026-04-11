'use client'

import { useEffect, useRef } from 'react'
import useAppStore from '@/store/useAppStore'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/toast'

export function GlobalProgressBar() {
    const { activeProjectId, projects } = useAppStore()
    const { toast } = useToast()
    const toastedRef = useRef<string | null>(null)

    const project = activeProjectId ? projects.find((p) => p.id === activeProjectId) : null
    const sceneIds = project?.sceneOrder ?? []
    const total = sceneIds.length
    const done = sceneIds.filter((id) => project?.scenes[id]?.imageStatus === 'sudah').length
    const allDone = total > 0 && done === total

    useEffect(() => {
        if (allDone && toastedRef.current !== activeProjectId) {
            toastedRef.current = activeProjectId
            toast({ title: 'Siap Export! 🎉', description: 'Semua scene sudah punya gambar.', variant: 'success' })
        }
        if (!allDone && toastedRef.current === activeProjectId) {
            toastedRef.current = null
        }
    }, [allDone, activeProjectId, toast])

    if (!project) {
        return <p className="text-xs text-zinc-500">Belum ada project aktif</p>
    }

    if (total === 0) {
        return (
            <div className="space-y-1">
                <p className="text-xs text-zinc-500">0 dari 0 scene sudah punya gambar</p>
                <Progress value={0} />
            </div>
        )
    }

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                    {done} dari {total} scene sudah punya gambar
                </p>
                {allDone && (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        Siap Export! 🎉
                    </span>
                )}
            </div>
            <Progress value={done} max={total} />
        </div>
    )
}
