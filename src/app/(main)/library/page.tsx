'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FolderOpen, AlertTriangle, X, Search, ArrowUpDown, Upload, Download as DownloadIcon } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { checkStorageSize } from '@/lib/storage'
import { ProjectCard } from '@/components/library/ProjectCard'
import { TemplateCard } from '@/components/library/TemplateCard'
import type { RestoreCategory, Project } from '@/types'
import { cardBodyPad, cardHeaderBar, cardSurface, inputField, pageGradient, shellBg } from '@/lib/uiTokens'
import { cn } from '@/lib/utils'

const CATEGORIES: { value: RestoreCategory; label: string }[] = [
    { value: 'furniture', label: 'Furniture' },
    { value: 'bangunan', label: 'Bangunan' },
    { value: 'kendaraan', label: 'Kendaraan' },
    { value: 'elektronik', label: 'Elektronik' },
    { value: 'lainnya', label: 'Lainnya' },
]

type SortKey = 'updatedAt' | 'createdAt' | 'name'

export default function LibraryPage() {
    const router = useRouter()
    const {
        projects, templates, activeProjectId,
        createProject, deleteProject, setActiveProject, duplicateProject,
        createFromTemplate, deleteTemplate,
    } = useAppStore()

    const [newName, setNewName] = useState('')
    const [newCategory, setNewCategory] = useState<RestoreCategory>('furniture')
    const [templateModal, setTemplateModal] = useState<{ id: string; name: string } | null>(null)
    const [tmplProjectName, setTmplProjectName] = useState('')
    const [tmplCategory, setTmplCategory] = useState<RestoreCategory>('furniture')
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
    const [filterCategory, setFilterCategory] = useState<RestoreCategory | 'semua'>('semua')
    const [filterImages, setFilterImages] = useState<'semua' | 'ada' | 'belum'>('semua')

    const storageInfo = checkStorageSize()

    function projectHasSceneImage(p: Project) {
        return p.sceneOrder.some((id) => !!p.scenes[id]?.imageData)
    }

    const filteredProjects = useMemo(() => {
        let list = [...projects]
        if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        if (filterCategory !== 'semua') list = list.filter((p) => p.category === filterCategory)
        if (filterImages === 'ada') list = list.filter((p) => projectHasSceneImage(p))
        if (filterImages === 'belum') list = list.filter((p) => !projectHasSceneImage(p))
        list.sort((a, b) => {
            if (sortKey === 'name') return a.name.localeCompare(b.name)
            return b[sortKey] - a[sortKey]
        })
        return list
    }, [projects, search, sortKey, filterCategory, filterImages])

    function handleCreateProject(e: React.FormEvent) {
        e.preventDefault()
        const trimmed = newName.trim()
        if (!trimmed) return
        createProject(trimmed, newCategory)
        setNewName('')
        setNewCategory('furniture')
        router.push('/scene-builder')
    }

    function handleOpenProject(id: string) {
        setActiveProject(id)
        router.push('/scene-builder')
    }

    function handleUseTemplate(templateId: string, templateName: string) {
        setTmplProjectName(templateName + ' (copy)')
        setTmplCategory('furniture')
        setTemplateModal({ id: templateId, name: templateName })
    }

    function handleCreateFromTemplate(e: React.FormEvent) {
        e.preventDefault()
        if (!templateModal) return
        const trimmed = tmplProjectName.trim()
        if (!trimmed) return
        createFromTemplate(templateModal.id, trimmed, tmplCategory)
        setTemplateModal(null)
        router.push('/scene-builder')
    }

    function handleExportProject(project: Project) {
        const data = JSON.stringify(project, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project.name.replace(/\s+/g, '-')}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    function handleImportProject(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string) as Project
                const storeProjects = useAppStore.getState().projects
                const exists = storeProjects.find((p) => p.id === data.id)
                if (!exists) {
                    useAppStore.setState((state) => ({
                        projects: [...state.projects, { ...data, updatedAt: Date.now() }],
                    }))
                }
            } catch {
                alert('File tidak valid')
            }
        }
        reader.readAsText(file)
        e.target.value = ''
    }

    return (
        <div className={cn('relative min-h-full', shellBg)}>
            <div className={pageGradient.emerald} aria-hidden />
            <div className="relative z-10 mx-auto w-full min-w-0 max-w-7xl space-y-8 px-5 py-8 sm:px-8 lg:px-10">
                <header className="border-b border-[#1a1a1a] pb-6">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500/90">RestoreGen</p>
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Library</h1>
                    <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-zinc-500">
                        Kelola project dan template. Data tersimpan lokal di browser Anda.
                    </p>
                </header>

                {storageInfo.isWarning && (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-[13px] text-amber-200/95">
                        <AlertTriangle className="size-4 shrink-0 text-amber-400" />
                        <span>Penyimpanan mendekati batas ({storageInfo.usedMB.toFixed(1)} MB).</span>
                    </div>
                )}

                {/* Create project */}
                <section className={cardSurface}>
                    <div className={cn(cardHeaderBar, 'flex flex-wrap items-center justify-between gap-3')}>
                        <h2 className="text-sm font-bold text-zinc-100">Buat project baru</h2>
                        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-[11px] font-semibold text-teal-300 transition hover:bg-teal-500/20">
                            <Upload className="size-3.5" /> Import JSON
                            <input type="file" accept=".json" className="hidden" onChange={handleImportProject} />
                        </label>
                    </div>
                    <form onSubmit={handleCreateProject} className={cn(cardBodyPad, 'flex flex-col gap-3 sm:flex-row sm:items-end')}>
                        <div className="min-w-0 flex-1 space-y-1">
                            <label className="text-[11px] text-zinc-500">Nama project</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Contoh: Kursi Jati Antik"
                                className={inputField('emerald')}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] text-zinc-500">Kategori</label>
                            <select
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value as RestoreCategory)}
                                className={inputField('emerald')}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={!newName.trim()}
                            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-[#052e16] shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:pointer-events-none disabled:opacity-40"
                        >
                            <Plus className="size-4" /> Buat project
                        </button>
                    </form>
                </section>

                {/* Projects */}
                <section>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-400">Project saya</h2>
                        <div className="hidden h-px flex-1 bg-[#1a1a1a] sm:block" />
                        <span className="rounded-md border border-[#2a2a2e] bg-[#0d0d10] px-2 py-0.5 text-[11px] font-medium tabular-nums text-zinc-400">
                            {filteredProjects.length}/{projects.length}
                        </span>
                    </div>

                    <div className={cn(cardSurface, 'mb-4')}>
                        <div className={cn(cardBodyPad, 'flex flex-col gap-2 sm:flex-row sm:flex-wrap')}>
                            <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari project..."
                                    className={cn(inputField('emerald'), 'pl-9')}
                                />
                            </div>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value as RestoreCategory | 'semua')}
                                className={cn(inputField('emerald'), 'sm:w-44')}
                            >
                                <option value="semua">Semua kategori</option>
                                {CATEGORIES.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filterImages}
                                onChange={(e) => setFilterImages(e.target.value as 'semua' | 'ada' | 'belum')}
                                className={cn(inputField('emerald'), 'sm:w-48')}
                            >
                                <option value="semua">Gambar: semua</option>
                                <option value="ada">Punya gambar scene</option>
                                <option value="belum">Belum ada gambar</option>
                            </select>
                            <button
                                type="button"
                                onClick={() =>
                                    setSortKey(sortKey === 'updatedAt' ? 'name' : sortKey === 'name' ? 'createdAt' : 'updatedAt')
                                }
                                className="flex items-center gap-1.5 rounded-xl border border-[#2a2a2e] bg-[#0d0d10] px-3 py-2.5 text-[11px] font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200"
                            >
                                <ArrowUpDown className="size-3.5" />
                                {sortKey === 'updatedAt' ? 'Terbaru diubah' : sortKey === 'name' ? 'Nama A-Z' : 'Terbaru dibuat'}
                            </button>
                        </div>
                    </div>

                    {filteredProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#2a2a2e] bg-[#0c0c0e] py-16 text-center">
                            <FolderOpen className="size-10 text-zinc-600" />
                            <div>
                                <p className="text-sm font-medium text-zinc-400">
                                    {projects.length === 0 ? 'Belum ada project' : 'Tidak ada yang cocok'}
                                </p>
                                <p className="mt-1 text-xs text-zinc-600">
                                    {projects.length === 0 ? 'Buat project pertamamu di form di atas.' : 'Coba ubah filter atau pencarian.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredProjects.map((project) => (
                                <div key={project.id} className="relative group">
                                    <ProjectCard
                                        project={project}
                                        isActive={project.id === activeProjectId}
                                        onOpen={() => handleOpenProject(project.id)}
                                        onDelete={() => deleteProject(project.id)}
                                        onDuplicate={() => {
                                            duplicateProject(project.id)
                                            router.push('/scene-builder')
                                        }}
                                    />
                                    <button
                                        onClick={() => handleExportProject(project)}
                                        className="absolute top-3 right-10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                                        title="Export project sebagai JSON"
                                    >
                                        <DownloadIcon className="size-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Templates */}
                {templates.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center gap-3">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-400">Template</h2>
                            <div className="h-px flex-1 bg-[#1a1a1a]" />
                            <span className="text-[11px] text-zinc-500">{templates.length} template</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {templates.map((template) => (
                                <TemplateCard key={template.id} template={template}
                                    onUse={() => handleUseTemplate(template.id, template.name)}
                                    onDelete={() => deleteTemplate(template.id)} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Template modal */}
            {templateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className={cn(cardSurface, 'w-full max-w-sm')}>
                        <div className={cn(cardHeaderBar, 'flex items-center justify-between')}>
                            <h3 className="text-sm font-bold text-zinc-100">Gunakan template</h3>
                            <button
                                type="button"
                                onClick={() => setTemplateModal(null)}
                                className="rounded-md p-1 text-zinc-500 hover:bg-[#1a1a1e] hover:text-zinc-300"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <div className={cardBodyPad}>
                            <p className="mb-4 text-[12px] text-zinc-500">
                                Template: <span className="text-zinc-300">{templateModal.name}</span>
                            </p>
                            <form onSubmit={handleCreateFromTemplate} className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] text-zinc-500">Nama project baru</label>
                                    <input
                                        type="text"
                                        value={tmplProjectName}
                                        onChange={(e) => setTmplProjectName(e.target.value)}
                                        placeholder="Nama project"
                                        className={inputField('emerald')}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] text-zinc-500">Kategori</label>
                                    <select
                                        value={tmplCategory}
                                        onChange={(e) => setTmplCategory(e.target.value as RestoreCategory)}
                                        className={inputField('emerald')}
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setTemplateModal(null)}
                                        className="flex-1 rounded-xl border border-[#2a2a2e] py-2.5 text-sm text-zinc-300 transition hover:bg-[#1a1a1e]"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!tmplProjectName.trim()}
                                        className="flex-1 rounded-xl bg-teal-500 py-2.5 text-sm font-bold text-[#042f2e] shadow-md shadow-teal-500/15 transition hover:bg-teal-400 disabled:pointer-events-none disabled:opacity-40"
                                    >
                                        Buat project
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
