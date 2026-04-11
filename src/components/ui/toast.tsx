'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'default' | 'success' | 'destructive'

export interface Toast {
    id: string
    title: string
    description?: string
    variant?: ToastVariant
}

interface ToastContextValue {
    toasts: Toast[]
    toast: (opts: Omit<Toast, 'id'>) => void
    dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([])

    const toast = React.useCallback((opts: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).slice(2)
        setToasts((prev) => [...prev, { ...opts, id }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3500)
    }, [])

    const dismiss = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = React.useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within ToastProvider')
    return ctx
}

export function ToastList() {
    const { toasts, dismiss } = useToast()
    return (
        <div
            aria-live="polite"
            aria-atomic="true"
            className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80"
        >
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={cn(
                        'flex items-start justify-between gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm transition-all',
                        t.variant === 'destructive'
                            ? 'border-red-800 bg-red-950 text-red-100'
                            : 'border-zinc-700 bg-zinc-900 text-zinc-100'
                    )}
                >
                    <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{t.title}</span>
                        {t.description && (
                            <span className="text-zinc-400 text-xs">{t.description}</span>
                        )}
                    </div>
                    <button
                        onClick={() => dismiss(t.id)}
                        className="text-zinc-500 hover:text-zinc-300 shrink-0 mt-0.5"
                        aria-label="Tutup notifikasi"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    )
}
