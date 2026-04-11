import useAppStore from '@/store/useAppStore'
import type { ApiUsageProvider } from '@/types'

/** Catat 1 permintaan API yang sukses (hitungan lokal; bukan token resmi dari Google/OpenAI/dll). */
export function recordApiUsage(provider: ApiUsageProvider): void {
    if (typeof window === 'undefined') return
    try {
        useAppStore.getState().recordApiUsage(provider)
    } catch {
        /* ignore */
    }
}
