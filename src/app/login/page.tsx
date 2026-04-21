'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

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
            router.push('/dashboard')
            router.refresh()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#000000] px-4 py-12">
            <div className="w-full max-w-sm rounded-2xl border border-[#1f1f24] bg-[#121214] p-8 shadow-xl">
                <h1 className="mb-1 text-center text-xl font-bold text-white">Masuk</h1>
                <p className="mb-6 text-center text-[13px] text-zinc-500">Akun RestoreGen (data cloud / admin)</p>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            Sandi
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
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
                        {loading ? 'Memproses…' : 'Masuk'}
                    </button>
                </form>

                <p className="mt-6 text-center text-[12px] text-zinc-500">
                    Belum punya akun?{' '}
                    <Link href="/register" className="text-emerald-400 underline-offset-2 hover:underline">
                        Daftar
                    </Link>
                </p>
                <p className="mt-4 text-center">
                    <Link href="/dashboard" className="text-[12px] text-zinc-600 hover:text-zinc-400">
                        ← Kembali ke app
                    </Link>
                </p>
            </div>
        </div>
    )
}
