'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { Cloud, Loader2 } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { buildCloudWorkspacePayload } from '@/lib/workspaceSnapshot'
import { useToast } from '@/components/ui/toast'

const cardClass =
    'overflow-hidden rounded-2xl border border-[#1f1f24] bg-[#121214] shadow-xl shadow-black/30'

export function CloudSyncSection() {
    const { data: session, status } = useSession()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    async function syncNow() {
        const s = useAppStore.getState()
        const payload = buildCloudWorkspacePayload({
            projects: s.projects,
            templates: s.templates,
            activeProjectId: s.activeProjectId,
            activeSceneId: s.activeSceneId,
            apiUsage: s.apiUsage,
        })

        setLoading(true)
        try {
            const res = await fetch('/api/user/workspace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload }),
            })
            if (!res.ok) {
                const err = (await res.json().catch(() => ({}))) as { error?: string }
                throw new Error(err.error ?? `HTTP ${res.status}`)
            }
            toast({ title: 'Tersimpan di cloud', description: 'Proyek & template (tanpa gambar besar & tanpa API key).' })
        } catch (e) {
            toast({
                title: 'Gagal sinkron',
                description: e instanceof Error ? e.message : 'Error',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className={cardClass}>
            <div className="border-b border-[#1a1a1a] bg-[#0f0f12] px-4 py-3">
                <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                    <Cloud className="size-4 text-sky-400" />
                    Database online (PostgreSQL)
                </h2>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                    Sinkron proyek & template ke akun. API key tidak dikirim ke server — tetap lokal.
                </p>
            </div>
            <div className="p-4">
                {status === 'loading' && (
                    <p className="flex items-center gap-2 text-[13px] text-zinc-500">
                        <Loader2 className="size-4 animate-spin" /> Memuat sesi…
                    </p>
                )}
                {status === 'unauthenticated' && (
                    <div className="space-y-3 text-[13px] text-zinc-400">
                        <p>Belum masuk. Daftar atau login untuk menyimpan data ke cloud.</p>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/login"
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-xl border border-[#2a2a2e] px-4 py-2 text-sm text-zinc-300 hover:bg-[#1a1a1e]"
                            >
                                Daftar
                            </Link>
                        </div>
                    </div>
                )}
                {status === 'authenticated' && session?.user && (
                    <div className="space-y-3">
                        <p className="text-[12px] text-zinc-400">
                            Masuk sebagai <span className="font-medium text-zinc-200">{session.user.email}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => void syncNow()}
                                disabled={loading}
                                className="inline-flex items-center gap-2 rounded-xl border border-sky-500/35 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-300 transition hover:bg-sky-500/20 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="size-4 animate-spin" /> : <Cloud className="size-4" />}
                                Sinkronkan sekarang
                            </button>
                            <button
                                type="button"
                                onClick={() => void signOut({ callbackUrl: '/login' })}
                                className="rounded-xl border border-zinc-600/50 bg-zinc-800/40 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
                            >
                                Keluar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
