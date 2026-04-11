'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Key,
    ExternalLink,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2,
    Trash2,
    RefreshCw,
    Plus,
    X,
    BarChart3,
    Sparkles,
    LayoutDashboard,
} from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { useToast } from '@/components/ui/toast'
import { parseKeys, getKeyCount } from '@/lib/keyRotation'
import type { ApiUsageProvider } from '@/types'

const GEMINI_MODELS = [
    { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite', desc: 'Hemat quota, stabil — recommended' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Lebih pintar' },
    { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', desc: 'Terbaru, hemat quota' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'Terbaru, paling canggih' },
]

const USAGE_LABELS: Record<ApiUsageProvider, string> = {
    gemini: 'Gemini',
    imagen: 'Stability',
    openai: 'OpenAI',
    heygen: 'HeyGen',
}

function formatLastUsed(ts: number | null): string {
    if (ts == null) return 'Belum pernah'
    const diff = Date.now() - ts
    if (diff < 60_000) return 'Baru saja'
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} m lalu`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} j lalu`
    return `${Math.floor(diff / 86_400_000)} h lalu`
}

async function testGeminiKey(apiKey: string): Promise<boolean> {
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Hi' }] }] }),
            }
        )
        return res.ok
    } catch {
        return false
    }
}

export default function SettingsPage() {
    const { apiKeys, setApiKeys, clearApiKeys, apiUsage, resetApiUsage } = useAppStore()
    const { toast } = useToast()

    const existingGeminiKeys = parseKeys(apiKeys.gemini)
    const existingOpenAIKeys = parseKeys(apiKeys.openai)

    const [geminiInputs, setGeminiInputs] = useState<string[]>(
        existingGeminiKeys.length > 0 ? existingGeminiKeys : ['']
    )
    const [openaiInputs, setOpenaiInputs] = useState<string[]>(
        existingOpenAIKeys.length > 0 ? existingOpenAIKeys : ['']
    )
    const [stabilityInput, setStabilityInput] = useState('')
    const [testingIdx, setTestingIdx] = useState<number | null>(null)
    const [testResults, setTestResults] = useState<Record<number, 'ok' | 'fail'>>({})
    const [confirmReset, setConfirmReset] = useState(false)
    const [preferredModel, setPreferredModel] = useState(
        typeof window !== 'undefined' ? (localStorage.getItem('rpg-preferred-model') ?? 'gemini-2.0-flash-lite') : 'gemini-2.0-flash-lite'
    )

    function handleSave() {
        const validGemini = geminiInputs.filter((k) => k.trim()).map((k) => k.trim())
        const validOpenAI = openaiInputs.filter((k) => k.trim()).map((k) => k.trim())

        const updates: Partial<typeof apiKeys> = {}
        if (validGemini.length > 0) updates.gemini = validGemini.join(',')
        if (validOpenAI.length > 0) updates.openai = validOpenAI.join(',')
        if (stabilityInput.trim()) updates.imagen = stabilityInput.trim()

        if (Object.keys(updates).length === 0) {
            toast({ title: 'Tidak ada perubahan', variant: 'default' })
            return
        }
        setApiKeys(updates)
        setStabilityInput('')
        toast({ title: `API Keys disimpan (${validGemini.length} Gemini, ${validOpenAI.length} OpenAI)`, variant: 'default' })
    }

    async function handleTestGemini(idx: number) {
        const key = geminiInputs[idx]?.trim()
        if (!key) return
        setTestingIdx(idx)
        const ok = await testGeminiKey(key)
        setTestResults((prev) => ({ ...prev, [idx]: ok ? 'ok' : 'fail' }))
        setTestingIdx(null)
    }

    function handleSaveModel(model: string) {
        setPreferredModel(model)
        localStorage.setItem('rpg-preferred-model', model)
        toast({ title: 'Model disimpan', description: model, variant: 'default' })
    }

    function handleResetApp() {
        localStorage.clear()
        window.location.reload()
    }

    function addGeminiKey() {
        setGeminiInputs((prev) => [...prev, ''])
    }
    function removeGeminiKey(idx: number) {
        setGeminiInputs((prev) => prev.filter((_, i) => i !== idx))
    }
    function updateGeminiKey(idx: number, val: string) {
        setGeminiInputs((prev) => prev.map((k, i) => (i === idx ? val : k)))
        setTestResults((prev) => {
            const n = { ...prev }
            delete n[idx]
            return n
        })
    }

    function addOpenAIKey() {
        setOpenaiInputs((prev) => [...prev, ''])
    }
    function removeOpenAIKey(idx: number) {
        setOpenaiInputs((prev) => prev.filter((_, i) => i !== idx))
    }
    function updateOpenAIKey(idx: number, val: string) {
        setOpenaiInputs((prev) => prev.map((k, i) => (i === idx ? val : k)))
    }

    const savedGeminiCount = getKeyCount(apiKeys.gemini)
    const savedOpenAICount = getKeyCount(apiKeys.openai)

    const cardClass = 'rounded-2xl border border-zinc-800/90 bg-zinc-900/40 backdrop-blur-sm p-5 sm:p-6 space-y-4 shadow-sm shadow-black/20'

    return (
        <div className="min-h-full bg-zinc-950">
            <div className="mx-auto w-full max-w-[min(1600px,100%)] px-4 sm:px-6 lg:px-8 xl:px-10 py-6 md:py-8 lg:py-10">
                <header className="mb-8 flex flex-col gap-3 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">Pengaturan</h1>
                        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
                            Kelola API key, model Gemini, dan data lokal aplikasi — area ini memakai lebar penuh antara sidebar.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 text-xs font-medium text-zinc-400">
                            Penyimpanan: browser lokal
                        </span>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/50 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
                        >
                            <LayoutDashboard className="size-3.5" />
                            Dashboard
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_min(420px,38%)] xl:items-start xl:gap-10 2xl:gap-12">
                    {/* ── Kolom kiri: API keys ── */}
                    <div className="min-w-0 space-y-6">
                        <div className="flex gap-3 rounded-2xl border border-amber-800/40 bg-amber-950/25 px-4 py-3.5 text-sm text-amber-200/95">
                            <AlertTriangle className="size-4 shrink-0 text-amber-400" />
                            <p>
                                API key hanya disimpan di perangkat ini. Jangan gunakan di komputer publik atau layar yang bisa dilihat orang lain.
                            </p>
                        </div>

                        <div className={cardClass}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                                        <Key className="size-4 text-amber-400" />
                                        Gemini API Keys
                                    </h2>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        {savedGeminiCount > 0 ? (
                                            <span className="text-emerald-400/95">{savedGeminiCount} key tersimpan — rotasi otomatis</span>
                                        ) : (
                                            'Belum ada key tersimpan'
                                        )}
                                    </p>
                                </div>
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-amber-400/90 transition-colors hover:text-amber-300"
                                >
                                    Dapatkan key <ExternalLink className="size-3" />
                                </a>
                            </div>

                            <div className="space-y-2">
                                {geminiInputs.map((key, idx) => (
                                    <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <div className="min-w-0 flex-1">
                                            <input
                                                type="password"
                                                value={key}
                                                onChange={(e) => updateGeminiKey(idx, e.target.value)}
                                                placeholder={`Gemini API key ${idx + 1}`}
                                                className="w-full rounded-xl border border-zinc-700/90 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                                            />
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleTestGemini(idx)}
                                                disabled={testingIdx === idx || !key.trim()}
                                                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 disabled:opacity-40"
                                            >
                                                {testingIdx === idx ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : testResults[idx] === 'ok' ? (
                                                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                                                ) : testResults[idx] === 'fail' ? (
                                                    <XCircle className="size-3.5 text-red-400" />
                                                ) : (
                                                    <RefreshCw className="size-3.5" />
                                                )}
                                                Test
                                            </button>
                                            {geminiInputs.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeGeminiKey(idx)}
                                                    className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-red-400"
                                                    aria-label="Hapus baris"
                                                >
                                                    <X className="size-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addGeminiKey}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-amber-400"
                            >
                                <Plus className="size-3.5" /> Tambah key Gemini lagi
                            </button>
                            <p className="text-xs text-zinc-600">Jika quota habis, sistem mencoba key berikutnya secara otomatis.</p>
                        </div>

                        <div className={cardClass}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-zinc-200">
                                        <Key className="size-4 text-emerald-400" />
                                        OpenAI API Keys
                                        <span className="text-[10px] font-normal text-zinc-600">(cadangan jika Gemini habis)</span>
                                    </h2>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        {savedOpenAICount > 0 ? (
                                            <span className="text-emerald-400/95">{savedOpenAICount} key tersimpan — rotasi otomatis</span>
                                        ) : (
                                            'Belum ada key tersimpan'
                                        )}
                                    </p>
                                </div>
                                <a
                                    href="https://platform.openai.com/api-keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-400/90 transition-colors hover:text-emerald-300"
                                >
                                    Dapatkan key <ExternalLink className="size-3" />
                                </a>
                            </div>

                            <div className="space-y-2">
                                {openaiInputs.map((key, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="password"
                                            value={key}
                                            onChange={(e) => updateOpenAIKey(idx, e.target.value)}
                                            placeholder={`OpenAI API key ${idx + 1} (sk-...)`}
                                            className="min-w-0 flex-1 rounded-xl border border-zinc-700/90 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                                        />
                                        {openaiInputs.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOpenAIKey(idx)}
                                                className="shrink-0 rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-red-400"
                                                aria-label="Hapus baris"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addOpenAIKey}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-emerald-400"
                            >
                                <Plus className="size-3.5" /> Tambah key OpenAI lagi
                            </button>
                        </div>

                        <div className={cardClass}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-zinc-200">
                                    <Key className="size-4 text-blue-400" />
                                    Stability AI
                                    <span className="text-[10px] font-normal text-zinc-600">(generate gambar)</span>
                                </h2>
                                <a
                                    href="https://platform.stability.ai/account/keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-blue-400/90 transition-colors hover:text-blue-300"
                                >
                                    Dapatkan key <ExternalLink className="size-3" />
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium ${apiKeys.imagen ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                    {apiKeys.imagen ? '✓ Key tersimpan' : 'Belum dikonfigurasi'}
                                </span>
                            </div>
                            <input
                                type="password"
                                value={stabilityInput}
                                onChange={(e) => setStabilityInput(e.target.value)}
                                placeholder={apiKeys.imagen ? '••••••••••••••••' : 'Tempel key baru (sk-...)'}
                                className="w-full rounded-xl border border-zinc-700/90 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                            />
                            <p className="text-xs text-zinc-600">Akun baru biasanya mendapat kredit gratis untuk mencoba.</p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={handleSave}
                                className="flex-1 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
                            >
                                Simpan semua API keys
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    clearApiKeys()
                                    setGeminiInputs([''])
                                    setOpenaiInputs([''])
                                    setStabilityInput('')
                                }}
                                className="rounded-xl border border-red-800/50 bg-red-950/30 px-5 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/50 sm:shrink-0"
                            >
                                Hapus semua
                            </button>
                        </div>
                    </div>

                    {/* ── Kolom kanan: model, pemakaian, danger ── */}
                    <aside className="min-w-0 space-y-6 xl:sticky xl:top-6 xl:self-start">
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                                <Sparkles className="size-4 text-amber-400" />
                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-200">Model Gemini utama</h2>
                                    <p className="text-xs text-zinc-500">Fallback ke model lain otomatis jika quota habis.</p>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                {GEMINI_MODELS.map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => handleSaveModel(m.id)}
                                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                                            preferredModel === m.id
                                                ? 'border-amber-500/50 bg-amber-500/10 shadow-sm shadow-amber-900/20'
                                                : 'border-zinc-700/80 hover:border-zinc-600 hover:bg-zinc-800/40'
                                        }`}
                                    >
                                        <span
                                            className={`mt-1 size-3 shrink-0 rounded-full border-2 ${
                                                preferredModel === m.id ? 'border-amber-400 bg-amber-400' : 'border-zinc-600'
                                            }`}
                                        />
                                        <div className="min-w-0">
                                            <p
                                                className={`text-sm font-medium ${
                                                    preferredModel === m.id ? 'text-amber-300' : 'text-zinc-200'
                                                }`}
                                            >
                                                {m.label}
                                            </p>
                                            <p className="text-xs text-zinc-500">{m.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={cardClass}>
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="size-4 text-zinc-400" />
                                    <div>
                                        <h2 className="text-sm font-semibold text-zinc-200">Pemakaian API (lokal)</h2>
                                        <p className="text-xs text-zinc-500">Hitung permintaan sukses dari app ini saja.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetApiUsage()
                                        toast({ title: 'Statistik pemakaian direset', variant: 'default' })
                                    }}
                                    className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
                                >
                                    Reset statistik
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                {(Object.keys(USAGE_LABELS) as ApiUsageProvider[]).map((p) => {
                                    const u = apiUsage?.[p] ?? { requests: 0, lastAt: null }
                                    return (
                                        <div
                                            key={p}
                                            className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-3 py-2.5"
                                        >
                                            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                                                {USAGE_LABELS[p]}
                                            </p>
                                            <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-100">{u.requests}</p>
                                            <p className="text-[10px] text-zinc-600">{formatLastUsed(u.lastAt)}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-red-900/35 bg-red-950/15 p-5 sm:p-6">
                            <h2 className="text-sm font-semibold text-red-400">Danger zone</h2>
                            <p className="mt-1 text-xs text-zinc-500">
                                Menghapus semua data aplikasi: project, template, dan API key di browser ini. Tidak bisa dibatalkan.
                            </p>
                            {!confirmReset ? (
                                <button
                                    type="button"
                                    onClick={() => setConfirmReset(true)}
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-800/50 bg-red-950/30 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/50 sm:w-auto"
                                >
                                    <Trash2 className="size-4" /> Reset semua data
                                </button>
                            ) : (
                                <div className="mt-4 space-y-3">
                                    <p className="text-sm font-medium text-red-300">Yakin? Tindakan ini permanen.</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setConfirmReset(false)}
                                            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleResetApp}
                                            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-400"
                                        >
                                            Ya, reset
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
