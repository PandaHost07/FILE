'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthPageShell } from '@/components/auth/AuthPageShell'

const inputClass =
    'w-full border border-[#2a2a32] bg-[#08080a] px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500/45 focus:ring-1 focus:ring-emerald-500/15'

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
            <div className="rg-chamfer relative w-full max-w-[400px] border border-emerald-500/20 bg-[#0c0c0f]/95 p-8 shadow-[0_0_0_1px_rgba(16,185,129,0.08),0_24px_80px_-20px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
                <div className="pointer-events-none absolute -inset-px bg-gradient-to-br from-emerald-500/12 via-transparent to-violet-500/10 opacity-60" />
                <div className="relative">
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
                                className={inputClass}
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
                                className={inputClass}
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
                                className={inputClass}
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
