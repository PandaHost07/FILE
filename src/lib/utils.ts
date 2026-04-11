import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import type { ContentMode, Project, Scene } from '@/types'

/** Mode konten proyek; data lama tanpa field → restoration */
export function getProjectContentMode(project: Project | null | undefined): ContentMode {
  return project?.contentMode ?? 'restoration'
}

/** Generate a unique ID using the Web Crypto API */
export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Convert text to a URL-friendly slug.
 * Lowercase, spaces → '-', remove non-alphanumeric except '-'.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/**
 * Format a Unix timestamp (ms) to 'DD MMM YYYY' in Indonesian locale.
 * Example: 1700000000000 → '14 Nov 2023'
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Pad an order number to two digits.
 * Example: 1 → '01', 10 → '10'
 */
export function toTwoDigitOrder(order: number): string {
  return String(order).padStart(2, '0')
}

/**
 * Build a scene slug from its order and name.
 * Example: { order: 2, name: 'Proses Amplas' } → '02_proses-amplas'
 */
export function toSceneSlug(scene: Scene): string {
  return `${toTwoDigitOrder(scene.order)}_${slugify(scene.name)}`
}
