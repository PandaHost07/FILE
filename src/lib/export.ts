import type { Scene, Project } from '@/types'
import { toSceneSlug, slugify } from '@/lib/utils'

export function estimateZipSize(scenes: Scene[]): number {
    return scenes.reduce((total, scene) => {
        if (!scene.imageData) return total
        const base64 = scene.imageData.includes(',') ? scene.imageData.split(',')[1] : scene.imageData
        return total + Math.floor(base64.length * 0.75)
    }, 0)
}

export async function downloadImagesAsZip(project: Project, scenes: Scene[]): Promise<void> {
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    for (const scene of scenes) {
        if (!scene.imageData) continue
        const base64 = scene.imageData.includes(',') ? scene.imageData.split(',')[1] : scene.imageData
        zip.file(`${toSceneSlug(scene)}.png`, base64, { base64: true })
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const dateStr = new Date().toISOString().slice(0, 10)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slugify(project.name)}_${dateStr}.zip`
    a.click()
    URL.revokeObjectURL(url)
}

export async function downloadPromptsAsTxt(project: Project, scenes: Scene[]): Promise<void> {
    const lines: string[] = []
    for (const scene of scenes) {
        const order = String(scene.order).padStart(2, '0')
        lines.push(`=== Scene ${order}: ${scene.name} ===`)
        lines.push('[IMAGE PROMPT]')
        lines.push(scene.imagePrompt || '(belum ada)')
        lines.push('')
        lines.push('[VIDEO PROMPT]')
        lines.push(scene.videoPrompt || '(belum ada)')
        lines.push('')
        lines.push('')
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const dateStr = new Date().toISOString().slice(0, 10)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slugify(project.name)}_prompts_${dateStr}.txt`
    a.click()
    URL.revokeObjectURL(url)
}
