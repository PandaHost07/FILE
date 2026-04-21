'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, FileText, AlertTriangle, PackageOpen } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { ExportList } from '@/components/export-center/ExportList'
import { downloadImagesAsZip, downloadPromptsAsTxt } from '@/lib/export'

export default function ExportCenterPage() {
    const { projects, activeProjectId } = useAppStore()
    const [downloading, setDownloading] = useState(false)
    const [showWarning, setShowWarning] = useState(false)

    const activeProject = projects.find((p) => p.id === activeProjectId) ?? null

    if (!activeProject) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#000000] p-6 text-center">
                <PackageOpen className="size-8 text-zinc-600" />
                <p className="text-sm text-zinc-400">Belum ada project aktif.</p>
                <Link href="/library" className="rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20">
                    Ke Library
                </Link>
            </div>
        )
    }

    const scenes = activeProject.sceneOrder.map((id) => activeProject.scenes[id]).filter(Boolean)
    const scenesWithoutImage = scenes.filter((s) => !s.imageData)
    const hasIncomplete = scenesWithoutImage.length > 0

    async function handleDownloadAllImages(onlyComplete = false) {
        setDownloading(true)
        setShowWarning(false)
        try {
            const targetScenes = onlyComplete ? scenes.filter((s) => s.imageData) : scenes
            await downloadImagesAsZip(activeProject!, targetScenes)
        } finally {
            setDownloading(false)
        }
    }

    async function handleDownloadPrompts() {
        setDownloading(true)
        try {
            await downloadPromptsAsTxt(activeProject!, scenes)
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="min-h-full bg-[#000000]">
            <div className="w-full min-w-0 space-y-5 px-4 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-6 xl:px-10">
                <header className="border-b border-[#1a1a1a] pb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Export</p>
                    <h1 className="text-lg font-bold tracking-tight text-zinc-100">{activeProject.name}</h1>
                </header>

                {/* Warning dialog */}
                {showWarning && (
                    <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 space-y-3">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="size-4 text-amber-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-amber-300">
                                    {scenesWithoutImage.length} scene belum punya gambar
                                </p>
                                <p className="text-xs text-zinc-400 mt-1">
                                    Scene yang belum lengkap: {scenesWithoutImage.map((s) => s.name).join(', ')}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowWarning(false)}
                                disabled={downloading}
                                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDownloadAllImages(true)}
                                disabled={downloading}
                                className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/30"
                            >
                                Download yang sudah lengkap saja
                            </button>
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => hasIncomplete ? setShowWarning(true) : handleDownloadAllImages(false)}
                        disabled={downloading || scenes.length === 0}
                        className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <Download className="size-4" />
                        {downloading ? 'Mengunduh...' : 'Download All Images'}
                    </button>
                    <button
                        onClick={handleDownloadPrompts}
                        disabled={downloading || scenes.length === 0}
                        className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <FileText className="size-4" />
                        {downloading ? 'Mengunduh...' : 'Download Prompts (.txt)'}
                    </button>
                </div>

                {/* Scene list */}
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0A0A0C] p-4">
                    <ExportList scenes={scenes} projectName={activeProject.name} />
                </div>
            </div>
        </div>
    )
}
