'use client'

import { useEffect, useState } from 'react'
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
    Cpu,
    Shield,
} from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { useToast } from '@/components/ui/toast'
import { parseKeys, getKeyCount, resetRotation } from '@/lib/keyRotation'
import type { ApiUsageProvider } from '@/types'
import { cn } from '@/lib/utils'
import { clearApiKeysIDB } from '@/lib/apiKeysIDB'

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
    fal: 'fal.ai',
    huggingface: 'Hugging Face',
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
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
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

type SettingsTab = 'api' | 'model' | 'usage' | 'data'

const inputClass =
    'w-full rounded-xl border border-[#2a2a2e] bg-[#0d0d10] px-3 py-2.5 text-[13px] text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20'

const cardClass =
    'overflow-hidden rounded-2xl border border-[#1f1f24] bg-[#121214] shadow-xl shadow-black/30'

export default function SettingsPage() {
    const { apiKeys, setApiKeys, clearApiKeys, apiUsage, resetApiUsage } = useAppStore()
    const { toast } = useToast()

    const [activeTab, setActiveTab] = useState<SettingsTab>('api')

    const existingGeminiKeys = parseKeys(apiKeys.gemini)
    const existingOpenAIKeys = parseKeys(apiKeys.openai)
    const existingGroqKeys = parseKeys(apiKeys.groq ?? '')

    const [geminiInputs, setGeminiInputs] = useState<string[]>(
        existingGeminiKeys.length > 0 ? existingGeminiKeys : ['']
    )
    const [openaiInputs, setOpenaiInputs] = useState<string[]>(
        existingOpenAIKeys.length > 0 ? existingOpenAIKeys : ['']
    )
    const [groqInputs, setGroqInputs] = useState<string[]>(
        existingGroqKeys.length > 0 ? existingGroqKeys : ['']
    )

    useEffect(() => {
        function syncFromStore() {
            const keys = useAppStore.getState().apiKeys
            const g = parseKeys(keys.gemini)
            const o = parseKeys(keys.openai)
            const q = parseKeys(keys.groq ?? '')
            if (g.length > 0) setGeminiInputs(g)
            if (o.length > 0) setOpenaiInputs(o)
            if (q.length > 0) setGroqInputs(q)
        }
        const p = useAppStore.persist
        if (!p) return
        if (p.hasHydrated()) syncFromStore()
        return p.onFinishHydration(syncFromStore)
    }, [])

    const [stabilityInput, setStabilityInput] = useState('')
    const [huggingfaceInput, setHuggingfaceInput] = useState('')
    const [falInput, setFalInput] = useState('')
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
        if (validGemini.length > 0) {
            updates.gemini = validGemini.join(',')
            resetRotation('gemini')
        }
        if (validOpenAI.length > 0) {
            updates.openai = validOpenAI.join(',')
            resetRotation('openai')
        }
        if (stabilityInput.trim()) updates.imagen = stabilityInput.trim()
        const validGroq = groqInputs.filter((k) => k.trim()).map((k) => k.trim())
        if (validGroq.length > 0) {
            updates.groq = validGroq.join(',')
            resetRotation('groq')
        }
        if (huggingfaceInput.trim()) updates.huggingface = huggingfaceInput.trim()
        if (falInput.trim()) updates.fal = falInput.trim()

        if (Object.keys(updates).length === 0) {
            toast({ title: 'Tidak ada perubahan', variant: 'default' })
            return
        }
        setApiKeys(updates)
        setStabilityInput('')
        setHuggingfaceInput('')
        setFalInput('')
        toast({
            title: `API Keys disimpan (${validGemini.length} Gemini, ${validOpenAI.length} OpenAI${updates.huggingface ? ', HF' : ''}${updates.fal ? ', fal.ai' : ''})`,
            variant: 'default',
        })
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
        void (async () => {
            await clearApiKeysIDB()
            localStorage.clear()
            window.location.reload()
        })()
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

    function addGroqKey() {
        setGroqInputs((prev) => [...prev, ''])
    }
    function removeGroqKey(idx: number) {
        setGroqInputs((prev) => prev.filter((_, i) => i !== idx))
    }
    function updateGroqKey(idx: number, val: string) {
        setGroqInputs((prev) => prev.map((k, i) => (i === idx ? val : k)))
    }

    const savedGeminiCount = getKeyCount(apiKeys.gemini)
    const savedOpenAICount = getKeyCount(apiKeys.openai)

    const tabs: { id: SettingsTab; label: string; icon: typeof Key }[] = [
        { id: 'api', label: 'Kunci API', icon: Key },
        { id: 'model', label: 'Model Gemini', icon: Cpu },
        { id: 'usage', label: 'Pemakaian', icon: BarChart3 },
        { id: 'data', label: 'Data', icon: Shield },
    ]

    return (
        <div className="relative flex min-h-full flex-1 flex-col bg-[#050505]">
            <div
                className="pointer-events-none fixed inset-x-0 top-0 h-[380px] bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(34,197,94,0.1),transparent_55%)]"
                aria-hidden
            />

            <div className="relative w-full min-w-0 flex-1 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
                {/* Header — selaras TikTok / dashboard */}
                <header className="mb-6 border-b border-[#1a1a1a] pb-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500/90">
                                RestoreGen
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Pengaturan</h1>
                            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-zinc-500">
                                Kelola kunci API, model Gemini, dan statistik pemakaian. Data hanya tersimpan di browser Anda.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg border border-[#2a2a2e] bg-[#121214] px-3 py-1.5 text-[11px] font-medium text-zinc-400">
                                Penyimpanan lokal
                            </span>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[12px] font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                            >
                                <LayoutDashboard className="size-3.5" />
                                Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Tabs */}
                    <nav className="mt-6 flex gap-1 overflow-x-auto pb-px scrollbar-none" aria-label="Bagian pengaturan">
                        {tabs.map(({ id, label, icon: Icon }) => {
                            const active = activeTab === id
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setActiveTab(id)}
                                    className={cn(
                                        'flex shrink-0 items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-[13px] font-semibold transition-colors',
                                        active
                                            ? 'border-emerald-500 text-emerald-400'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                    )}
                                >
                                    <Icon className="size-3.5 opacity-90" />
                                    {label}
                                </button>
                            )
                        })}
                    </nav>
                </header>

                {/* Tab panels */}
                <div className="mx-auto max-w-4xl space-y-6">
                    {activeTab === 'api' && (
                        <div className="space-y-5">
                            <div className="flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-[13px] text-amber-200/95">
                                <AlertTriangle className="size-4 shrink-0 text-amber-400" />
                                <p>
                                    API key hanya ada di perangkat ini. Jangan dipakai di komputer publik atau layar yang bisa
                                    dilihat orang lain.
                                </p>
                            </div>

                            <section className={cardClass}>
                                <div className="border-b border-[#1a1a1a] bg-[#0f0f12] px-4 py-3">
                                    <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                                        <Key className="size-4 text-amber-400" />
                                        Gemini API Keys
                                    </h2>
                                    <p className="mt-0.5 text-[11px] text-zinc-500">
                                        {savedGeminiCount > 0 ? (
                                            <span className="text-emerald-400/95">{savedGeminiCount} key tersimpan — rotasi otomatis</span>
                                        ) : (
                                            'Belum ada key tersimpan'
                                        )}
                                    </p>
                                </div>
                                <div className="space-y-3 p-4">
                                    <a
                                        href="https://aistudio.google.com/app/apikey"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[12px] font-medium text-amber-400/90 hover:text-amber-300"
                                    >
                                        Dapatkan key <ExternalLink className="size-3" />
                                    </a>
                                    {geminiInputs.map((key, idx) => (
                                        <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                            <input
                                                type="password"
                                                value={key}
                                                onChange={(e) => updateGeminiKey(idx, e.target.value)}
                                                placeholder={`Gemini API key ${idx + 1}`}
                                                className={inputClass}
                                            />
                                            <div className="flex shrink-0 items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleTestGemini(idx)}
                                                    disabled={testingIdx === idx || !key.trim()}
                                                    className="flex items-center gap-1.5 rounded-lg border border-[#2a2a2e] px-3 py-2 text-[11px] font-medium text-zinc-400 transition hover:bg-[#1a1a1e] disabled:opacity-40"
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
                                                        className="rounded-lg p-2 text-zinc-600 hover:bg-[#1a1a1e] hover:text-red-400"
                                                        aria-label="Hapus baris"
                                                    >
                                                        <X className="size-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addGeminiKey}
                                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 hover:text-amber-400"
                                    >
                                        <Plus className="size-3.5" /> Tambah key Gemini
                                    </button>
                                    <p className="text-[11px] text-zinc-600">
                                        Jika quota habis, sistem mencoba key berikutnya. Key dari{' '}
                                        <span className="text-zinc-400">Google AI Studio</span> (biasanya{' '}
                                        <code className="text-amber-500/90">AIza</code>).
                                    </p>
                                </div>
                            </section>

                            <section className={cardClass}>
                                <div className="border-b border-[#1a1a1a] bg-[#0f0f12] px-4 py-3">
                                    <h2 className="flex flex-wrap items-center gap-2 text-sm font-bold text-zinc-100">
                                        <Key className="size-4 text-emerald-400" />
                                        OpenAI API Keys
                                        <span className="text-[10px] font-normal text-zinc-500">(cadangan)</span>
                                    </h2>
                                    <p className="mt-0.5 text-[11px] text-zinc-500">
                                        {savedOpenAICount > 0 ? (
                                            <span className="text-emerald-400/95">{savedOpenAICount} key tersimpan</span>
                                        ) : (
                                            'Belum ada key tersimpan'
                                        )}
                                    </p>
                                </div>
                                <div className="space-y-3 p-4">
                                    <a
                                        href="https://platform.openai.com/api-keys"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-400/90 hover:text-emerald-300"
                                    >
                                        Dapatkan key <ExternalLink className="size-3" />
                                    </a>
                                    {openaiInputs.map((key, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="password"
                                                value={key}
                                                onChange={(e) => updateOpenAIKey(idx, e.target.value)}
                                                placeholder={`OpenAI API key ${idx + 1} (sk-...)`}
                                                className={inputClass}
                                            />
                                            {openaiInputs.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeOpenAIKey(idx)}
                                                    className="shrink-0 rounded-lg p-2 text-zinc-600 hover:bg-[#1a1a1e] hover:text-red-400"
                                                    aria-label="Hapus baris"
                                                >
                                                    <X className="size-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addOpenAIKey}
                                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 hover:text-emerald-400"
                                    >
                                        <Plus className="size-3.5" /> Tambah key OpenAI
                                    </button>
                                </div>
                            </section>

                            <section className={cardClass}>
                                <div className="border-b border-[#1a1a1a] bg-[#0f0f12] px-4 py-3">
                                    <h2 className="flex flex-wrap items-center gap-2 text-sm font-bold text-zinc-100">
                                        <Key className="size-4 text-cyan-400" />
                                        Stability AI
                                        <span className="text-[10px] font-normal text-zinc-500">(gambar)</span>
                                    </h2>
                                </div>
                                <div className="p-4">
                                    <a
                                        href="https://platform.stability.ai/account/keys"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-cyan-400/90 hover:text-cyan-300"
                                    >
                                        Dapatkan key <ExternalLink className="size-3" />
                                    </a>
                                    <span
                                        className={`mb-2 block text-[11px] font-medium ${apiKeys.imagen ? 'text-emerald-400' : 'text-zinc-500'}`}
                                    >
                                        {apiKeys.imagen ? '✓ Key tersimpan' : 'Belum dikonfigurasi'}
                                    </span>
                                    <input
                                        type="password"
                                        value={stabilityInput}
                                        onChange={(e) => setStabilityInput(e.target.value)}
                                        placeholder={apiKeys.imagen ? '••••••••••••••••' : 'Tempel key baru'}
                                        className={inputClass}
                                    />
                                </div>
                            </section>

                            <section className={cardClass}>
                                <div className="border-b border-[#1a1a1a] bg-[#0f0f12] px-4 py-3">
                                    <h2 className="flex flex-wrap items-center gap-2 text-sm font-bold text-zinc-100">
                                        <Key className="size-4 text-violet-400" />
                                        Groq API Keys
                                        <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-400">
                                            GRATIS
                                        </span>
                                    </h2>
                                    <p className="mt-0.5 text-[11px] text-zinc-500">Backup cepat — 14.400 req/hari gratis</p>
                                </div>
                                <div className="space-y-3 p-4">
                                    <a
                                        href="https://console.groq.com/keys"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[12px] font-medium text-violet-400/90 hover:text-violet-300"
                                    >
                                        Dapatkan key <ExternalLink className="size-3" />
                                    </a>
                                    {groqInputs.map((key, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="password"
                                                value={key}
                                                onChange={(e) => updateGroqKey(idx, e.target.value)}
                                                placeholder={`Groq API key ${idx + 1} (gsk_...)`}
                                                className={inputClass}
                                            />
                                            {groqInputs.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeGroqKey(idx)}
                                                    className="shrink-0 rounded-lg p-2 text-zinc-600 hover:bg-[#1a1a1e] hover:text-red-400"
                                                    aria-label="Hapus baris"
                                                >
                                                    <X className="size-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addGroqKey}
                                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 hover:text-violet-400"
                                    >
                                        <Plus className="size-3.5" /> Tambah key Groq
                                    </button>
                                    <p className="text-[11px] text-zinc-600">Urutan: Gemini → Groq → OpenAI</p>
                                </div>
                            </section>

                            <section className={cardClass}>
                                <div className="border-b border-[#1a1a1a] bg-[#0f0f12] px-4 py-3">
                                    <h2 className="flex flex-wrap items-center gap-2 text-sm font-bold text-zinc-100">
                                        <Key className="size-4 text-sky-400" />
                                        Hugging Face token
                                        <span className="text-[10px] font-normal text-zinc-500">
                                            (video gratis — Inference Providers)
                                        </span>
                                    </h2>
                                    <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
                                        Untuk <span className="text-zinc-400">Generate video</span> di TikTok Affiliate tanpa
                                        saldo fal.ai: pakai token HF dengan izin{' '}
                                        <span className="text-zinc-400">Make calls to Inference Providers</span>. Kuota
                                        mengikuti akun Hugging Face (biasanya ada tier gratis).
                                    </p>
                                </div>
                                <div className="p-4">
                                    <a
                                        href="https://huggingface.co/settings/tokens/new?ownUserPermissions=inference.serverless.write&tokenType=fineGrained"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-sky-400/90 hover:text-sky-300"
                                    >
                                        Buat token (centang Inference Providers){' '}
                                        <ExternalLink className="size-3" />
                                    </a>
                                    <span
                                        className={`mb-2 block text-[11px] font-medium ${apiKeys.huggingface ? 'text-emerald-400' : 'text-zinc-500'}`}
                                    >
                                        {apiKeys.huggingface ? '✓ Token tersimpan' : 'Belum dikonfigurasi'}
                                    </span>
                                    <input
                                        type="password"
                                        value={huggingfaceInput}
                                        onChange={(e) => setHuggingfaceInput(e.target.value)}
                                        placeholder={apiKeys.huggingface ? '••••••••••••••••' : 'Tempel hf_...'}
                                        className={inputClass}
                                        autoComplete="off"
                                    />
                                    <p className="mt-2 text-[11px] text-zinc-600">
                                        Jika token ini ada, app memakai HF untuk video (bukan fal). Hapus token HF jika
                                        ingin kembali memakai fal.ai saja.
                                    </p>
                                </div>
                            </section>

                            <section className={cardClass}>
                                <div className="border-b border-[#1a1a1a] bg-[#0f0f12] px-4 py-3">
                                    <h2 className="flex flex-wrap items-center gap-2 text-sm font-bold text-zinc-100">
                                        <Key className="size-4 text-fuchsia-400" />
                                        fal.ai API Key
                                        <span className="text-[10px] font-normal text-zinc-500">(video / image, berbayar)</span>
                                    </h2>
                                    <p className="mt-0.5 text-[11px] text-zinc-500">
                                        Dipakai header{' '}
                                        <code className="text-fuchsia-400/90">Authorization: Key …</code> — simpan lalu
                                        integrasikan dari kode Anda.
                                    </p>
                                </div>
                                <div className="p-4">
                                    <a
                                        href="https://fal.ai/dashboard/keys"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-fuchsia-400/90 hover:text-fuchsia-300"
                                    >
                                        Dapatkan key di fal.ai <ExternalLink className="size-3" />
                                    </a>
                                    <span
                                        className={`mb-2 block text-[11px] font-medium ${apiKeys.fal ? 'text-emerald-400' : 'text-zinc-500'}`}
                                    >
                                        {apiKeys.fal ? '✓ Key tersimpan' : 'Belum dikonfigurasi'}
                                    </span>
                                    <input
                                        type="password"
                                        value={falInput}
                                        onChange={(e) => setFalInput(e.target.value)}
                                        placeholder={apiKeys.fal ? '••••••••••••••••' : 'Tempel API key fal.ai'}
                                        className={inputClass}
                                        autoComplete="off"
                                    />
                                    <p className="mt-2 text-[11px] text-zinc-600">
                                        Key hanya disimpan di perangkat ini (sama seperti provider lain di halaman ini).
                                    </p>
                                </div>
                            </section>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-[#052e16] shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                                >
                                    <CheckCircle2 className="size-4" />
                                    Simpan kunci API
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        clearApiKeys()
                                        setGeminiInputs([''])
                                        setOpenaiInputs([''])
                                        setGroqInputs([''])
                                        setStabilityInput('')
                                        setHuggingfaceInput('')
                                        setFalInput('')
                                    }}
                                    className="rounded-xl border border-red-500/35 bg-red-500/10 px-6 py-3.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                                >
                                    Hapus semua key
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'model' && (
                        <section className={cardClass}>
                            <div className="border-b border-[#1a1a1a] bg-[#0f0f12] px-4 py-3">
                                <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                                    <Sparkles className="size-4 text-emerald-400" />
                                    Model Gemini utama
                                </h2>
                                <p className="mt-0.5 text-[11px] text-zinc-500">
                                    Dipakai untuk generate di app. Fallback otomatis jika quota habis.
                                </p>
                            </div>
                            <div className="space-y-2 p-4">
                                {GEMINI_MODELS.map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => handleSaveModel(m.id)}
                                        className={cn(
                                            'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all',
                                            preferredModel === m.id
                                                ? 'border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/20'
                                                : 'border-[#2a2a2e] bg-[#0d0d10] hover:border-zinc-600'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'mt-1 size-3 shrink-0 rounded-full border-2',
                                                preferredModel === m.id ? 'border-emerald-400 bg-emerald-400' : 'border-zinc-600'
                                            )}
                                        />
                                        <div className="min-w-0">
                                            <p
                                                className={cn(
                                                    'text-[13px] font-semibold',
                                                    preferredModel === m.id ? 'text-emerald-300' : 'text-zinc-200'
                                                )}
                                            >
                                                {m.label}
                                            </p>
                                            <p className="text-[11px] text-zinc-500">{m.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {activeTab === 'usage' && (
                        <section className={cardClass}>
                            <div className="border-b border-[#1a1a1a] bg-[#0f0f12] px-4 py-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                                            <BarChart3 className="size-4 text-zinc-400" />
                                            Pemakaian API (lokal)
                                        </h2>
                                        <p className="mt-0.5 text-[11px] text-zinc-500">Hitung permintaan sukses dari app ini saja.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetApiUsage()
                                            toast({ title: 'Statistik pemakaian direset', variant: 'default' })
                                        }}
                                        className="text-[11px] font-medium text-zinc-500 underline-offset-2 hover:text-emerald-400 hover:underline"
                                    >
                                        Reset statistik
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-2 sm:gap-3">
                                {(Object.keys(USAGE_LABELS) as ApiUsageProvider[]).map((p) => {
                                    const u = apiUsage?.[p] ?? { requests: 0, lastAt: null }
                                    return (
                                        <div
                                            key={p}
                                            className="rounded-xl border border-[#2a2a2e] bg-[#0d0d10] px-3 py-3"
                                        >
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                                                {USAGE_LABELS[p]}
                                            </p>
                                            <p className="mt-1 text-xl font-bold tabular-nums text-zinc-100">{u.requests}</p>
                                            <p className="text-[10px] text-zinc-600">{formatLastUsed(u.lastAt)}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {activeTab === 'data' && (
                        <section className="overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-b from-red-950/30 to-[#121214]">
                            <div className="border-b border-red-500/20 bg-red-950/20 px-4 py-3">
                                <h2 className="text-sm font-bold text-red-300">Zona berbahaya</h2>
                                <p className="mt-0.5 text-[11px] text-zinc-500">
                                    Menghapus semua data aplikasi di browser ini: project, template, dan API key. Tidak bisa
                                    dibatalkan.
                                </p>
                            </div>
                            <div className="p-4">
                                {!confirmReset ? (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmReset(true)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 sm:w-auto sm:px-6"
                                    >
                                        <Trash2 className="size-4" /> Reset semua data aplikasi
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-[13px] font-medium text-red-200">Yakin? Tindakan ini permanen.</p>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setConfirmReset(false)}
                                                className="rounded-xl border border-[#2a2a2e] px-4 py-2.5 text-sm text-zinc-300 hover:bg-[#1a1a1e]"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleResetApp}
                                                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-400"
                                            >
                                                Ya, reset
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
}
