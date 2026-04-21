'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthPageShell } from '@/components/auth/AuthPageShell'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const res = await signIn('credentials', {
                email: email.trim().toLowerCase(),
                password,
                redirect: false,
            })
            if (res?.error) {
                setError('Email atau sandi salah.')
                return
            }
            router.push(callbackUrl.startsWith('/') ? callbackUrl : '/dashboard')
            router.refresh()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="rg-chamfer relative w-full max-w-[400px] border border-emerald-500/20 bg-[#0c0c0f]/95 p-8 shadow-[0_0_0_1px_rgba(16,185,129,0.08),0_24px_80px_-20px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md"
        >
            <div className="pointer-events-none absolute -inset-px bg-gradient-to-br from-emerald-500/12 via-transparent to-violet-500/10 opacity-60" />
            <div className="relative">
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-500/70">
                    RestoreGen
                </p>
                <h1 className="mt-1 text-center text-xl font-bold tracking-tight text-white">Masuk</h1>
                <p className="mt-1 text-center text-[13px] text-zinc-500">Prompt &amp; scene — data cloud opsional</p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-[#2a2a32] bg-[#08080a] px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500/45 focus:ring-1 focus:ring-emerald-500/15"
                            placeholder="nama@email.com"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                            Sandi
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-[#2a2a32] bg-[#08080a] px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500/45 focus:ring-1 focus:ring-emerald-500/15"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="border border-red-500/35 bg-red-950/40 px-3 py-2 text-[13px] text-red-200">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="rg-chamfer relative w-full overflow-hidden border border-emerald-600/50 bg-gradient-to-r from-emerald-700 to-emerald-600 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-600 hover:to-emerald-500 disabled:opacity-50"
                    >
                        <span className="relative z-10">{loading ? 'Memproses…' : 'Login'}</span>
                    </button>
                </form>

                <p className="mt-6 text-center text-[12px] text-zinc-500">
                    Belum punya akun?{' '}
                    <Link href="/register" className="font-medium text-emerald-400/90 underline-offset-2 hover:underline">
                        Daftar
                    </Link>
                </p>

                <div className="mt-8 border-t border-[#1f1f24] pt-5">
                    <p className="text-center text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                        Akun uji (setelah <code className="text-zinc-500">db:seed</code>)
                    </p>
                    <div className="mt-2 space-y-2 text-left font-mono text-[9px] leading-snug text-zinc-500">
                        <p className="rounded border border-zinc-800/80 bg-black/30 p-2">
                            <span className="text-emerald-600/90">ADMIN</span>
                            <br />
                            admin@restoregen.local
                            <br />
                            AdminRestoreGen2026!
                        </p>
                        <p className="rounded border border-zinc-800/80 bg-black/30 p-2">
                            <span className="text-sky-600/90">USER</span>
                            <br />
                            user@restoregen.local
                            <br />
                            UserRestoreGen2026!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <AuthPageShell>
            <Suspense fallback={<div className="h-64 w-full max-w-[400px] animate-pulse bg-zinc-900/50 rg-chamfer" />}>
                <LoginForm />
            </Suspense>
        </AuthPageShell>
    )
}
