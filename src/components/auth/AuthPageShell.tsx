import type { ReactNode } from 'react'

/** Latar animasi bersama untuk login & daftar. */
export function AuthPageShell({ children }: { children: ReactNode }) {
    return (
        <div className="rg-login-root relative min-h-[100dvh] overflow-hidden bg-[#030304]">
            <div className="rg-login-grid pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden />
            <div
                className="rg-login-blob rg-login-blob-a pointer-events-none absolute -left-32 top-0 size-[min(85vw,520px)] rounded-full bg-emerald-600/25 blur-[100px]"
                aria-hidden
            />
            <div
                className="rg-login-blob rg-login-blob-b pointer-events-none absolute -right-20 bottom-0 size-[min(80vw,480px)] rounded-full bg-violet-600/20 blur-[100px]"
                aria-hidden
            />
            <div
                className="rg-login-blob rg-login-blob-c pointer-events-none absolute left-1/2 top-1/2 size-[min(90vw,600px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-600/15 blur-[120px]"
                aria-hidden
            />
            <div
                className="rg-login-vignette pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_0%,#030304_75%)]"
                aria-hidden
            />
            <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-16 pb-[max(2rem,env(safe-area-inset-bottom))]">
                {children}
            </div>
        </div>
    )
}
