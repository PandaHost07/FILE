'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
    value: number
    durationMs?: number
    className?: string
}

/** Animasi angka saat `value` berubah. */
export function CountUp({ value, durationMs = 550, className }: CountUpProps) {
    const [display, setDisplay] = useState(value)
    const prevRef = useRef(value)

    useEffect(() => {
        const from = prevRef.current
        if (from === value) return
        let raf = 0
        const start = performance.now()
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / durationMs)
            const eased = 1 - (1 - t) ** 2
            setDisplay(Math.round(from + (value - from) * eased))
            if (t < 1) raf = requestAnimationFrame(tick)
            else prevRef.current = value
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [value, durationMs])

    return <span className={className}>{display}</span>
}
