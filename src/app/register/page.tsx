'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#000000] px-4 py-12">
            <div className="w-full max-w-sm rounded-2xl border border-[#1f1f24] bg-[#121214] p-8 shadow-xl">
                <h1 className="mb-1 text-center text-xl font-bold text-white">Daftar</h1>
                <p className="mb-6 text-center text-[13px] text-zinc-500">
                    API key tetap di perangkat; cloud menyimpan proyek/template.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="mb-1 block text-[12px] font-medium text-zinc-400">
                            Nama (opsional)
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-[#2a2a2e] bg-[#0d0d10] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="mb-1 block text-[12px] font-medium text-zinc-400">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-[#2a2a2e] bg-[#0d0d10] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="mb-1 block text-[12px] font-medium text-zinc-400">
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
                            className="w-full rounded-xl border border-[#2a2a2e] bg-[#0d0d10] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
                        />
                    </div>

                    {error && (
                        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                        {loading ? 'Memproses…' : 'Buat akun'}
                    </button>
                </form>

                <p className="mt-6 text-center text-[12px] text-zinc-500">
                    Sudah terdaftar?{' '}
                    <Link href="/login" className="text-emerald-400 underline-offset-2 hover:underline">
                        Masuk
                    </Link>
                </p>
            </div>
        </div>
    )
}
