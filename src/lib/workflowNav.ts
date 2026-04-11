import type { LucideIcon } from 'lucide-react'
import { Lightbulb, Layers, Wand2, Film, Download } from 'lucide-react'

/** Satu sumber untuk urutan workflow (href, label, step). */
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
    { href: '/timeline-view', label: 'Timeline', shortLabel: 'Timeline', step: 4, icon: Film },
    { href: '/export-center', label: 'Export', shortLabel: 'Export', step: 5, icon: Download },
]

export function workflowStepFromPathname(pathname: string): number {
    const hit = WORKFLOW_NAV.find((s) => pathname.startsWith(s.href))
    return hit?.step ?? 0
}

/** Langkah berikutnya dalam urutan (untuk CTA tunggal). */
export function nextWorkflowStep(pathname: string): { href: string; label: string } | null {
    const current = workflowStepFromPathname(pathname)
    if (current <= 0 || current >= 5) return null
    const next = WORKFLOW_NAV.find((s) => s.step === current + 1)
    return next ? { href: next.href, label: next.label } : null
}
