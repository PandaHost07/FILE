import type { Project } from '@/types'
import { getProjectContentMode } from '@/lib/utils'

/** Negative prompt untuk Stability: kurangi gaya lompat & identitas berubah. */
export const STABILITY_NEGATIVE_PROMPT =
    'blurry, low quality, watermark, text, logo, signature, deformed, disfigured, extra limbs, bad anatomy, bad hands, mutated hands, inconsistent object, different object, swapped subject, duplicate person, cartoon, anime, cgi render, plastic skin, oversharpened hdr glow, fisheye distortion, wrong proportions'

/**
 * Seed tetap per project → gambar antar scene lebih stabil secara gaya (Stability AI).
 * Sama projectId selalu menghasilkan bilangan seed yang sama.
 */
export function stabilitySeedForProject(projectId: string): number {
    let h = 0
    for (let i = 0; i < projectId.length; i++) {
        h = (Math.imul(31, h) + projectId.charCodeAt(i)) | 0
    }
    const n = Math.abs(h) % 2147483646
    return n + 1
}

/** Teks yang dikirim ke Gemini agar mengunci subjek & lingkungan antar scene. */
export function buildVisualConsistencyLock(project: Project): string {
    const mode = getProjectContentMode(project)
    const name = project.name.trim() || 'this project'
    if (mode === 'cabin_build') {
        return `SERIES LOCK "${name}": One continuous outdoor cabin build documentary. Keep THE SAME forest clearing, gravel pad, tree line silhouette, cabin footprint position, and primary lumber color/species. Same tripod-style camera height and focal length family. Only the construction stage advances—do not redesign the cabin or relocate the site.`
    }
    return `SERIES LOCK "${name}" (${project.category}): One continuous restoration. Keep THE SAME hero object—identical overall shape, size, wood grain family, metal parts, and damage map locations; only the honest next restoration step changes. Keep THE SAME workshop: same wall, tools layout, bench, window light direction. If hands appear: same anonymous adult hands, no face focus, same skin tone and clothing sleeves—never a different person. Never swap the object for another item.`
}
