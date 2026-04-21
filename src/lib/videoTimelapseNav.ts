import type { ContentMode } from '@/types'

/** Mapping pilihan halaman Video timelapse → mode proyek di store */
export const TIMELAPSE_TO_CONTENT_MODE: Record<'cabin' | 'restorasi', ContentMode> = {
    cabin: 'cabin_build',
    restorasi: 'restoration',
}
