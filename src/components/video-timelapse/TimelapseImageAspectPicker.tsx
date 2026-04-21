'use client'

import { cn } from '@/lib/utils'
import { TIMELAPSE_IMAGE_ASPECT_OPTIONS, type TimelapseImageAspect } from '@/lib/timelapseImageAspect'

type Variant = 'amber' | 'emerald'

const selectedRing: Record<Variant, string> = {
    amber: 'border-amber-500/55 bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25',
    emerald: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/25',
}

interface TimelapseImageAspectPickerProps {
    value: TimelapseImageAspect
    onChange: (v: TimelapseImageAspect) => void
    disabled?: boolean
    variant?: Variant
    /** Short vs long — teks bantu */
    videoKind: 'short' | 'long'
}

export function TimelapseImageAspectPicker({
    value,
    onChange,
    disabled,
    variant = 'amber',
    videoKind,
}: TimelapseImageAspectPickerProps) {
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className={cn('text-[10px] font-semibold uppercase tracking-wider text-zinc-600')}>Ukuran foto (Stability)</p>
                <p className="text-[10px] text-zinc-600">
                    {videoKind === 'short' ? 'Short: biasanya 9:16' : 'Long: biasanya 16:9'}
                </p>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {TIMELAPSE_IMAGE_ASPECT_OPTIONS.map(({ ratio, shortLabel }) => (
                    <button
                        key={ratio}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(ratio)}
                        className={cn(
                            'rounded-xl border px-2 py-1.5 text-left text-[10px] font-medium transition-all active:scale-[0.98] sm:px-2.5 sm:text-[11px]',
                            disabled && 'pointer-events-none opacity-40',
                            value === ratio
                                ? selectedRing[variant]
                                : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/35'
                        )}
                    >
                        {shortLabel}
                    </button>
                ))}
            </div>
        </div>
    )
}
