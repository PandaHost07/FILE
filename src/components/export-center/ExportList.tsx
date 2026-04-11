'use client'

import { Download } from 'lucide-react'
import type { Scene } from '@/types'
import { toSceneSlug } from '@/lib/utils'
import { estimateZipSize } from '@/lib/export'

interface ExportListProps {
    scenes: Scene[]
    projectName: string
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function downloadSingleImage(scene: Scene) {
    if (!scene.imageData) return
    const base64 = scene.imageData.includes(',') ? scene.imageData.split(',')[1] : scene.imageData
    const byteChars = atob(base64)
    const byteArr = new Uint8Array(byteChars.length)
    for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i)
    const blob = new Blob([byteArr], { type: 'image/png' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${toSceneSlug(scene)}.png`
    a.click()
    URL.revokeObjectURL(url)
}

export function ExportList({ scenes }: ExportListProps) {
    const estimatedSize = estimateZipSize(scenes)

    return (
        <div className="space-y-1">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide border-b border-zinc-800">
                <span>Scene</span>
                <span className="text-center">Gambar</span>
                <span className="text-center">Prompt</span>
                <span />
            </div>

            {scenes.map((scene) => {
                const hasImage = !!scene.imageData
                const hasPrompt = scene.promptStatus === 'sudah'
                return (
                    <div key={scene.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center px-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                        <span className="text-sm font-medium text-zinc-200 truncate">
                            {String(scene.order).padStart(2, '0')}. {scene.name}
                        </span>
                        <span className={`text-center text-sm font-bold ${hasImage ? 'text-green-400' : 'text-red-400'}`}>
                            {hasImage ? '✓' : '✗'}
                        </span>
                        <span className={`text-center text-sm font-bold ${hasPrompt ? 'text-green-400' : 'text-red-400'}`}>
                            {hasPrompt ? '✓' : '✗'}
                        </span>
                        <button
                            disabled={!hasImage}
                            onClick={() => downloadSingleImage(scene)}
                            title={hasImage ? 'Download gambar ini' : 'Gambar belum tersedia'}
                            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-300 disabled:opacity-30 disabled:pointer-events-none"
                        >
                            <Download className="size-3.5" />
                        </button>
                    </div>
                )
            })}

            {scenes.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-6">Belum ada scene di project ini.</p>
            )}

            <div className="border-t border-zinc-800 pt-3 mt-3 flex items-center justify-between text-xs text-zinc-500 px-3">
                <span>{scenes.filter((s) => s.imageData).length} / {scenes.length} scene punya gambar</span>
                <span>Estimasi ZIP: {formatBytes(estimatedSize)}</span>
            </div>
        </div>
    )
}
