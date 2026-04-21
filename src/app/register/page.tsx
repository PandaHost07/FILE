'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthPageShell } from '@/components/auth/AuthPageShell'

const labelClass = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-500'

export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                    name: name.trim() || undefined,
                }),
            })
            const data = (await res.json()) as { ok?: boolean; error?: string }
            if (!res.ok) {
                setError(data.error ?? 'Gagal mendaftar')
                return
            }
            router.push('/login?registered=1')
        } catch {
            setError('Jaringan bermasalah')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthPageShell>
            <div className="rg-chamfer rg-login-card-glow relative w-full max-w-[400px] border border-emerald-500/25 bg-[#0a0a0d]/[0.97] p-8 backdrop-blur-md">
                <div
                    className="pointer-events-none absolute -inset-[1px] z-0 opacity-70 rg-chamfer bg-gradient-to-br from-emerald-500/25 via-transparent to-violet-500/15"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute left-5 top-[5.5rem] z-[1] size-[10px] border-l-2 border-t-2 border-emerald-500/40"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute bottom-5 right-5 z-[1] size-[10px] border-b-2 border-r-2 border-emerald-500/30"
                    aria-hidden
                />
                <div className="relative z-10">
                    <p className="text-center text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-500/70">
                        RestoreGen
                    </p>
                    <h1 className="mt-1 text-center text-xl font-bold tracking-tight text-white">Daftar</h1>
                    <p className="mt-1 text-center text-[13px] text-zinc-500">
                        API key tetap di perangkat; cloud untuk proyek &amp; template.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="name" className={labelClass}>
                                Nama (opsional)
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="rg-login-input"
                                autoComplete="name"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="email" className={labelClass}>
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="rg-login-input"
                                placeholder="nama@email.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="password" className={labelClass}>
                                Sandi (min. 8 karakter)
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="rg-login-input"
                            />
                        </div>

                        {error && (
                            <p className="border border-red-500/40 bg-red-950/50 px-3 py-2.5 text-[13px] text-red-200 shadow-[inset_3px_0_0_-1px_rgba(248,113,113,0.6)]">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="rg-chamfer rg-login-submit relative w-full overflow-hidden border border-emerald-500/55 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-600 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_12px_40px_-12px_rgba(16,185,129,0.45)] transition hover:border-emerald-400/60 hover:from-emerald-600 hover:via-emerald-500 hover:to-emerald-500 disabled:opacity-45"
                        >
                            <span className="relative z-10">{loading ? 'Memproses…' : 'Buat akun'}</span>
                        </button>
                    </form>

                    <p className="mt-6 text-center text-[12px] text-zinc-500">
                        Sudah terdaftar?{' '}
                        <Link href="/login" className="font-medium text-emerald-400/90 underline-offset-2 hover:underline">
                            Masuk
                        </Link>
                    </p>
                </div>
            </div>
        </AuthPageShell>
    )
}
