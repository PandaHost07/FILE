import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
    ApiUsageEntry,
    ApiUsageProvider,
    AppState,
    ApiKeys,
    ContentMode,
    Project,
    RestoreCategory,
    Scene,
    Template,
} from '@/types'

const defaultApiKeys = (): ApiKeys => ({
    gemini: '',
    imagen: '',
    openai: '',
    heygen: '',
    groq: '',
    fal: '',
    huggingface: '',
})

const defaultApiUsage = (): Record<ApiUsageProvider, ApiUsageEntry> => ({
    gemini: { requests: 0, lastAt: null },
    imagen: { requests: 0, lastAt: null },
    openai: { requests: 0, lastAt: null },
    heygen: { requests: 0, lastAt: null },
    fal: { requests: 0, lastAt: null },
    huggingface: { requests: 0, lastAt: null },
})

function generateId(): string {
    return crypto.randomUUID()
}

const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // ─── State ────────────────────────────────────────────────────────────
            projects: [],
            templates: [],
            activeProjectId: null,
            activeSceneId: null,
            apiKeys: defaultApiKeys(),
            apiUsage: defaultApiUsage(),

            // ─── Project Actions ──────────────────────────────────────────────────
            createProject: (name: string, category: RestoreCategory, contentMode: ContentMode = 'restoration'): string => {
                const id = generateId()
                const now = Date.now()
                const project: Project = {
                    id,
                    name,
                    category,
                    contentMode,
                    scenes: {},
                    sceneOrder: [],
                    createdAt: now,
                    updatedAt: now,
                }
                set((state) => ({
                    projects: [...state.projects, project],
                    activeProjectId: id,
                }))
                return id
            },

            updateProjectContentMode: (projectId: string, contentMode: ContentMode): void => {
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === projectId ? { ...p, contentMode, updatedAt: Date.now() } : p
                    ),
                }))
            },

            deleteProject: (id: string): void => {
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== id),
                    activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
                }))
            },

            duplicateProject: (projectId: string): string => {
                const p = get().projects.find((x) => x.id === projectId)
                if (!p) return ''
                const newProjectId = generateId()
                const now = Date.now()
                const scenes: Record<string, Scene> = {}
                const sceneOrder: string[] = []
                p.sceneOrder.forEach((oldId) => {
                    const s = p.scenes[oldId]
                    if (!s) return
                    const nid = generateId()
                    scenes[nid] = {
                        ...s,
                        id: nid,
                        imageData: null,
                        imageStatus: 'belum',
                    }
                    sceneOrder.push(nid)
                })
                const newProject: Project = {
                    id: newProjectId,
                    name: `${p.name} (salinan)`,
                    category: p.category,
                    contentMode: p.contentMode ?? 'restoration',
                    scenes,
                    sceneOrder,
                    createdAt: now,
                    updatedAt: now,
                }
                set((state) => ({
                    projects: [...state.projects, newProject],
                    activeProjectId: newProjectId,
                }))
                return newProjectId
            },

            setActiveProject: (id: string): void => {
                set({ activeProjectId: id })
            },

            // ─── Scene Actions ────────────────────────────────────────────────────
            setActiveScene: (id: string): void => {
                set({ activeSceneId: id })
            },

            addScene: (projectId: string, name: string, description: string): string => {
                const sceneId = generateId()
                set((state) => {
                    const projects = state.projects.map((p) => {
                        if (p.id !== projectId) return p
                        const order = p.sceneOrder.length + 1
                        const scene: Scene = {
                            id: sceneId,
                            name,
                            description,
                            order,
                            imagePrompt: '',
                            videoPrompt: '',
                            imageData: null,
                            promptStatus: 'belum',
                            imageStatus: 'belum',
                        }
                        return {
                            ...p,
                            scenes: { ...p.scenes, [sceneId]: scene },
                            sceneOrder: [...p.sceneOrder, sceneId],
                            updatedAt: Date.now(),
                        }
                    })
                    return { projects }
                })
                return sceneId
            },

            addScenesFromIdea: (projectId: string, sceneNames: string[]): void => {
                set((state) => {
                    const projects = state.projects.map((p) => {
                        if (p.id !== projectId) return p
                        const newScenes = { ...p.scenes }
                        const newOrder = [...p.sceneOrder]
                        sceneNames.forEach((name) => {
                            const sceneId = generateId()
                            const order = newOrder.length + 1
                            newScenes[sceneId] = {
                                id: sceneId,
                                name,
                                description: '',
                                order,
                                imagePrompt: '',
                                videoPrompt: '',
                                imageData: null,
                                promptStatus: 'belum',
                                imageStatus: 'belum',
                            }
                            newOrder.push(sceneId)
                        })
                        return { ...p, scenes: newScenes, sceneOrder: newOrder, updatedAt: Date.now() }
                    })
                    return { projects }
                })
            },

            deleteScene: (projectId: string, sceneId: string): void => {
                set((state) => {
                    const projects = state.projects.map((p) => {
                        if (p.id !== projectId) return p
                        const newScenes = { ...p.scenes }
                        delete newScenes[sceneId]
                        const newOrder = p.sceneOrder.filter((id) => id !== sceneId)
                        // Reorder remaining scenes starting from 1
                        newOrder.forEach((id, idx) => {
                            if (newScenes[id]) {
                                newScenes[id] = { ...newScenes[id], order: idx + 1 }
                            }
                        })
                        return { ...p, scenes: newScenes, sceneOrder: newOrder, updatedAt: Date.now() }
                    })
                    return { projects }
                })
            },

            updateScene: (projectId: string, sceneId: string, name: string, description: string): void => {
                set((state) => {
                    const projects = state.projects.map((p) => {
                        if (p.id !== projectId) return p
                        const scene = p.scenes[sceneId]
                        if (!scene) return p
                        return {
                            ...p,
                            scenes: { ...p.scenes, [sceneId]: { ...scene, name, description } },
                            updatedAt: Date.now(),
                        }
                    })
                    return { projects }
                })
            },

            duplicateScene: (projectId: string, sceneId: string): void => {
                set((state) => {
                    const projects = state.projects.map((p) => {
                        if (p.id !== projectId) return p
                        const scene = p.scenes[sceneId]
                        if (!scene) return p
                        const newId = generateId()
                        const newOrder = p.sceneOrder.length + 1
                        const newScene: Scene = {
                            ...scene,
                            id: newId,
                            name: scene.name + ' (copy)',
                            order: newOrder,
                            imageData: null,
                            imageStatus: 'belum' as const,
                        }
                        return {
                            ...p,
                            scenes: { ...p.scenes, [newId]: newScene },
                            sceneOrder: [...p.sceneOrder, newId],
                            updatedAt: Date.now(),
                        }
                    })
                    return { projects }
                })
            },

            reorderScenes: (projectId: string, newOrder: string[]): void => {
                set((state) => {
                    const projects = state.projects.map((p) => {
                        if (p.id !== projectId) return p
                        const newScenes = { ...p.scenes }
                        newOrder.forEach((id, idx) => {
                            if (newScenes[id]) {
                                newScenes[id] = { ...newScenes[id], order: idx + 1 }
                            }
                        })
                        return { ...p, scenes: newScenes, sceneOrder: newOrder, updatedAt: Date.now() }
                    })
                    return { projects }
                })
            },

            updateScenePrompts: (
                projectId: string,
                sceneId: string,
                imagePrompt: string,
                videoPrompt: string,
                audioPrompt?: string
            ): void => {
                set((state) => {
                    const projects = state.projects.map((p) => {
                        if (p.id !== projectId) return p
                        const scene = p.scenes[sceneId]
                        if (!scene) return p
                        return {
                            ...p,
                            scenes: {
                                ...p.scenes,
                                [sceneId]: { 
                                    ...scene, 
                                    imagePrompt, 
                                    videoPrompt, 
                                    ...(audioPrompt !== undefined ? { audioPrompt } : {}),
                                    promptStatus: 'sudah' as const 
                                },
                            },
                            updatedAt: Date.now(),
                        }
                    })
                    return { projects }
                })
            },

            updateSceneImage: (projectId: string, sceneId: string, imageData: string): void => {
                set((state) => {
                    const projects = state.projects.map((p) => {
                        if (p.id !== projectId) return p
                        const scene = p.scenes[sceneId]
                        if (!scene) return p
                        return {
                            ...p,
                            scenes: {
                                ...p.scenes,
                                [sceneId]: { ...scene, imageData, imageStatus: 'sudah' as const },
                            },
                            updatedAt: Date.now(),
                        }
                    })
                    return { projects }
                })
            },

            // ─── Template Actions ─────────────────────────────────────────────────
            saveAsTemplate: (projectId: string, templateName: string): void => {
                const state = get()
                const project = state.projects.find((p) => p.id === projectId)
                if (!project) return
                const templateId = generateId()
                const templateScenes = project.sceneOrder.map((sceneId, idx) => {
                    const scene = project.scenes[sceneId]
                    return {
                        id: scene.id,
                        name: scene.name,
                        description: scene.description,
                        order: idx + 1,
                    }
                })
                const template: Template = {
                    id: templateId,
                    name: templateName,
                    scenes: templateScenes,
                    createdAt: Date.now(),
                }
                set((state) => ({ templates: [...state.templates, template] }))
            },

            createFromTemplate: (
                templateId: string,
                projectName: string,
                category: RestoreCategory,
                contentMode: ContentMode = 'restoration'
            ): string => {
                const state = get()
                const template = state.templates.find((t) => t.id === templateId)
                if (!template) return ''
                const projectId = generateId()
                const now = Date.now()
                const scenes: Record<string, Scene> = {}
                const sceneOrder: string[] = []
                template.scenes.forEach((ts, idx) => {
                    const sceneId = generateId()
                    scenes[sceneId] = {
                        id: sceneId,
                        name: ts.name,
                        description: ts.description,
                        order: idx + 1,
                        imagePrompt: '',
                        videoPrompt: '',
                        imageData: null,
                        promptStatus: 'belum',
                        imageStatus: 'belum',
                    }
                    sceneOrder.push(sceneId)
                })
                const project: Project = {
                    id: projectId,
                    name: projectName,
                    category,
                    contentMode,
                    scenes,
                    sceneOrder,
                    createdAt: now,
                    updatedAt: now,
                }
                set((state) => ({
                    projects: [...state.projects, project],
                    activeProjectId: projectId,
                }))
                return projectId
            },

            deleteTemplate: (id: string): void => {
                set((state) => ({
                    templates: state.templates.filter((t) => t.id !== id),
                }))
            },

            // ─── API Key Actions ──────────────────────────────────────────────────
            setApiKeys: (keys: Partial<ApiKeys>): void => {
                set((state) => ({
                    apiKeys: { ...state.apiKeys, ...keys },
                }))
            },

            clearApiKeys: (): void => {
                set({ apiKeys: defaultApiKeys() })
            },

            recordApiUsage: (provider: ApiUsageProvider): void => {
                set((state) => {
                    const apiUsage = state.apiUsage ?? defaultApiUsage()
                    const cur = apiUsage[provider] ?? { requests: 0, lastAt: null }
                    return {
                        apiUsage: {
                            ...apiUsage,
                            [provider]: { requests: cur.requests + 1, lastAt: Date.now() },
                        },
                    }
                })
            },

            resetApiUsage: (): void => {
                set({ apiUsage: defaultApiUsage() })
            },
        }),
        {
            name: 'rpg-store',
            // Exclude activeSceneId and imageData from persistence
            // imageData is stored separately in IndexedDB via imageStorage.ts
            partialize: (state) => ({
                projects: state.projects.map((p) => ({
                    ...p,
                    scenes: Object.fromEntries(
                        Object.entries(p.scenes).map(([id, scene]) => [
                            id,
                            { ...scene, imageData: null }, // strip imageData from localStorage
                        ])
                    ),
                })),
                templates: state.templates,
                activeProjectId: state.activeProjectId,
                apiKeys: state.apiKeys,
                apiUsage: state.apiUsage ?? defaultApiUsage(),
            }),
            merge: (persisted, current) => {
                const p = (persisted ?? {}) as Partial<AppState>
                return {
                    ...current,
                    ...p,
                    apiKeys: { ...defaultApiKeys(), ...p.apiKeys },
                    apiUsage: { ...defaultApiUsage(), ...p.apiUsage },
                }
            },
        }
    )
)

export default useAppStore
