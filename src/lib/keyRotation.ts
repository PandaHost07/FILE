/**
 * Key rotation utility.
 * Keys are stored as comma-separated strings: "key1,key2,key3"
 * System rotates to next key when current one hits quota/rate limit.
 */

const ROTATION_STORAGE_KEY = 'rpg-key-rotation-index'

function getRotationIndex(provider: string): number {
    try {
        const stored = localStorage.getItem(`${ROTATION_STORAGE_KEY}-${provider}`)
        return stored ? parseInt(stored, 10) : 0
    } catch {
        return 0
    }
}

function setRotationIndex(provider: string, index: number) {
    try {
        localStorage.setItem(`${ROTATION_STORAGE_KEY}-${provider}`, String(index))
    } catch { /* ignore */ }
}

export function parseKeys(keysString: string): string[] {
    return keysString
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0)
}

export function getNextKey(provider: string, keysString: string): string | null {
    const keys = parseKeys(keysString)
    if (keys.length === 0) return null
    const idx = getRotationIndex(provider) % keys.length
    return keys[idx]
}

export function rotateToNextKey(provider: string, keysString: string): string | null {
    const keys = parseKeys(keysString)
    if (keys.length === 0) return null
    const currentIdx = getRotationIndex(provider)
    const nextIdx = (currentIdx + 1) % keys.length
    setRotationIndex(provider, nextIdx)
    return keys[nextIdx]
}

export function resetRotation(provider: string) {
    try {
        localStorage.removeItem(`${ROTATION_STORAGE_KEY}-${provider}`)
    } catch { /* ignore */ }
}

export function getKeyCount(keysString: string): number {
    return parseKeys(keysString).length
}
