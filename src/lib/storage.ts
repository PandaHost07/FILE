const WARNING_THRESHOLD_BYTES = 4 * 1024 * 1024 // 4 MB

export interface StorageSizeInfo {
    usedBytes: number
    usedMB: number
    isWarning: boolean
}

/**
 * Calculate total localStorage usage and return size info.
 * isWarning is true when usage exceeds 4 MB.
 */
export function checkStorageSize(): StorageSizeInfo {
    if (typeof window === 'undefined') {
        return { usedBytes: 0, usedMB: 0, isWarning: false }
    }
    let usedBytes = 0
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
            const value = localStorage.getItem(key) ?? ''
            // Each character in localStorage is stored as UTF-16 (2 bytes)
            usedBytes += (key.length + value.length) * 2
        }
    }
    return {
        usedBytes,
        usedMB: usedBytes / (1024 * 1024),
        isWarning: usedBytes > WARNING_THRESHOLD_BYTES,
    }
}

/**
 * Retrieve and parse a JSON item from localStorage.
 * Returns null if the key doesn't exist or parsing fails.
 */
export function getStorageItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem(key)
        if (raw === null) return null
        return JSON.parse(raw) as T
    } catch {
        return null
    }
}

/**
 * Serialize and store a value in localStorage.
 * Returns false if the storage is full (QuotaExceededError).
 */
export function setStorageItem(key: string, value: unknown): boolean {
    if (typeof window === 'undefined') return false
    try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
    } catch (err) {
        if (err instanceof DOMException && err.name === 'QuotaExceededError') {
            return false
        }
        return false
    }
}
