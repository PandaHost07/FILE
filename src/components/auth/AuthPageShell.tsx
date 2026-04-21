import type { ReactNode } from 'react'

/** Latar auth: aurora, grid, diagonal, scan, blob, partikel — gaya wireframe teknis. */
export function AuthPageShell({ children }: { children: ReactNode }) {
    return (
        <div className="rg-login-root relative min-h-[100dvh] overflow-hidden bg-[#020203]">
            <div className="rg-login-aurora" aria-hidden />

            <div
                className="rg-login-blob rg-login-blob-a pointer-events-none absolute -left-32 top-0 size-[min(85vw,520px)] rounded-full bg-emerald-600/25 blur-[100px]"
                aria-hidden
            />
            <div
                className="rg-login-blob rg-login-blob-b pointer-events-none absolute -right-20 bottom-0 size-[min(80vw,480px)] rounded-full bg-violet-600/18 blur-[100px]"
                aria-hidden
            />
            <div
                className="rg-login-blob rg-login-blob-c pointer-events-none absolute left-1/2 top-1/2 size-[min(90vw,600px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-600/14 blur-[120px]"
                aria-hidden
            />

            <div className="rg-login-diagonals" aria-hidden />
            <div className="rg-login-grid pointer-events-none absolute inset-0 opacity-[0.55]" aria-hidden />

            <div className="rg-login-nodes" aria-hidden>
                {Array.from({ length: 16 }, (_, i) => (
                    <span key={i} />
                ))}
            </div>

            <div className="rg-login-scan" aria-hidden />

            <div
                className="rg-login-vignette pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_78%_58%_at_50%_48%,transparent_0%,#020203_72%)]"
                aria-hidden
            />

            <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-16 pb-[max(2rem,env(safe-area-inset-bottom))]">
                {children}
            </div>
        </div>
    )
}
