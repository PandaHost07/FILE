/** Nilai yang didukung Stability Stable Image Core v2 (parameter aspect_ratio) */
export const STABILITY_CORE_ASPECT_RATIOS = [
    '1:1',
    '16:9',
    '21:9',
    '2:3',
    '3:2',
    '4:5',
    '5:4',
    '9:16',
    '9:21',
] as const

export type TimelapseImageAspect = (typeof STABILITY_CORE_ASPECT_RATIOS)[number]

/** Opsi yang ditampilkan di UI timelapse (subset yang paling relevan) */
export const TIMELAPSE_IMAGE_ASPECT_OPTIONS: { ratio: TimelapseImageAspect; shortLabel: string }[] = [
    { ratio: '9:16', shortLabel: '9:16 · Shorts / Reels' },
    { ratio: '16:9', shortLabel: '16:9 · Layar lebar' },
    { ratio: '1:1', shortLabel: '1:1 · Square' },
    { ratio: '4:5', shortLabel: '4:5 · Portrait feed' },
    { ratio: '3:2', shortLabel: '3:2 · Foto klasik' },
]

export function isTimelapseImageAspect(s: string): s is TimelapseImageAspect {
    return (STABILITY_CORE_ASPECT_RATIOS as readonly string[]).includes(s)
}

/** Disarankan: vertikal untuk short, horizontal untuk long */
export function defaultAspectForVideoKind(kind: 'short' | 'long'): TimelapseImageAspect {
    return kind === 'long' ? '16:9' : '9:16'
}

export function videoFormatToKind(f: 'short-15' | 'short-30' | 'short-60' | 'long'): 'short' | 'long' {
    return f === 'long' ? 'long' : 'short'
}

/** Kelas Tailwind untuk preview gambar mengikuti rasio */
export function aspectPreviewClass(ratio: TimelapseImageAspect): string {
    switch (ratio) {
        case '9:16':
            return 'aspect-[9/16]'
        case '16:9':
            return 'aspect-video'
        case '1:1':
            return 'aspect-square'
        case '4:5':
            return 'aspect-[4/5]'
        case '5:4':
            return 'aspect-[5/4]'
        case '2:3':
            return 'aspect-[2/3]'
        case '3:2':
            return 'aspect-[3/2]'
        case '21:9':
            return 'aspect-[21/9]'
        case '9:21':
            return 'aspect-[9/21]'
        default:
            return 'aspect-square'
    }
}
