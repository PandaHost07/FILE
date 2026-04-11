'use client'

import { ToastProvider, ToastList } from './toast'

export function Toaster({ children }: { children?: React.ReactNode }) {
    return (
        <ToastProvider>
            {children}
            <ToastList />
        </ToastProvider>
    )
}
