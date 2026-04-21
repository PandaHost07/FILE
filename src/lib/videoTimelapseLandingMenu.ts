import type { LucideIcon } from 'lucide-react'
import { BookOpen, Lightbulb, FileText, LayoutGrid, ListChecks, Trees, Wrench } from 'lucide-react'

export type TimelapseLandingMode = 'cabin' | 'restorasi'

export interface TimelapseLandingItem {
    href: string
    label: string
    icon: LucideIcon
}

export interface TimelapseLandingSection {
    title: string
    items: TimelapseLandingItem[]
}

/**
 * Menu landing Video timelapse — hanya rute di bawah `/video-timelapse`.
 * Tidak menaut ke Idea Generator, Scene Builder, Tools, dll.
 */
export function getTimelapseLandingSections(mode: TimelapseLandingMode): TimelapseLandingSection[] {
    const guideHref = mode === 'cabin' ? '/video-timelapse/cabin' : '/video-timelapse/restorasi'
    const guideLabel =
        mode === 'cabin' ? 'Panduan lengkap — Cabin / outdoor' : 'Panduan lengkap — Restorasi / workshop'

    const cross: TimelapseLandingItem =
        mode === 'cabin'
            ? {
                  href: '/video-timelapse/restorasi',
                  label: 'Panduan mode lain — Restorasi / workshop',
                  icon: Wrench,
              }
            : {
                  href: '/video-timelapse/cabin',
                  label: 'Panduan mode lain — Cabin / outdoor',
                  icon: Trees,
              }

    const modeSpecific: TimelapseLandingSection =
        mode === 'cabin'
            ? {
                  title: 'Narasi & audio',
                  items: [
                      {
                          href: '/video-timelapse/narasi',
                          label: 'Outline narasi konstruksi & iringan musik',
                          icon: FileText,
                      },
                  ],
              }
            : {
                  title: 'Perencanaan visual',
                  items: [
                      {
                          href: '/video-timelapse/perencanaan-visual',
                          label: 'Urutan shot, before/after & workshop',
                          icon: LayoutGrid,
                      },
                  ],
              }

    return [
        {
            title: 'Panduan mode',
            items: [
                { href: guideHref, label: guideLabel, icon: BookOpen },
                cross,
            ],
        },
        {
            title: 'Ide & konten (hub ini)',
            items: [
                {
                    href: '/video-timelapse/ide',
                    label: 'Angle viral, hook & struktur episode timelapse',
                    icon: Lightbulb,
                },
            ],
        },
        modeSpecific,
        {
            title: 'Sebelum render',
            items: [
                {
                    href: '/video-timelapse/checklist',
                    label: 'Checklist gambar, gerakan & konsistensi',
                    icon: ListChecks,
                },
            ],
        },
    ]
}
