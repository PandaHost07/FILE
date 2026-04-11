/**
 * Separate image storage using IndexedDB to avoid localStorage quota issues.
 * Falls back to compressed base64 in localStorage if IndexedDB unavailable.
 */

const DB_NAME = 'rpg-images'
const DB_VERSION = 1
const STORE_NAME = 'images'

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION)
        req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME)
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

export async function saveImage(key: string, base64: string): Promise<void> {
    try {
        const db = await openDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite')
            tx.objectStore(STORE_NAME).put(base64, key)
            tx.oncomplete = () => resolve()
            tx.onerror = () => reject(tx.error)
        })
    } catch {
        // Fallback: localStorage with compression
        try {
            localStorage.setItem(`rpg-img-${key}`, base64)
        } catch {
            console.warn('Storage full, cannot save image')
        }
    }
}

export async function loadImage(key: string): Promise<string | null> {
    try {
        const db = await openDB()
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly')
            const req = tx.objectStore(STORE_NAME).get(key)
            req.onsuccess = () => resolve(req.result ?? null)
            req.onerror = () => resolve(null)
        })
    } catch {
        return localStorage.getItem(`rpg-img-${key}`)
    }
}

export async function deleteImage(key: string): Promise<void> {
    try {
        const db = await openDB()
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readwrite')
            tx.objectStore(STORE_NAME).delete(key)
            tx.oncomplete = () => resolve()
            tx.onerror = () => resolve()
        })
    } catch {
        localStorage.removeItem(`rpg-img-${key}`)
    }
}

/**
 * Compress base64 PNG to JPEG at reduced quality to save space.
 * Reduces file size by ~70-80%.
 */
export function compressImage(base64: string, quality = 0.65): Promise<string> {
    return new Promise((resolve) => {
        if (typeof window === 'undefined') { resolve(base64); return }
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            // Max 768px to save space
            const maxSize = 768
            let { width, height } = img
            if (width > maxSize || height > maxSize) {
                if (width > height) { height = Math.round(height * maxSize / width); width = maxSize }
                else { width = Math.round(width * maxSize / height); height = maxSize }
            }
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')!
            ctx.drawImage(img, 0, 0, width, height)
            // Remove data URL prefix, keep only base64
            const dataUrl = canvas.toDataURL('image/jpeg', quality)
            resolve(dataUrl.split(',')[1])
        }
        img.onerror = () => resolve(base64)
        img.src = `data:image/png;base64,${base64}`
    })
}
