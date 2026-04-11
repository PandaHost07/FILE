// Restoration Content Prompt Generator — TypeScript Types

export type RestoreCategory = 'furniture' | 'bangunan' | 'kendaraan' | 'elektronik' | 'lainnya'

/** Fokus prompt AI: pembangunan kabin (timelapse outdoor) vs restorasi objek (workshop). */
export type ContentMode = 'cabin_build' | 'restoration'

export type PromptStatus = 'belum' | 'sudah'

export interface Scene {
  id: string
  name: string
  description: string
  order: number // 1-based integer
  imagePrompt: string
  videoPrompt: string
  imageData: string | null // base64 PNG
  promptStatus: PromptStatus
  imageStatus: PromptStatus
}

export interface Project {
  id: string
  name: string
  category: RestoreCategory
  /** Default restoration untuk data lama tanpa field ini */
  contentMode?: ContentMode
  scenes: Record<string, Scene> // keyed by scene ID
  sceneOrder: string[] // ordered array of scene IDs
  createdAt: number // Unix timestamp ms
  updatedAt: number // Unix timestamp ms
}

export interface Template {
  id: string
  name: string
  scenes: Omit<Scene, 'imageData' | 'imagePrompt' | 'videoPrompt' | 'promptStatus' | 'imageStatus'>[]
  createdAt: number // Unix timestamp ms
}

export interface IdeaInput {
  objectType: string
  initialCondition: string
  visualStyle: string
}

export interface IdeaResult {
  title: string
  description: string
  suggestedScenes: string[]
}

export interface SceneContext {
  sceneName: string
  sceneDescription: string
  category: RestoreCategory
  contentMode: ContentMode
  visualStyle: string
  projectName: string
  /** Urutan scene dalam project (1-based), untuk konsistensi seri */
  sceneOrder: number
  totalScenes: number
  /** Instruksi kunci identitas subjek & lokasi antar scene */
  visualConsistencyLock: string
}

export interface ApiKeys {
  /** Bisa berisi beberapa key dipisah koma: "key1,key2,key3" */
  gemini: string
  /** Stability AI — generate gambar */
  imagen: string
  /** Bisa berisi beberapa key dipisah koma: "key1,key2,key3" */
  openai: string
  /** HeyGen / video API (opsional; slot untuk integrasi) */
  heygen: string
}

export type ApiUsageProvider = 'gemini' | 'imagen' | 'openai' | 'heygen'

export interface ApiUsageEntry {
  /** Jumlah permintaan sukses ke provider ini dari app ini */
  requests: number
  lastAt: number | null
}

// Zustand store interface
export interface AppState {
  // State
  projects: Project[]
  templates: Template[]
  activeProjectId: string | null
  activeSceneId: string | null
  apiKeys: ApiKeys
  /** Statistik pemakaian per provider (lokal, bukan token resmi dari dashboard vendor) */
  apiUsage: Record<ApiUsageProvider, ApiUsageEntry>

  // Project actions
  createProject: (name: string, category: RestoreCategory, contentMode?: ContentMode) => string
  updateProjectContentMode: (projectId: string, contentMode: ContentMode) => void
  deleteProject: (id: string) => void
  /** Salin project + scene (tanpa gambar IndexedDB); aktifkan project baru. */
  duplicateProject: (projectId: string) => string
  setActiveProject: (id: string) => void

  // Scene actions
  setActiveScene: (id: string) => void
  addScene: (projectId: string, name: string, description: string) => string
  addScenesFromIdea: (projectId: string, sceneNames: string[]) => void
  deleteScene: (projectId: string, sceneId: string) => void
  duplicateScene: (projectId: string, sceneId: string) => void
  updateScene: (projectId: string, sceneId: string, name: string, description: string) => void
  reorderScenes: (projectId: string, newOrder: string[]) => void
  updateScenePrompts: (projectId: string, sceneId: string, imagePrompt: string, videoPrompt: string) => void
  updateSceneImage: (projectId: string, sceneId: string, imageData: string) => void

  // Template actions
  saveAsTemplate: (projectId: string, templateName: string) => void
  createFromTemplate: (
    templateId: string,
    projectName: string,
    category: RestoreCategory,
    contentMode?: ContentMode
  ) => string
  deleteTemplate: (id: string) => void

  // API key actions
  setApiKeys: (keys: Partial<ApiKeys>) => void
  clearApiKeys: () => void
  recordApiUsage: (provider: ApiUsageProvider) => void
  resetApiUsage: () => void
}
