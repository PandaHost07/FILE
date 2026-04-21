import type { LucideIcon } from 'lucide-react'
import { Lightbulb, Layers, Wand2 } from 'lucide-react'

/** Satu sumber untuk urutan workflow (href, label, step) — disederhanakan: Ide → Scene → Prompt. */
export const WORKFLOW_NAV: {
    href: string
    label: string
    shortLabel: string
    step: number
    icon: LucideIcon
}[] = [
    { href: '/idea-generator', label: 'Idea Generator', shortLabel: 'Ide', step: 1, icon: Lightbulb },
    { href: '/scene-builder', label: 'Scene Builder', shortLabel: 'Scene', step: 2, icon: Layers },
    { href: '/prompt-studio', label: 'Prompt Studio', shortLabel: 'Prompt', step: 3, icon: Wand2 },
]

export const WORKFLOW_STEP_COUNT = WORKFLOW_NAV.length

export function workflowStepFromPathname(pathname: string): number {
    const hit = WORKFLOW_NAV.find((s) => pathname === s.href || pathname.startsWith(s.href + '/'))
    return hit?.step ?? 0
}

/** Langkah berikutnya dalam urutan (untuk CTA tunggal). */
export function nextWorkflowStep(pathname: string): { href: string; label: string } | null {
    const current = workflowStepFromPathname(pathname)
    if (current <= 0 || current >= WORKFLOW_STEP_COUNT) return null
    const next = WORKFLOW_NAV.find((s) => s.step === current + 1)
    return next ? { href: next.href, label: next.label } : null
}
