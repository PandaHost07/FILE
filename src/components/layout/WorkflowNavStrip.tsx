'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, CheckCircle2 } from 'lucide-react'
import { WORKFLOW_NAV, workflowStepFromPathname } from '@/lib/workflowNav'
import { cn } from '@/lib/utils'

/** Jalur langkah workflow (mobile / layar sempit); di `xl` disembunyikan karena sidebar sudah cukup. */
export function WorkflowNavStrip({ className }: { className?: string }) {
    const pathname = usePathname()
    const currentStep = workflowStepFromPathname(pathname)
    if (currentStep <= 0) return null

    return (
        <div
            className={cn(
                '-mx-1 flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none [mask-image:linear-gradient(90deg,transparent,black_8px,black_calc(100%-8px),transparent)] xl:hidden',
                className
            )}
        >
            {WORKFLOW_NAV.map((s, i) => (
                <div key={s.step} className="flex shrink-0 items-center gap-1">
                    <Link
                        href={s.href}
                        className={cn(
                            'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all sm:px-2.5 sm:py-1',
                            s.step === currentStep
                                ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
                                : s.step < currentStep
                                  ? 'text-emerald-500/80 hover:text-emerald-400'
                                  : 'text-zinc-600 hover:text-zinc-400'
                        )}
                    >
                        {s.step < currentStep ? <CheckCircle2 className="size-2.5 sm:size-3" /> : null}
                        <span className="whitespace-nowrap">{s.shortLabel}</span>
                    </Link>
                    {i < WORKFLOW_NAV.length - 1 && (
                        <ChevronRight className="size-2.5 shrink-0 text-zinc-700 sm:size-3" />
                    )}
                </div>
            ))}
        </div>
    )
}
