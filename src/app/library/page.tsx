'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FolderOpen, AlertTriangle, X, Search, ArrowUpDown, Upload, Download as DownloadIcon } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { checkStorageSize } from '@/lib/storage'
import { ProjectCard } from '@/components/library/ProjectCard'
import { TemplateCard } from '@/components/library/TemplateCard'
import type { RestoreCategory, Project } from '@/types'

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
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="mx-auto max-w-5xl space-y-8">

                {storageInfo.isWarning && (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>Penyimpanan mendekati batas ({storageInfo.usedMB.toFixed(1)} MB).</span>
                    </div>
                )}

                {/* Create project */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-zinc-100">Buat Project Baru</h2>
                        <label className="flex items-center gap-1.5 cursor-pointer rounded-xl border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 transition-colors">
                            <Upload className="size-3.5" /> Import JSON
                            <input type="file" accept=".json" className="hidden" onChange={handleImportProject} />
                        </label>
                    </div>
                    <form onSubmit={handleCreateProject} className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-1">
                            <label className="text-xs text-zinc-500">Nama Project</label>
                            <input
                                type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                                placeholder="Contoh: Kursi Jati Antik"
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/60"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-500">Kategori</label>
                            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as RestoreCategory)}
                                className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500/60">
                                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <button type="submit" disabled={!newName.trim()}
                            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none transition-colors">
                            <Plus className="size-4" /> Buat Project
                        </button>
                    </form>
                </section>

                {/* Projects */}
                <section>
                    <div className="mb-4 flex items-center gap-3 flex-wrap">
                        <h2 className="text-base font-semibold text-zinc-100">Project Saya</h2>
                        <div className="h-px flex-1 bg-zinc-800 hidden sm:block" />
                        <span className="text-xs text-zinc-500">{filteredProjects.length}/{projects.length} project</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
                            <input
                                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari project..."
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 pl-8 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/60"
                            />
                        </div>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as RestoreCategory | 'semua')}
                            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500/60">
                            <option value="semua">Semua Kategori</option>
                            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <select
                            value={filterImages}
                            onChange={(e) => setFilterImages(e.target.value as 'semua' | 'ada' | 'belum')}
                            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500/60"
                        >
                            <option value="semua">Gambar: semua</option>
                            <option value="ada">Punya gambar scene</option>
                            <option value="belum">Belum ada gambar</option>
                        </select>
                        <button
                            onClick={() => setSortKey(sortKey === 'updatedAt' ? 'name' : sortKey === 'name' ? 'createdAt' : 'updatedAt')}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800 transition-colors">
                            <ArrowUpDown className="size-3.5" />
                            {sortKey === 'updatedAt' ? 'Terbaru diubah' : sortKey === 'name' ? 'Nama A-Z' : 'Terbaru dibuat'}
                        </button>
                    </div>

                    {filteredProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
                            <FolderOpen className="size-10 text-zinc-700" />
                            <div>
                                <p className="text-sm font-medium text-zinc-400">{projects.length === 0 ? 'Belum ada project' : 'Tidak ada yang cocok'}</p>
                                <p className="mt-1 text-xs text-zinc-600">{projects.length === 0 ? 'Buat project pertamamu di form di atas.' : 'Coba ubah filter atau pencarian.'}</p>
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
                            <h2 className="text-base font-semibold text-zinc-100">Template</h2>
                            <div className="h-px flex-1 bg-zinc-800" />
                            <span className="text-xs text-zinc-500">{templates.length} template</span>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-zinc-100">Gunakan Template</h3>
                            <button onClick={() => setTemplateModal(null)} className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300">
                                <X className="size-4" />
                            </button>
                        </div>
                        <p className="mb-4 text-xs text-zinc-500">Template: <span className="text-zinc-300">{templateModal.name}</span></p>
                        <form onSubmit={handleCreateFromTemplate} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-500">Nama Project Baru</label>
                                <input type="text" value={tmplProjectName} onChange={(e) => setTmplProjectName(e.target.value)}
                                    placeholder="Nama project"
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/60" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-500">Kategori</label>
                                <select value={tmplCategory} onChange={(e) => setTmplCategory(e.target.value as RestoreCategory)}
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500/60">
                                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button type="button" onClick={() => setTemplateModal(null)}
                                    className="flex-1 rounded-xl border border-zinc-700 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={!tmplProjectName.trim()}
                                    className="flex-1 rounded-xl bg-amber-500 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none transition-colors">
                                    Buat Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
