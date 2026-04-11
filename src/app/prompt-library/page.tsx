'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Copy, Check, ArrowRight, FileText, ImageIcon, Film } from 'lucide-react'
import { PROMPT_TEMPLATES, CATEGORIES, type TemplateCategory } from '@/lib/promptTemplates'
import useAppStore from '@/store/useAppStore'
import { cn, getProjectContentMode } from '@/lib/utils'

const categoryLabel: Record<string, string> = {
    semua: 'Semua',
    cabin: 'Kabin (build)',
    furniture: 'Furniture',
    kendaraan: 'Kendaraan',
    bangunan: 'Bangunan',
    elektronik: 'Elektronik',
    universal: 'Universal',
}

export default function PromptLibraryPage() {
    const router = useRouter()
    const { activeProjectId, activeSceneId, projects, updateScenePrompts } = useAppStore()
    const [activeCategory, setActiveCategory] = useState<TemplateCategory>('semua')
    const [search, setSearch] = useState('')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [appliedId, setAppliedId] = useState<string | null>(null)

    const filtered = PROMPT_TEMPLATES.filter((t) => {
        const matchCat = activeCategory === 'semua' || t.category === activeCategory
        const matchSearch = search === '' ||
            t.sceneName.toLowerCase().includes(search.toLowerCase()) ||
            t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())) ||
            t.subcategory.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    async function handleCopy(text: string, id: string) {
        await navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    function handleApplyToScene(template: typeof PROMPT_TEMPLATES[0]) {
        if (!activeProjectId || !activeSceneId) {
            router.push('/scene-builder')
            return
        }
        updateScenePrompts(activeProjectId, activeSceneId, template.imagePrompt, template.videoPrompt)
        setAppliedId(template.id)
        setTimeout(() => setAppliedId(null), 2000)
    }

    const activeProject = projects.find((p) => p.id === activeProjectId)
    const activeScene = activeProject && activeSceneId ? activeProject.scenes[activeSceneId] : null

    useEffect(() => {
        if (activeProject && getProjectContentMode(activeProject) === 'cabin_build') {
            setActiveCategory('cabin')
        }
    }, [activeProject?.id, activeProject?.contentMode])

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-6">

                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className="size-5 text-amber-400" />
                        <h1 className="text-2xl font-bold text-zinc-100">Prompt Library</h1>
                    </div>
                    <p className="text-zinc-400 text-sm">{PROMPT_TEMPLATES.length} template prompt restorasi siap pakai — pilih dan terapkan langsung ke scene aktif</p>
                </div>

                {/* Active scene info */}
                {activeScene ? (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
                        <div className="size-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-amber-300">Scene aktif: <span className="font-semibold">{activeScene.name}</span></span>
                        <span className="text-zinc-500">— Klik "Terapkan" untuk langsung pakai prompt ke scene ini</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
                        <span>Pilih scene di Scene Builder terlebih dahulu untuk bisa menerapkan template langsung.</span>
                        <button onClick={() => router.push('/scene-builder')} className="ml-auto flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors shrink-0">
                            Ke Scene Builder <ArrowRight className="size-3" />
                        </button>
                    </div>
                )}

                {/* Search + filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari template..."
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    'rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                                    activeCategory === cat
                                        ? 'bg-amber-500 text-zinc-950'
                                        : 'border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                                )}
                            >
                                {categoryLabel[cat]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                <p className="text-xs text-zinc-500">{filtered.length} template ditemukan</p>

                {/* Template grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((template) => (
                        <div key={template.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4 hover:border-zinc-700 transition-colors">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400 uppercase tracking-wide">
                                            {template.category}
                                        </span>
                                        <span className="text-xs text-zinc-500">{template.subcategory}</span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-zinc-100 mt-1.5">{template.sceneName}</h3>
                                </div>
                            </div>

                            {/* Image Prompt */}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                    <ImageIcon className="size-3 text-amber-400" />
                                    <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">Image Prompt</span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{template.imagePrompt}</p>
                                <button
                                    onClick={() => handleCopy(template.imagePrompt, `img-${template.id}`)}
                                    className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {copiedId === `img-${template.id}` ? <Check className="size-3 text-green-400" /> : <Copy className="size-3" />}
                                    {copiedId === `img-${template.id}` ? 'Tersalin!' : 'Copy image prompt'}
                                </button>
                            </div>

                            {/* Video Prompt */}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                    <Film className="size-3 text-blue-400" />
                                    <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">Video Prompt</span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{template.videoPrompt}</p>
                                <button
                                    onClick={() => handleCopy(template.videoPrompt, `vid-${template.id}`)}
                                    className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {copiedId === `vid-${template.id}` ? <Check className="size-3 text-green-400" /> : <Copy className="size-3" />}
                                    {copiedId === `vid-${template.id}` ? 'Tersalin!' : 'Copy video prompt'}
                                </button>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1">
                                {template.tags.map((tag) => (
                                    <span key={tag} className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            {/* Apply button */}
                            <button
                                onClick={() => handleApplyToScene(template)}
                                className={cn(
                                    'w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors',
                                    appliedId === template.id
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                )}
                            >
                                {appliedId === template.id ? (
                                    <><Check className="size-4" /> Diterapkan!</>
                                ) : (
                                    <><ArrowRight className="size-4" /> Terapkan ke Scene Aktif</>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16 text-zinc-500">
                        <FileText className="size-10 mx-auto mb-3 text-zinc-700" />
                        <p>Tidak ada template yang cocok dengan pencarian.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
