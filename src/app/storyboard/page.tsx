'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { LayoutGrid, Download, Layers, ImageIcon, Wand2, ArrowRight } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { toTwoDigitOrder } from '@/lib/utils'

export default function StoryboardPage() {
    const router = useRouter()
    const { projects, activeProjectId, setActiveScene } = useAppStore()
    const [layout, setLayout] = useState<'grid' | 'strip'>('grid')

    const activeProject = projects.find((p) => p.id === activeProjectId) ?? null
    const scenes = activeProject
        ? activeProject.sceneOrder.map((id) => activeProject.scenes[id]).filter(Boolean)
        : []

    const scenesWithImage = scenes.filter((s) => s.imageData).length

    function handleExportPDF() {
        window.print()
    }

    if (!activeProject) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 p-6 text-center">
                <Layers className="size-8 text-zinc-600" />
                <p className="text-sm text-zinc-400">Pilih project aktif terlebih dahulu.</p>
                <Link href="/library" className="rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors">
                    Ke Library
                </Link>
            </div>
        )
    }

    return (
        <>
            {/* Print styles */}
            <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-page { background: white !important; color: black !important; }
          .scene-card { break-inside: avoid; border: 1px solid #ccc !important; }
        }
      `}</style>

            <div className="min-h-screen bg-zinc-950 p-6 md:p-10 print-page">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Header */}
                    <div className="no-print flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <LayoutGrid className="size-5 text-pink-400" />
                                <h1 className="text-2xl font-bold text-zinc-100">Storyboard</h1>
                            </div>
                            <p className="text-zinc-400 text-sm">{activeProject.name} · {scenes.length} scene · {scenesWithImage} gambar</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Layout toggle */}
                            <div className="flex rounded-xl border border-zinc-700 overflow-hidden">
                                <button
                                    onClick={() => setLayout('grid')}
                                    className={`px-3 py-2 text-xs font-medium transition-colors ${layout === 'grid' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800'}`}
                                >
                                    Grid
                                </button>
                                <button
                                    onClick={() => setLayout('strip')}
                                    className={`px-3 py-2 text-xs font-medium transition-colors ${layout === 'strip' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800'}`}
                                >
                                    Film Strip
                                </button>
                            </div>
                            <button
                                onClick={handleExportPDF}
                                className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                            >
                                <Download className="size-4" />
                                Export PDF
                            </button>
                        </div>
                    </div>

                    {/* Print header */}
                    <div className="hidden print:block mb-6">
                        <h1 className="text-2xl font-bold">{activeProject.name} — Storyboard</h1>
                        <p className="text-sm text-gray-500">{scenes.length} scene · RestoreGen</p>
                    </div>

                    {/* Empty state */}
                    {scenes.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-zinc-700 py-20 text-center">
                            <Layers className="size-10 text-zinc-700" />
                            <p className="text-zinc-400">Belum ada scene. Buat scene di Scene Builder dulu.</p>
                            <Link href="/scene-builder" className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors">
                                Ke Scene Builder <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    )}

                    {/* Grid layout */}
                    {layout === 'grid' && scenes.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {scenes.map((scene) => (
                                <div
                                    key={scene.id}
                                    className="scene-card rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-zinc-700 transition-colors cursor-pointer group"
                                    onClick={() => { setActiveScene(scene.id); router.push('/prompt-studio') }}
                                >
                                    {/* Image */}
                                    <div className="relative aspect-video bg-zinc-800">
                                        {scene.imageData ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={`data:image/png;base64,${scene.imageData}`}
                                                alt={scene.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-600">
                                                <ImageIcon className="size-8" />
                                                <span className="text-xs">Belum ada gambar</span>
                                            </div>
                                        )}
                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-white">
                                                <Wand2 className="size-3.5" /> Buka Prompt Studio
                                            </span>
                                        </div>
                                        {/* Order badge */}
                                        <span className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                                            {toTwoDigitOrder(scene.order)}
                                        </span>
                                        {/* Status dot */}
                                        <span className={`absolute top-2 right-2 size-2 rounded-full ${scene.imageData ? 'bg-green-400' : 'bg-zinc-600'}`} />
                                    </div>

                                    {/* Info */}
                                    <div className="p-3 space-y-1">
                                        <p className="text-xs font-semibold text-zinc-100 truncate">{scene.name}</p>
                                        {scene.description && (
                                            <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">{scene.description}</p>
                                        )}
                                        <div className="flex gap-1 pt-1">
                                            {scene.imagePrompt && <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">IP</span>}
                                            {scene.videoPrompt && <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-medium text-blue-400">VP</span>}
                                            {scene.imageData && <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">IMG</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Film strip layout */}
                    {layout === 'strip' && scenes.length > 0 && (
                        <div className="space-y-6">
                            {scenes.map((scene) => (
                                <div
                                    key={scene.id}
                                    className="scene-card flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors cursor-pointer group"
                                    onClick={() => { setActiveScene(scene.id); router.push('/prompt-studio') }}
                                >
                                    {/* Thumbnail */}
                                    <div className="relative w-48 shrink-0 aspect-video rounded-xl overflow-hidden bg-zinc-800">
                                        {scene.imageData ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={`data:image/png;base64,${scene.imageData}`}
                                                alt={scene.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-zinc-600">
                                                <ImageIcon className="size-8" />
                                            </div>
                                        )}
                                        <span className="absolute top-1.5 left-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                                            {toTwoDigitOrder(scene.order)}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-zinc-100">{scene.name}</h3>
                                            <div className="flex gap-1">
                                                {scene.imagePrompt && <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">IP</span>}
                                                {scene.videoPrompt && <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-medium text-blue-400">VP</span>}
                                            </div>
                                        </div>
                                        {scene.description && (
                                            <p className="text-xs text-zinc-400 leading-relaxed">{scene.description}</p>
                                        )}
                                        {scene.imagePrompt && (
                                            <div className="rounded-lg bg-zinc-800/60 p-2.5">
                                                <p className="text-[10px] font-semibold text-amber-400 mb-1">IMAGE PROMPT</p>
                                                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{scene.imagePrompt}</p>
                                            </div>
                                        )}
                                        {scene.videoPrompt && (
                                            <div className="rounded-lg bg-zinc-800/60 p-2.5">
                                                <p className="text-[10px] font-semibold text-blue-400 mb-1">VIDEO PROMPT</p>
                                                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{scene.videoPrompt}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stats footer */}
                    {scenes.length > 0 && (
                        <div className="no-print flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-4">
                            <div className="flex gap-6 text-sm">
                                <span className="text-zinc-400">{scenes.length} scene total</span>
                                <span className="text-amber-400">{scenes.filter(s => s.promptStatus === 'sudah').length} prompt selesai</span>
                                <span className="text-emerald-400">{scenesWithImage} gambar selesai</span>
                            </div>
                            <Link href="/export-center" className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors">
                                Export <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
