/** Satu adegan dalam alur Filmmaker — prompt visual untuk key frame (generate foto nanti). */
export type FilmmakerSceneItem = {
    id: string
    title: string
    /** Prompt bahasa Indonesia untuk still / key visual adegan ini. */
    imagePrompt: string
}

const BEATS = ['Pembuka', 'Pengenalan', 'Konflik', 'Eskalasi', 'Klimaks', 'Resolusi', 'Penutup'] as const

function newId(prefix: string, i: number): string {
    return `${prefix}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Fallback tanpa API: pecah ide menjadi N adegan dengan prompt visual seragam.
 */
export function buildLocalFilmmakerScenes(idea: string, sceneCount: number): FilmmakerSceneItem[] {
    const ideaTrim = idea.trim() || 'proyek film'
    const n = Math.min(20, Math.max(1, Math.floor(sceneCount)))
    return Array.from({ length: n }, (_, i) => {
        const title =
            n <= BEATS.length
                ? `${BEATS[i]} (${i + 1}/${n})`
                : `Adegan ${i + 1} (${i + 1}/${n})`
        return {
            id: newId('local', i),
            title,
            imagePrompt:
                `Key visual sinematik adegan ${i + 1}: narasi "${ideaTrim}". ` +
                `Komposisi film, pencahayaan natural dramatis, kedalaman bidang, fotorealistik, suasana konsisten antar shot, ` +
                `tanpa teks/Watermark di layar, gaya movie still.`,
        }
    })
}
