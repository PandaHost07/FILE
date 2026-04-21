import type { ApiKeys } from '@/types'

const DB_NAME = 'restoregen-v1'
const DB_VERSION = 1
const STORE = 'settings'
const KEY_API_KEYS = 'apiKeys'

function emptyKeys(): ApiKeys {
    return {
        gemini: '',
        imagen: '',
        openai: '',
        heygen: '',
        groq: '',
        fal: '',
        huggingface: '',
    }
}

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION)
        req.onerror = () => reject(req.error ?? new Error('IDB open failed'))
        req.onsuccess = () => resolve(req.result)
        req.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE)
            }
        }
    })
}

function parseKeys(raw: unknown): ApiKeys | null {
    if (!raw || typeof raw !== 'string') return null
    try {
        const o = JSON.parse(raw) as Partial<ApiKeys>
        const base = emptyKeys()
        for (const k of Object.keys(base) as (keyof ApiKeys)[]) {
            if (typeof o[k] === 'string') base[k] = o[k]
        }
        return base
    } catch {
        return null
    }
}

function keysMeaningful(keys: ApiKeys): boolean {
    return Object.values(keys).some((v) => typeof v === 'string' && v.trim() !== '')
}

/** Gabungkan: isi kolom kosong dari backup tanpa menimpa yang sudah ada di perangkat. */
export function mergeApiKeysPreferCurrent(current: ApiKeys, backup: ApiKeys): ApiKeys {
    const out: ApiKeys = { ...current }
    for (const k of Object.keys(backup) as (keyof ApiKeys)[]) {
        const cur = String(out[k] ?? '').trim()
        const bak = String(backup[k] ?? '').trim()
        if (!cur && bak) out[k] = backup[k]
    }
    return out
}

export async function loadApiKeysFromIDB(): Promise<ApiKeys | null> {
    if (typeof indexedDB === 'undefined') return null
    try {
        const db = await openDb()
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly')
            const req = tx.objectStore(STORE).get(KEY_API_KEYS)
            req.onsuccess = () => {
                db.close()
                const parsed = parseKeys(req.result)
                resolve(parsed && keysMeaningful(parsed) ? parsed : null)
            }
            req.onerror = () => {
                db.close()
                reject(req.error)
            }
        })
    } catch {
        return null
    }
}

export async function saveApiKeysToIDB(keys: ApiKeys): Promise<void> {
    if (typeof indexedDB === 'undefined') return
    try {
        const db = await openDb()
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite')
            tx.objectStore(STORE).put(JSON.stringify(keys), KEY_API_KEYS)
            tx.oncomplete = () => {
                db.close()
                resolve()
            }
            tx.onerror = () => {
                db.close()
                reject(tx.error)
            }
        })
    } catch {
        /* iOS mode rahasia / quota — abaikan */
    }
}

export async function clearApiKeysIDB(): Promise<void> {
    if (typeof indexedDB === 'undefined') return
    try {
        const db = await openDb()
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite')
            tx.objectStore(STORE).delete(KEY_API_KEYS)
            tx.oncomplete = () => {
                db.close()
                resolve()
            }
            tx.onerror = () => {
                db.close()
                reject(tx.error)
            }
        })
    } catch {
        /* abaikan */
    }
}
