'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
    Video,
    TrendingUp,
    Copy,
    Download,
    Sparkles,
    Users,
    RefreshCw,
    Loader2,
    BookOpen,
    Settings,
    Play,
    Smartphone,
    Monitor,
    Zap,
    ChevronRight,
    Film,
    Cpu,
    Sliders,
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { ContentTemplates, ContentTemplate } from '@/components/tiktok-affiliate/ContentTemplates'
import { cn } from '@/lib/utils'
import { cardBodyPad, cardHeaderBar, cardSurface, inputField, pageGradient, shellBg } from '@/lib/uiTokens'
import useAppStore from '@/store/useAppStore'
import { parseKeys } from '@/lib/keyRotation'
import {
    aggregateAiUsage,
    generateTikTokAffiliateIndonesiaAI,
    type AiTokenUsageMeta,
} from '@/lib/gemini'
import {
    generateLocalIndonesiaBundle,
    splitRencanaShotIntoClips,
    type CharacterExpressionPreset,
    type ContentScenePreset,
    type TikTokLocalInput,
    type TikTokLocalResult,
    type TikTokPlatform,
    type TikTokTone,
    type VideoAudioMode,
    type WearableInVideo,
} from '@/lib/tiktokAffiliateIndonesia'

const EMPTY_TIKTOK_RESULT: TikTokLocalResult = {
    hook: '',
    caption: '',
    hashtags: [],
    callToAction: '',
    shootingTip: '',
    videoPrompt: '',
    rencanaShot: '',
}
import { countTokensCl100k } from '@/lib/tokenCount'

export default function TikTokAffiliatePage() {
    const [productInfo, setProductInfo] = useState({
        name: '',
        category: 'fashion',
        price: '',
        features: '',
        targetAudience: 'young_adults',
        brand: '',
        /** Apa yang ditonjol di video: baju, celana, sepatu, … */
        wearableItem: 'baju' as WearableInVideo,
        /** Siapa yang memakai produk di video (talent/model). */
        whoInVideo: '',
        /** Konteks adegan: OOTD cermin, street, dll. */
        scenePreset: 'bebas' as ContentScenePreset,
        /** Ekspresi wajah talent di video. */
        expressionPreset: 'natural' as CharacterExpressionPreset,
        /** Catatan ekspresi/pose tambahan (opsional). */
        expressionNote: '',
    })

    const [generatedVariants, setGeneratedVariants] = useState<TikTokLocalResult[]>([])
    const [activeVariantIndex, setActiveVariantIndex] = useState(0)
    /** 1–3: tiap slot = pose & sudut kamera berbeda (lokal & API). */
    const [variantCount, setVariantCount] = useState<1 | 2 | 3>(1)

    const [isGenerating, setIsGenerating] = useState(false)
    const [copiedSection, setCopiedSection] = useState('')
    const [activeTab, setActiveTab] = useState<'generator' | 'templates'>('generator')
    /** Lokal = algoritma bawaan app (tanpa biaya API). API = Gemini/Groq/OpenAI dari Pengaturan. */
    const [generationSource, setGenerationSource] = useState<'lokal' | 'api'>('lokal')
    const [genMode, setGenMode] = useState<'quick' | 'full'>('full')
    const [scriptFormat, setScriptFormat] = useState<'portrait' | 'landscape'>('portrait')
    const [tone, setTone] = useState<TikTokTone>('casual')
    const [platform, setPlatform] = useState<TikTokPlatform>('tiktok_shop')
    const [lastSource, setLastSource] = useState<'ai' | 'lokal' | null>(null)
    /** Hanya untuk mode API: Standard = hemat, Pro = instruksi lebih kaya. */
    const [apiQuality, setApiQuality] = useState<'standard' | 'pro'>('standard')
    /** Total durasi video target; dibagi per segmen `CLIP_SEGMENT_SECONDS` (pihak ketiga). */
    const CLIP_SEGMENT_SECONDS = 8
    const [videoDurationSeconds, setVideoDurationSeconds] = useState<
        8 | 16 | 24 | 32 | 40 | 48 | 56 | 64
    >(8)
    /** `silent` = tanpa bicara/VO (default, hemat token di app video). `voice_id` = narasi singkat BI. */
    const [videoAudioMode, setVideoAudioMode] = useState<VideoAudioMode>('silent')
    /** Token terakhir dari panggilan API (prompt/completion/total). */
    const [lastApiUsage, setLastApiUsage] = useState<AiTokenUsageMeta | null>(null)

    const [falVideoLoading, setFalVideoLoading] = useState(false)
    const [falVideoUrl, setFalVideoUrl] = useState<string | null>(null)
    const [falVideoError, setFalVideoError] = useState<string | null>(null)

    const { apiKeys, recordApiUsage } = useAppStore()

    function revokeVideoUrlIfBlob(url: string | null) {
        if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
    }

    useEffect(() => {
        return () => revokeVideoUrlIfBlob(falVideoUrl)
    }, [falVideoUrl])
    const { toast } = useToast()

    const hasAiKeys = useMemo(
        () =>
            parseKeys(apiKeys.gemini).length > 0 ||
            parseKeys(apiKeys.openai).length > 0 ||
            parseKeys(apiKeys.groq).length > 0,
        [apiKeys.gemini, apiKeys.openai, apiKeys.groq]
    )

    useEffect(() => {
        if (!hasAiKeys && generationSource === 'api') setGenerationSource('lokal')
    }, [hasAiKeys, generationSource])

    const generatedContent = useMemo(() => {
        if (generatedVariants.length === 0) return EMPTY_TIKTOK_RESULT
        const idx = Math.min(Math.max(0, activeVariantIndex), generatedVariants.length - 1)
        return generatedVariants[idx]!
    }, [generatedVariants, activeVariantIndex])

    const handleSelectTemplate = (template: ContentTemplate) => {
        setProductInfo({
            ...productInfo,
            name: template.name,
            category: template.category,
        })
        setGeneratedVariants([
            {
                hook: template.hook,
                caption: template.caption,
                hashtags: template.hashtags,
                callToAction: '',
                shootingTip: '',
                videoPrompt: '',
                rencanaShot: '',
            },
        ])
        setActiveVariantIndex(0)
        setLastSource('lokal')
        setActiveTab('generator')
    }

    const categories = [
        { value: 'fashion', label: 'Fashion & gaya', icon: '👗' },
        { value: 'tech', label: 'Teknologi & gadget', icon: '📱' },
        { value: 'health', label: 'Kesehatan & olahraga', icon: '💪' },
        { value: 'food', label: 'Makanan & minuman', icon: '🍔' },
        { value: 'home', label: 'Rumah tangga', icon: '🏠' },
        { value: 'beauty', label: 'Kecantikan & skincare', icon: '💄' },
    ]

    const audiences = [
        { value: 'teens', label: 'Remaja (13–17)', icon: '👦' },
        { value: 'young_adults', label: 'Usia muda (18–25)', icon: '👩' },
        { value: 'adults', label: 'Dewasa (26–40)', icon: '👨' },
        { value: 'mature', label: 'Adult 40+', icon: '👴' },
    ]

    const wearableOptions: { value: WearableInVideo; label: string }[] = [
        { value: 'baju', label: 'Baju / atasan' },
        { value: 'celana', label: 'Celana' },
        { value: 'sepatu', label: 'Sepatu' },
        { value: 'aksesoris', label: 'Aksesoris' },
        { value: 'lainnya', label: 'Lainnya (produk umum)' },
    ]

    const scenePresetOptions: { value: ContentScenePreset; label: string; hint: string }[] = [
        { value: 'bebas', label: 'Bebas', hint: 'Ikuti produk & wearable saja' },
        { value: 'ootd_mirror', label: 'OOTD cermin', hint: 'Selfie depan kaca full body' },
        { value: 'ootd_street', label: 'OOTD jalan', hint: 'Outdoor / urban' },
        { value: 'unboxing', label: 'Unboxing', hint: 'Meja + buka kotak' },
        { value: 'flatlay', label: 'Flat lay', hint: 'Overhead styling' },
        { value: 'detail_product', label: 'Detail produk', hint: 'Macro, minim wajah' },
    ]

    const expressionOptions: { value: CharacterExpressionPreset; label: string }[] = [
        { value: 'natural', label: 'Natural' },
        { value: 'smile', label: 'Senyum ramah' },
        { value: 'soft_smile', label: 'Senyum tipis' },
        { value: 'neutral', label: 'Netral / cool' },
        { value: 'confident', label: 'Percaya diri' },
        { value: 'playful', label: 'Ceria / playful' },
    ]

    function buildLocalInput(): TikTokLocalInput {
        return {
            productName: productInfo.name.trim(),
            category: productInfo.category,
            priceHint: productInfo.price,
            features: productInfo.features,
            targetAudience: productInfo.targetAudience,
            brand: productInfo.brand,
            tone,
            platform,
            mode: genMode,
            screenFormat: scriptFormat,
            wearableItem: productInfo.wearableItem,
            whoInVideo: productInfo.whoInVideo,
            scenePreset: productInfo.scenePreset,
            expressionPreset: productInfo.expressionPreset,
            expressionNote: productInfo.expressionNote,
            clipSegmentSeconds: CLIP_SEGMENT_SECONDS,
            durationSeconds: videoDurationSeconds,
            videoAudioMode,
        }
    }

    const handleGenerate = async () => {
        if (!productInfo.name.trim()) return

        setIsGenerating(true)
        setFalVideoUrl((prev) => {
            revokeVideoUrlIfBlob(prev)
            return null
        })
        setFalVideoError(null)
        const input = buildLocalInput()
        const n = variantCount

        const useApi = generationSource === 'api' && hasAiKeys

        try {
            if (useApi) {
                const results: TikTokLocalResult[] = []
                const usages: AiTokenUsageMeta[] = []
                for (let i = 0; i < n; i++) {
                    const { result: ai, usage } = await generateTikTokAffiliateIndonesiaAI(
                        apiKeys.gemini,
                        input,
                        apiKeys.openai,
                        apiKeys.groq,
                        { quality: apiQuality, variantIndex: i, variantTotal: n }
                    )
                    results.push({
                        hook: ai.hook,
                        caption: genMode === 'quick' ? '' : ai.caption,
                        hashtags: ai.hashtags,
                        callToAction: ai.callToAction,
                        shootingTip: ai.shootingTip,
                        videoPrompt: ai.videoPrompt,
                        rencanaShot: ai.rencanaShot,
                    })
                    usages.push(usage)
                }
                setGeneratedVariants(results)
                setActiveVariantIndex(0)
                setLastSource('ai')
                setLastApiUsage(aggregateAiUsage(usages))
            } else {
                const results = Array.from({ length: n }, (_, i) => generateLocalIndonesiaBundle(input, i))
                setGeneratedVariants(results)
                setActiveVariantIndex(0)
                setLastSource('lokal')
                setLastApiUsage(null)
            }
        } catch {
            const results = Array.from({ length: n }, (_, i) => generateLocalIndonesiaBundle(input, i))
            setGeneratedVariants(results)
            setActiveVariantIndex(0)
            setLastSource('lokal')
            setLastApiUsage(null)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleCopy = (content: string, section: string) => {
        navigator.clipboard.writeText(content)
        setCopiedSection(section)
        setTimeout(() => setCopiedSection(''), 2000)
    }

    const buildExportBlock = (g: TikTokLocalResult, variantLabel: string | null) => {
        const head = variantLabel ? `\n${variantLabel}\n` : '\n'
        return `${head}---
HOOK: ${g.hook}

CAPTION: ${g.caption}

HASHTAG: ${g.hashtags.join(' ')}

CTA: ${g.callToAction}

TIPS SYUTING: ${g.shootingTip}

--- PROMPT VIDEO (Bahasa Indonesia — AI video / briefing) ---
${g.videoPrompt}

--- RENCANA SHOT (pose, zoom, sudut, gerakan kamera) ---
${g.rencanaShot}
`
    }

    const handleExport = () => {
        const meta = `🎯 TIKTOK AFFILIATE (Indonesia) — RestoreGen

PRODUK: ${productInfo.name}
KATEGORI: ${productInfo.category}
AUDIENS: ${productInfo.targetAudience}
PLATFORM: ${platform}
NADA: ${tone}
FORMAT: ${scriptFormat === 'portrait' ? '9:16 (vertikal)' : '16:9 (landscape)'}
PRODUK DI VIDEO: ${productInfo.wearableItem}
SIAPA PAKAI: ${productInfo.whoInVideo || '-'}
GAYA ADEGAN: ${productInfo.scenePreset}
EKSPRESI: ${productInfo.expressionPreset}${productInfo.expressionNote.trim() ? ` · ${productInfo.expressionNote.trim()}` : ''}
`

        const multi = generatedVariants.length > 1
        const blocks = generatedVariants.map((g, i) =>
            buildExportBlock(g, multi ? `========== VARIAN ${i + 1} ==========` : null)
        )

        const content = `${meta}
${blocks.join('\n')}
---
Dibuat dengan RestoreGen
`.trim()

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tiktok-affiliate-${productInfo.name.toLowerCase().replace(/\s+/g, '-')}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    const combinedPreview = [
        generatedContent.hook,
        generatedContent.caption,
        generatedContent.hashtags.join(' '),
        generatedContent.callToAction,
        generatedContent.shootingTip ? `Tips syuting: ${generatedContent.shootingTip}` : '',
        generatedContent.videoPrompt ? `Prompt video:\n${generatedContent.videoPrompt}` : '',
        generatedContent.rencanaShot ? `Rencana shot:\n${generatedContent.rencanaShot}` : '',
    ]
        .filter(Boolean)
        .join('\n\n')

    /** Hanya prompt video (untuk tempel ke generator video / hemat token). */
    const videoBundleText = useMemo(
        () => generatedContent.videoPrompt.trim(),
        [generatedContent.videoPrompt]
    )

    const videoTokenCount = useMemo(() => countTokensCl100k(videoBundleText), [videoBundleText])

    const clipShotSegments = useMemo(
        () => splitRencanaShotIntoClips(generatedContent.rencanaShot),
        [generatedContent.rencanaShot]
    )

    /** Per klip: hanya teks rencana shot segmen (prompt video disalin sekali dari tombol utama). */
    const clipPasteBundles = useMemo(
        () => clipShotSegments.map((seg) => seg.text),
        [clipShotSegments]
    )

    const showPerClipCopy = clipShotSegments.length > 1

    async function handleFalGenerateVideo() {
        const hfKey = apiKeys.huggingface?.trim()
        const falKey = apiKeys.fal?.trim()
        if (!hfKey && !falKey) {
            toast({
                title: 'Belum ada token untuk video',
                description:
                    'Isi token Hugging Face (gratis, kuota HF) atau key fal.ai di Pengaturan → Kunci API.',
                variant: 'destructive',
            })
            return
        }
        const prompt =
            generatedContent.videoPrompt?.trim() ||
            [generatedContent.hook, productInfo.name.trim(), generatedContent.caption].filter(Boolean).join('\n\n').trim()
        if (!prompt) {
            toast({
                title: 'Tidak ada teks untuk video',
                description: 'Generate skrip konten dulu.',
                variant: 'destructive',
            })
            return
        }
        setFalVideoLoading(true)
        setFalVideoError(null)
        setFalVideoUrl((prev) => {
            revokeVideoUrlIfBlob(prev)
            return null
        })
        try {
            if (hfKey) {
                const res = await fetch('/api/hf/video', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey: hfKey, prompt }),
                })
                const ct = res.headers.get('content-type') ?? ''
                if (!res.ok) {
                    const data = (await res.json().catch(() => ({}))) as { error?: string }
                    throw new Error(typeof data.error === 'string' ? data.error : `HTTP ${res.status}`)
                }
                if (!ct.includes('video')) {
                    throw new Error('Respons server bukan video (pastikan token punya izin Inference Providers).')
                }
                const blob = await res.blob()
                setFalVideoUrl(URL.createObjectURL(blob))
                recordApiUsage('huggingface')
                toast({
                    title: 'Video berhasil dibuat',
                    description: 'Hugging Face Inference (WaveSpeed) — memakai kuota gratis HF, bukan saldo fal.ai.',
                    variant: 'default',
                })
            } else {
                const res = await fetch('/api/fal/video', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey: falKey, prompt }),
                })
                const data = (await res.json()) as { ok?: boolean; error?: string; videoUrl?: string }
                if (!res.ok || !data.ok) {
                    throw new Error(typeof data.error === 'string' ? data.error : `HTTP ${res.status}`)
                }
                if (!data.videoUrl) throw new Error('URL video tidak ada')
                setFalVideoUrl(data.videoUrl)
                recordApiUsage('fal')
                toast({
                    title: 'Video berhasil dibuat',
                    description: 'Model fal.ai Vidu Q2 · 9:16 · cek saldo di dashboard fal.',
                    variant: 'default',
                })
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Gagal'
            setFalVideoError(msg)
            toast({ title: 'Video gagal', description: msg, variant: 'destructive' })
        } finally {
            setFalVideoLoading(false)
        }
    }

    const hasOutput = generatedVariants.length > 0 && Boolean(generatedVariants[0]?.hook)
    const contentCount = hasOutput ? generatedVariants.length : 0

    const inputClass = inputField('fuchsia')

    return (
        <div className={cn('relative flex min-h-0 flex-1 flex-col', shellBg)}>
            <div className={pageGradient.fuchsia} aria-hidden />

            <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-0 lg:flex-row">
                {/* —— Main column (center) —— */}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto border-b border-[#1f1f24] lg:border-b-0 lg:border-r lg:border-[#1f1f24]">
                    <header className="border-b border-[#1a1a1a] px-4 py-5 sm:px-8">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-fuchsia-500/90">
                            RestoreGen
                        </p>
                        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                            TikTok <span className="text-fuchsia-400">Affiliate</span>
                        </h1>
                        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-zinc-500">
                            Halaman ini hanya untuk <span className="text-zinc-400">affiliate TikTok Indonesia</span> — tidak
                            dicampur dengan generator restorasi / fitur lain. Prompt video diarahkan ke gaya UGC{' '}
                            <span className="text-zinc-400">fotorealistik</span> (bukan kartun/CGI). Pilih sumber di panel
                            kanan: <span className="text-zinc-400">lokal</span> (tanpa API, hemat token) atau{' '}
                            <span className="text-zinc-400">API</span> (variasi AI) jika key sudah di Pengaturan.
                        </p>

                        <div className={cn(cardSurface, 'mt-5 flex flex-wrap gap-1 p-1')}>
                            {(
                                [
                                    ['generator', Sparkles, 'Generator'],
                                    ['templates', BookOpen, 'Template'],
                                ] as const
                            ).map(([id, Icon, label]) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setActiveTab(id)}
                                    className={cn(
                                        'flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold transition-all sm:flex-none sm:px-5',
                                        activeTab === id
                                            ? 'bg-fuchsia-500 text-[#140514] shadow-lg shadow-fuchsia-500/25'
                                            : 'text-zinc-500 hover:bg-[#1a1a1e] hover:text-zinc-300'
                                    )}
                                >
                                    <Icon className="size-3.5 shrink-0" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </header>

                    <div className="flex-1 space-y-6 px-4 py-6 sm:px-8 lg:pb-10">
                        {activeTab === 'generator' && (
                            <>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                                            Output ({contentCount})
                                        </h2>
                                        {hasOutput && lastSource && (
                                            <span
                                                className={cn(
                                                    'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                                                    lastSource === 'ai'
                                                        ? 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30'
                                                        : 'bg-zinc-700/80 text-zinc-300 ring-1 ring-zinc-600'
                                                )}
                                            >
                                                {lastSource === 'ai' ? 'AI' : 'Lokal'}
                                            </span>
                                        )}
                                    </div>
                                    {hasOutput && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(combinedPreview, 'all')}
                                            className="flex items-center gap-1.5 rounded-xl border border-fuchsia-500/35 bg-fuchsia-500/10 px-3 py-1.5 text-[11px] font-bold text-fuchsia-300 transition hover:bg-fuchsia-500/20"
                                        >
                                            <Copy className="size-3" />
                                            {copiedSection === 'all' ? 'Disalin' : 'Salin semua'}
                                        </button>
                                    )}
                                </div>

                                {generatedVariants.length > 1 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {generatedVariants.map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setActiveVariantIndex(i)}
                                                className={cn(
                                                    'rounded-lg px-3 py-1.5 text-[11px] font-bold transition',
                                                    activeVariantIndex === i
                                                        ? 'bg-fuchsia-500 text-[#140514] shadow-md shadow-fuchsia-500/25'
                                                        : 'border border-zinc-600 bg-[#121214] text-zinc-400 hover:border-zinc-500 hover:text-zinc-300'
                                                )}
                                            >
                                                Varian {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {!hasOutput ? (
                                    <div
                                        className={cn(
                                            cardSurface,
                                            'flex min-h-[260px] flex-col items-center justify-center border-dashed border-fuchsia-500/20 bg-[#0f0f12] px-6 py-12 text-center'
                                        )}
                                    >
                                        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/10 ring-1 ring-fuchsia-500/25">
                                            <Video className="size-8 text-fuchsia-400/90" />
                                        </div>
                                        <p className="text-sm font-semibold text-zinc-300">Belum ada konten</p>
                                        <p className="mt-2 max-w-sm text-[13px] text-zinc-500">
                                            Isi detail produk di panel kanan, pilih mode & format, lalu tekan{' '}
                                            <span className="font-medium text-fuchsia-400">Generate</span>.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {/* "Video card" style preview */}
                                        <div className={cardSurface}>
                                            <div className="relative aspect-video max-h-[220px] bg-gradient-to-br from-fuchsia-950/40 via-[#0f0f12] to-[#0a0a0c] sm:max-h-none">
                                                <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/55 px-2 py-1 text-[10px] font-semibold text-zinc-300 backdrop-blur-sm">
                                                    Pratinjau
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="flex size-14 items-center justify-center rounded-full bg-fuchsia-500 text-[#140514] shadow-lg shadow-fuchsia-500/35 ring-4 ring-black/40">
                                                        <Play className="size-7 fill-current" />
                                                    </div>
                                                </div>
                                                <p className="absolute bottom-3 left-3 right-3 line-clamp-2 text-center text-[11px] font-medium text-zinc-500">
                                                    Pratinjau visual — fokus ke skrip di bawah untuk posting
                                                </p>
                                            </div>
                                            <div className="space-y-3 border-t border-[#1a1a1a] p-4">
                                                <p className="text-[13px] leading-relaxed text-zinc-300">{generatedContent.hook}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleExport}
                                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-fuchsia-500 py-2.5 text-sm font-bold text-[#140514] shadow-md shadow-fuchsia-500/25 transition hover:bg-fuchsia-400 sm:flex-none sm:px-6"
                                                    >
                                                        <Download className="size-4" />
                                                        Unduh .txt
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(combinedPreview, 'block')}
                                                        className="flex items-center justify-center gap-2 rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20"
                                                    >
                                                        <Copy className="size-4" />
                                                        {copiedSection === 'block' ? 'Disalin' : 'Salin blok'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleFalGenerateVideo()}
                                                        disabled={
                                                            falVideoLoading ||
                                                            (!apiKeys.huggingface?.trim() && !apiKeys.fal?.trim())
                                                        }
                                                        title={
                                                            !apiKeys.huggingface?.trim() && !apiKeys.fal?.trim()
                                                                ? 'Isi token Hugging Face (gratis) atau key fal.ai di Pengaturan'
                                                                : apiKeys.huggingface?.trim()
                                                                  ? 'Generate video (HF Inference — prioritas, tanpa saldo fal)'
                                                                  : 'Generate video (fal.ai Vidu Q2)'
                                                        }
                                                        className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl border border-emerald-500/45 bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                                                    >
                                                        {falVideoLoading ? (
                                                            <Loader2 className="size-4 animate-spin" />
                                                        ) : (
                                                            <Film className="size-4" />
                                                        )}
                                                        {falVideoLoading ? 'Membuat video…' : 'Generate video'}
                                                    </button>
                                                </div>
                                                {falVideoError && (
                                                    <p className="text-[12px] leading-relaxed text-red-400">{falVideoError}</p>
                                                )}
                                                {falVideoUrl && (
                                                    <div className="overflow-hidden rounded-xl border border-emerald-500/30 bg-black/40">
                                                        <video
                                                            src={falVideoUrl}
                                                            controls
                                                            playsInline
                                                            className="max-h-[min(420px,55vh)] w-full"
                                                        />
                                                        <div className="flex flex-wrap gap-2 border-t border-emerald-500/20 bg-[#0d0d10] px-3 py-2">
                                                            <a
                                                                href={falVideoUrl}
                                                                download="tiktok-affiliate-fal.mp4"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[11px] font-semibold text-emerald-400 underline-offset-2 hover:underline"
                                                            >
                                                                Unduh MP4
                                                            </a>
                                                            <Link
                                                                href="/settings"
                                                                className="text-[11px] text-zinc-500 hover:text-zinc-400"
                                                            >
                                                                Token HF / fal di Pengaturan
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Master prompt strip (like combined script) */}
                                        <div className={cardSurface}>
                                            <div className={cn(cardHeaderBar, 'flex items-center justify-between')}>
                                                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                                                    <Sparkles className="size-3.5 text-fuchsia-400" />
                                                    Skrip lengkap (satu blok)
                                                </span>
                                            </div>
                                            <div className={cardBodyPad}>
                                                <textarea
                                                    readOnly
                                                    className={cn(inputField('fuchsia'), 'min-h-[120px] resize-none text-[13px] leading-relaxed text-zinc-300')}
                                                    value={combinedPreview}
                                                />
                                            </div>
                                        </div>

                                        <div className={cn(cardSurface, 'bg-gradient-to-b from-fuchsia-950/[0.15] to-[#121214]')}>
                                            <div className={cn(cardHeaderBar, 'flex flex-wrap items-center justify-between gap-2')}>
                                                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-fuchsia-300">
                                                    <Film className="size-3.5 text-fuchsia-400" />
                                                    Video + rencana shot
                                                </span>
                                                <span className="text-[10px] font-medium tabular-nums text-fuchsia-400">
                                                    {videoTokenCount} token
                                                    <span className="text-zinc-500"> · cl100k (GPT/Groq)</span>
                                                </span>
                                            </div>
                                            <p className="border-b border-[#1a1a1a] px-4 py-2 text-[9px] leading-snug text-zinc-500">
                                                Tombol salin prompt video hanya menyalin teks{' '}
                                                <span className="text-zinc-400">prompt video</span> (tanpa rencana shot /
                                                hook). Token di bawah = perkiraan untuk{' '}
                                                <span className="text-zinc-400">prompt video</span> saja (cl100k).
                                            </p>
                                            <div className="max-h-[260px] overflow-y-auto px-4 py-3 text-[12px] leading-snug">
                                                <div className="mb-2 border-b border-[#1a1a1a] pb-2">
                                                    <p className="text-[9px] font-bold uppercase text-zinc-500">
                                                        Prompt video
                                                    </p>
                                                    <p className="mt-0.5 font-mono text-[11px] text-fuchsia-100/95">
                                                        {generatedContent.videoPrompt ||
                                                            '— Generate konten —'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold uppercase text-zinc-500">
                                                        Rencana shot
                                                    </p>
                                                    <pre className="mt-0.5 max-h-[140px] overflow-y-auto whitespace-pre-wrap font-sans text-[11px] text-zinc-300">
                                                        {generatedContent.rencanaShot || '—'}
                                                    </pre>
                                                </div>
                                            </div>
                                            <div className="space-y-2 border-t border-[#1a1a1a] px-4 py-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(videoBundleText, 'videobundle')}
                                                        disabled={!generatedContent.videoPrompt.trim()}
                                                        className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-2.5 py-1.5 text-[10px] font-bold text-fuchsia-300 transition hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        {copiedSection === 'videobundle'
                                                            ? '✓ Disalin'
                                                            : 'Salin prompt video'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleCopy(generatedContent.rencanaShot, 'dirshot')
                                                        }
                                                        className="rounded-md border border-zinc-600 px-2.5 py-1.5 text-[10px] font-semibold text-zinc-400 hover:bg-zinc-800"
                                                    >
                                                        {copiedSection === 'dirshot' ? '✓' : 'Rencana shot'}
                                                    </button>
                                                </div>
                                                {showPerClipCopy && (
                                                    <div className="space-y-3 border-t border-[#1a1a1a] pt-3">
                                                        <p className="text-[10px] leading-snug text-zinc-500">
                                                            <span className="font-semibold text-zinc-400">
                                                                Rencana shot per klip
                                                            </span>{' '}
                                                            — <span className="text-zinc-400">Prompt video</span> sama untuk
                                                            semua klip (pakai tombol &quot;Salin prompt video&quot; sekali).
                                                            Di bawah hanya{' '}
                                                            <span className="text-zinc-400">rencana shot</span> segmen ini
                                                            (hemat token). Maks {CLIP_SEGMENT_SECONDS} dtk per render.
                                                        </p>
                                                        <div className="space-y-3">
                                                            {clipShotSegments.map((seg, i) => (
                                                                <div
                                                                    key={`clip-${i}-${seg.label}`}
                                                                    className="rounded-xl border border-fuchsia-500/30 bg-[#0a0a0c] p-3"
                                                                >
                                                                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                                                        <span className="text-[11px] font-bold text-fuchsia-200">
                                                                            {seg.label}
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleCopy(
                                                                                    clipPasteBundles[i] ?? '',
                                                                                    `clip-${i}`
                                                                                )
                                                                            }
                                                                            className="shrink-0 rounded-lg border border-fuchsia-500/45 bg-fuchsia-500/15 px-2.5 py-1.5 text-[10px] font-bold text-fuchsia-200 transition hover:bg-fuchsia-500/25"
                                                                        >
                                                                            {copiedSection === `clip-${i}`
                                                                                ? '✓ Disalin'
                                                                                : 'Salin rencana klip ini'}
                                                                        </button>
                                                                    </div>
                                                                    <textarea
                                                                        readOnly
                                                                        className={cn(
                                                                            inputClass,
                                                                            'min-h-[100px] w-full resize-none font-mono text-[10px] leading-relaxed text-zinc-300'
                                                                        )}
                                                                        value={clipPasteBundles[i] ?? ''}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => void handleGenerate()}
                                                    disabled={isGenerating || !productInfo.name.trim()}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/35 bg-amber-500/[0.08] py-2.5 text-[11px] font-bold text-amber-200/95 transition hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    <RefreshCw
                                                        className={cn(
                                                            'size-3.5',
                                                            isGenerating && 'animate-spin'
                                                        )}
                                                    />
                                                    {isGenerating ? 'Membuat ulang…' : 'Generate ulang'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {generatedContent.caption && (
                                                <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.04] p-4">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-[11px] font-bold uppercase text-cyan-400/90">
                                                            Caption
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(generatedContent.caption, 'caption')}
                                                            className="text-[11px] font-semibold text-cyan-400/80 hover:text-cyan-300"
                                                        >
                                                            {copiedSection === 'caption' ? '✓' : 'Salin'}
                                                        </button>
                                                    </div>
                                                    <p className="text-[13px] text-zinc-300">{generatedContent.caption}</p>
                                                </div>
                                            )}
                                            <div className="rounded-xl border border-violet-500/15 bg-violet-500/[0.04] p-4 sm:col-span-2">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-[11px] font-bold uppercase text-violet-400/90">
                                                        Hashtag
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleCopy(generatedContent.hashtags.join(' '), 'hashtags')
                                                        }
                                                        className="text-[11px] font-semibold text-violet-400/80 hover:text-violet-300"
                                                    >
                                                        {copiedSection === 'hashtags' ? '✓' : 'Salin'}
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {generatedContent.hashtags.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[12px] text-emerald-300"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            {generatedContent.callToAction && (
                                                <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-4 sm:col-span-2">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-[11px] font-bold uppercase text-amber-400/90">
                                                            CTA
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleCopy(generatedContent.callToAction, 'cta')
                                                            }
                                                            className="text-[11px] font-semibold text-amber-400/80 hover:text-amber-300"
                                                        >
                                                            {copiedSection === 'cta' ? '✓' : 'Salin'}
                                                        </button>
                                                    </div>
                                                    <p className="text-[13px] text-zinc-300">{generatedContent.callToAction}</p>
                                                </div>
                                            )}
                                        </div>

                                        {generatedContent.shootingTip ? (
                                            <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.06] p-4">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-[11px] font-bold uppercase text-sky-400/90">
                                                        Tips syuting (FYP ID)
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleCopy(generatedContent.shootingTip, 'shoot')
                                                        }
                                                        className="text-[11px] font-semibold text-sky-400/80 hover:text-sky-300"
                                                    >
                                                        {copiedSection === 'shoot' ? '✓' : 'Salin'}
                                                    </button>
                                                </div>
                                                <p className="text-[13px] leading-relaxed text-zinc-300">
                                                    {generatedContent.shootingTip}
                                                </p>
                                            </div>
                                        ) : null}

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className={cn(cardSurface, 'p-4 text-center')}>
                                                <div className="mb-1 flex items-center justify-center gap-1.5 text-[10px] font-medium text-zinc-500">
                                                    <TrendingUp className="size-3.5 text-fuchsia-400" />
                                                    Pola konten
                                                </div>
                                                <p className="text-sm font-bold text-fuchsia-300">Hook → bukti → CTA</p>
                                            </div>
                                            <div className={cn(cardSurface, 'p-4 text-center')}>
                                                <div className="mb-1 flex items-center justify-center gap-1.5 text-[10px] font-medium text-zinc-500">
                                                    <Users className="size-3.5 text-cyan-400" />
                                                    Jam ramai (WIB)
                                                </div>
                                                <p className="text-sm font-bold text-cyan-300">12–14 & 19–21</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'templates' && (
                            <div className="max-w-3xl">
                                <ContentTemplates onSelectTemplate={handleSelectTemplate} />
                            </div>
                        )}

                    </div>
                </div>

                {/* —— Right: Generation settings —— */}
                <aside className="flex w-full shrink-0 flex-col border-t border-[#1f1f24] bg-[#0a0a0c] lg:w-[380px] lg:border-t-0 lg:border-l lg:border-[#1f1f24]">
                    <div className={cn(cardHeaderBar, 'flex flex-col gap-0.5')}>
                        <div className="flex items-center gap-2 text-zinc-100">
                            <Settings className="size-4 text-fuchsia-400" />
                            <span className="text-sm font-bold">Pengaturan generate</span>
                        </div>
                        <p className="text-[11px] text-zinc-500">
                            Satu panel untuk sumber, isi skrip, varian, dan format — tanpa duplikasi menu.
                        </p>
                    </div>

                    <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-5">
                        <div className={cardSurface}>
                            <div className={cn(cardHeaderBar, 'py-2.5')}>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                    Cara generate
                                </p>
                            </div>
                            <div className={cn(cardBodyPad, 'space-y-4 pt-0')}>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                        Sumber
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setGenerationSource('lokal')}
                                            className={cn(
                                                'flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition',
                                                generationSource === 'lokal'
                                                    ? 'border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/25'
                                                    : 'border-[#2a2a2e] bg-[#121214] hover:border-zinc-600'
                                            )}
                                        >
                                            <Sliders className="mb-1 size-4 text-emerald-400" />
                                            <span className="text-[12px] font-bold text-zinc-100">Lokal</span>
                                            <span className="text-[9px] leading-snug text-zinc-500">
                                                Gratis · pola & prompt siap pakai
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => hasAiKeys && setGenerationSource('api')}
                                            disabled={!hasAiKeys}
                                            title={
                                                !hasAiKeys
                                                    ? 'Pasang Gemini / Groq / OpenAI di Pengaturan dulu'
                                                    : 'Generate pakai API key Anda'
                                            }
                                            className={cn(
                                                'flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition',
                                                !hasAiKeys && 'cursor-not-allowed opacity-45',
                                                generationSource === 'api' && hasAiKeys
                                                    ? 'border-cyan-500/60 bg-cyan-500/10 ring-1 ring-cyan-500/25'
                                                    : 'border-[#2a2a2e] bg-[#121214] hover:border-zinc-600'
                                            )}
                                        >
                                            <Cpu className="mb-1 size-4 text-cyan-400" />
                                            <span className="text-[12px] font-bold text-zinc-100">API</span>
                                            <span className="text-[9px] leading-snug text-zinc-500">
                                                Gemini / Groq / OpenAI
                                            </span>
                                        </button>
                                    </div>
                                    {generationSource === 'lokal' ? (
                                        <p className="text-[10px] leading-relaxed text-zinc-500">
                                            Struktur sama seperti mode API: format layar, adegan, kamera,{' '}
                                            <span className="text-zinc-400">larangan watermark</span> di prompt video.
                                        </p>
                                    ) : (
                                        <p className="text-[10px] leading-relaxed text-cyan-500/90">
                                            Key dari Pengaturan; aturan tanpa watermark tetap disisipkan di hasil.
                                        </p>
                                    )}
                                    {!hasAiKeys && (
                                        <p className="text-[10px] text-amber-200/90">
                                            Belum ada API key —{' '}
                                            <Link href="/settings" className="font-semibold text-amber-400 underline">
                                                Pengaturan
                                            </Link>{' '}
                                            atau pakai Lokal.
                                        </p>
                                    )}
                                </div>

                                {generationSource === 'api' && hasAiKeys && (
                                    <div className="space-y-2 border-t border-[#1f1f24] pt-3">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                            Kualitas API
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setApiQuality('standard')}
                                                className={cn(
                                                    'rounded-xl border px-3 py-2.5 text-left text-[11px] font-semibold transition',
                                                    apiQuality === 'standard'
                                                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/25'
                                                        : 'border-[#2a2a2e] bg-[#121214] text-zinc-500 hover:border-zinc-600'
                                                )}
                                            >
                                                Standard
                                                <span className="mt-0.5 block text-[9px] font-normal text-zinc-500">
                                                    Hemat token
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setApiQuality('pro')}
                                                className={cn(
                                                    'rounded-xl border px-3 py-2.5 text-left text-[11px] font-semibold transition',
                                                    apiQuality === 'pro'
                                                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/25'
                                                        : 'border-[#2a2a2e] bg-[#121214] text-zinc-500 hover:border-zinc-600'
                                                )}
                                            >
                                                Pro
                                                <span className="mt-0.5 block text-[9px] font-normal text-zinc-500">
                                                    Instruksi lebih kaya
                                                </span>
                                            </button>
                                        </div>
                                        <p className="text-[10px] leading-relaxed text-zinc-500">
                                            Standard = batas output lebih rendah; Pro = panduan tambahan di system prompt.
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2 border-t border-[#1f1f24] pt-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                        Isi skrip
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setGenMode('quick')}
                                            className={cn(
                                                'rounded-xl border px-3 py-2.5 text-left transition',
                                                genMode === 'quick'
                                                    ? 'border-fuchsia-500/50 bg-fuchsia-500/10 ring-1 ring-fuchsia-500/25'
                                                    : 'border-[#2a2a2e] bg-[#121214] hover:border-zinc-600'
                                            )}
                                        >
                                            <Zap className="mb-1 size-4 text-fuchsia-400" />
                                            <p className="text-[12px] font-bold text-zinc-100">Hook cepat</p>
                                            <p className="text-[10px] text-zinc-500">Headline · hemat output</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setGenMode('full')}
                                            className={cn(
                                                'rounded-xl border px-3 py-2.5 text-left transition',
                                                genMode === 'full'
                                                    ? 'border-fuchsia-500/50 bg-fuchsia-500/10 ring-1 ring-fuchsia-500/25'
                                                    : 'border-[#2a2a2e] bg-[#121214] hover:border-zinc-600'
                                            )}
                                        >
                                            <Sparkles className="mb-1 size-4 text-fuchsia-400" />
                                            <p className="text-[12px] font-bold text-zinc-100">Bundle lengkap</p>
                                            <p className="text-[10px] text-zinc-500">Hook + caption + tag</p>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-[#1f1f24] pt-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                        Varian skrip
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {([1, 2, 3] as const).map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setVariantCount(n)}
                                                disabled={isGenerating}
                                                className={cn(
                                                    'rounded-xl border px-2 py-2.5 text-center text-[13px] font-bold transition',
                                                    variantCount === n
                                                        ? 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-200 ring-1 ring-fuchsia-500/25'
                                                        : 'border-[#2a2a2e] bg-[#121214] text-zinc-500 hover:border-zinc-600',
                                                    isGenerating && 'pointer-events-none opacity-50'
                                                )}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] leading-relaxed text-zinc-500">
                                        <span className="text-zinc-400">2–3</span> = beberapa skrip sekaligus (pose &
                                        kamera beda). Pakai API = satu panggilan per varian.
                                    </p>
                                </div>

                                <div className="space-y-2 border-t border-[#1f1f24] pt-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                        Format layar
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setScriptFormat('portrait')}
                                            className={cn(
                                                'flex flex-col items-center gap-1 rounded-xl border px-3 py-2.5 transition',
                                                scriptFormat === 'portrait'
                                                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/25'
                                                    : 'border-[#2a2a2e] bg-[#121214] text-zinc-500 hover:border-zinc-600'
                                            )}
                                        >
                                            <Smartphone className="size-5" />
                                            <span className="text-[11px] font-bold">9:16</span>
                                            <span className="text-[9px] text-zinc-500">Vertikal</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setScriptFormat('landscape')}
                                            className={cn(
                                                'flex flex-col items-center gap-1 rounded-xl border px-3 py-2.5 transition',
                                                scriptFormat === 'landscape'
                                                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/25'
                                                    : 'border-[#2a2a2e] bg-[#121214] text-zinc-500 hover:border-zinc-600'
                                            )}
                                        >
                                            <Monitor className="size-5" />
                                            <span className="text-[11px] font-bold">16:9</span>
                                            <span className="text-[9px] text-zinc-500">Mendatar</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-[#1f1f24] pt-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                        Durasi video
                                    </p>
                                    <select
                                        value={videoDurationSeconds}
                                        onChange={(e) =>
                                            setVideoDurationSeconds(
                                                Number(e.target.value) as 8 | 16 | 24 | 32 | 40 | 48 | 56 | 64
                                            )
                                        }
                                        disabled={isGenerating}
                                        className={cn(inputClass, 'text-[12px]')}
                                    >
                                        {([8, 16, 24, 32, 40, 48, 56, 64] as const).map((sec) => (
                                            <option key={sec} value={sec}>
                                                {sec} dtk total · {sec / CLIP_SEGMENT_SECONDS} klip × maks{' '}
                                                {CLIP_SEGMENT_SECONDS} dtk
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] leading-relaxed text-zinc-500">
                                        Rencana shot dibagi per klip maks{' '}
                                        <span className="text-zinc-400">{CLIP_SEGMENT_SECONDS} dtk</span> (sesuai batas
                                        pihak ketiga); antar klip ada petunjuk sambungan pose.
                                    </p>
                                </div>

                                <div className="space-y-2 border-t border-[#1f1f24] pt-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                        Suara di video
                                    </p>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => setVideoAudioMode('silent')}
                                            disabled={isGenerating}
                                            className={cn(
                                                'rounded-xl border px-3 py-2.5 text-left text-[11px] transition',
                                                videoAudioMode === 'silent'
                                                    ? 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-200 ring-1 ring-fuchsia-500/25'
                                                    : 'border-[#2a2a2e] bg-[#121214] text-zinc-500 hover:border-zinc-600'
                                            )}
                                        >
                                            <span className="font-bold">Tanpa bicara / VO</span>
                                            <span className="mt-0.5 block text-[10px] text-zinc-500">
                                                Karakter tidak berbicara; default hemat token untuk prompt video
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVideoAudioMode('voice_id')}
                                            disabled={isGenerating}
                                            className={cn(
                                                'rounded-xl border px-3 py-2.5 text-left text-[11px] transition',
                                                videoAudioMode === 'voice_id'
                                                    ? 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-200 ring-1 ring-fuchsia-500/25'
                                                    : 'border-[#2a2a2e] bg-[#121214] text-zinc-500 hover:border-zinc-600'
                                            )}
                                        >
                                            <span className="font-bold">Narasi singkat BI</span>
                                            <span className="mt-0.5 block text-[10px] text-zinc-500">
                                                VO Bahasa Indonesia singkat selaras hook
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <p className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-2.5 py-2 text-[10px] leading-relaxed text-zinc-400">
                                    <span className="font-semibold text-amber-200/95">Hemat token:</span> Lokal + Hook
                                    cepat + varian 1 + Standard (API). Bundle lengkap = output lebih panjang, tetap 1×
                                    generate per varian.
                                </p>
                            </div>
                        </div>

                        {lastApiUsage && lastSource === 'ai' && (
                            <div className={cardSurface}>
                                <div className={cn(cardHeaderBar, 'py-2.5')}>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                        Token generate terakhir
                                    </p>
                                </div>
                                <div className={cn(cardBodyPad, 'space-y-2 pt-0')}>
                                    <div className="flex items-center justify-between text-[11px] text-zinc-300">
                                        <span>Prompt (input)</span>
                                        <span className="font-mono tabular-nums">{lastApiUsage.promptTokens}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-zinc-300">
                                        <span>Completion (output)</span>
                                        <span className="font-mono tabular-nums">{lastApiUsage.completionTokens}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-[#1a1a1a] pt-2 text-[12px] font-semibold text-zinc-100">
                                        <span>Total</span>
                                        <span className="font-mono tabular-nums">{lastApiUsage.totalTokens}</span>
                                    </div>
                                    <p className="text-[10px] leading-relaxed text-zinc-500">
                                        {lastSource === 'ai' && generatedVariants.length > 1 && (
                                            <>
                                                Total di bawah menjumlahkan{' '}
                                                <span className="text-zinc-400">{generatedVariants.length} panggilan</span>{' '}
                                                (satu per varian).{' '}
                                            </>
                                        )}
                                        {lastApiUsage.source === 'provider' ? (
                                            <>
                                                Angka dari penyedia (
                                                {lastApiUsage.provider === 'gemini'
                                                    ? 'Gemini'
                                                    : lastApiUsage.provider === 'groq'
                                                      ? 'Groq'
                                                      : lastApiUsage.provider === 'openai'
                                                        ? 'OpenAI'
                                                        : 'API'}
                                                ).
                                            </>
                                        ) : (
                                            <>
                                                Estimasi dengan encoder cl100k (seperti GPT/Groq). Tokenizer Gemini bisa sedikit
                                                berbeda.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className={cardSurface}>
                            <div className={cn(cardHeaderBar, 'py-2.5')}>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                    Nada bicara
                                </p>
                            </div>
                            <div className={cn(cardBodyPad, 'pt-0')}>
                            <div className="grid grid-cols-3 gap-1.5">
                                {(
                                    [
                                        ['gen_z', 'Gen Z'],
                                        ['casual', 'Santai'],
                                        ['warm', 'Hangat'],
                                    ] as const
                                ).map(([val, label]) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setTone(val)}
                                        className={cn(
                                            'rounded-lg border px-2 py-2 text-[10px] font-bold transition',
                                            tone === val
                                                ? 'border-fuchsia-500/45 bg-fuchsia-500/12 text-fuchsia-200'
                                                : 'border-[#2a2a2e] bg-[#121214] text-zinc-500 hover:border-zinc-600'
                                        )}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            </div>
                        </div>

                        <div className={cardSurface}>
                            <div className={cn(cardHeaderBar, 'py-2.5')}>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                    Channel jualan
                                </p>
                            </div>
                            <div className={cn(cardBodyPad, 'pt-0')}>
                            <div className="grid grid-cols-2 gap-2">
                                {(
                                    [
                                        ['tiktok_shop', 'TikTok Shop'],
                                        ['shopee', 'Shopee'],
                                        ['tokopedia', 'Tokopedia'],
                                        ['campur', 'Campur'],
                                    ] as const
                                ).map(([val, label]) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setPlatform(val)}
                                        className={cn(
                                            'rounded-lg border px-2 py-2.5 text-[11px] font-semibold transition',
                                            platform === val
                                                ? 'border-cyan-500/45 bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/20'
                                                : 'border-[#2a2a2e] bg-[#121214] text-zinc-500 hover:border-zinc-600'
                                        )}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            </div>
                        </div>

                        <div
                            className={cn(
                                cardSurface,
                                'border-amber-500/20 bg-gradient-to-b from-amber-950/[0.2] to-[#121214]'
                            )}
                        >
                            <div className={cn(cardHeaderBar, 'border-amber-500/10 py-2.5')}>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90">
                                    Alur lanjutan
                                </p>
                            </div>
                            <div className={cn(cardBodyPad, 'space-y-3 pt-0')}>
                                <p className="text-[11px] leading-relaxed text-zinc-400">
                                    Gabungkan skrip ini dengan <span className="text-zinc-300">Prompt Studio</span> dan{' '}
                                    <span className="text-zinc-300">Video Timelapse</span> untuk visual before/after yang konsisten.
                                </p>
                                <Link
                                    href="/prompt-studio"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-[12px] font-bold text-[#1a0a00] shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-orange-400"
                                >
                                    Buka Prompt Studio
                                    <ChevronRight className="size-4" />
                                </Link>
                            </div>
                        </div>

                        {activeTab === 'generator' && (
                            <>
                                <div className={cardSurface}>
                                    <div className={cn(cardHeaderBar, 'py-2.5')}>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                            Detail produk
                                        </p>
                                        <p className="mt-1 text-[10px] leading-relaxed text-zinc-600">
                                            Isi inti dulu; adegan &amp; harga terpisah ada di{' '}
                                            <span className="text-zinc-500">Lanjutan</span> (opsional).
                                        </p>
                                    </div>
                                    <div className={cn(cardBodyPad, 'space-y-3 pt-0')}>
                                        <div>
                                            <label className="mb-1 block text-[11px] text-zinc-400">
                                                Nama produk <span className="text-fuchsia-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={productInfo.name}
                                                onChange={(e) => setProductInfo({ ...productInfo, name: e.target.value })}
                                                className={inputClass}
                                                placeholder="Contoh: kaos oversize polos / sneakers putih"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            <div>
                                                <label className="mb-1 block text-[11px] text-zinc-400">Kategori</label>
                                                <select
                                                    value={productInfo.category}
                                                    onChange={(e) =>
                                                        setProductInfo({ ...productInfo, category: e.target.value })
                                                    }
                                                    className={inputClass}
                                                >
                                                    {categories.map((cat) => (
                                                        <option key={cat.value} value={cat.value}>
                                                            {cat.icon} {cat.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] text-zinc-400">Audiens</label>
                                                <select
                                                    value={productInfo.targetAudience}
                                                    onChange={(e) =>
                                                        setProductInfo({
                                                            ...productInfo,
                                                            targetAudience: e.target.value,
                                                        })
                                                    }
                                                    className={inputClass}
                                                >
                                                    {audiences.map((aud) => (
                                                        <option key={aud.value} value={aud.value}>
                                                            {aud.icon} {aud.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-[11px] text-zinc-400">
                                                Poin jual &amp; konteks
                                            </label>
                                            <textarea
                                                value={productInfo.features}
                                                onChange={(e) =>
                                                    setProductInfo({ ...productInfo, features: e.target.value })
                                                }
                                                className={cn(inputClass, 'resize-none')}
                                                rows={2}
                                                placeholder="Manfaat, material, promo — bisa sertakan kisaran harga di sini (satu blok)."
                                            />
                                        </div>

                                        <div>
                                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                                Yang tampil di video
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {wearableOptions.map((w) => (
                                                    <button
                                                        key={w.value}
                                                        type="button"
                                                        onClick={() =>
                                                            setProductInfo({ ...productInfo, wearableItem: w.value })
                                                        }
                                                        className={cn(
                                                            'rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition',
                                                            productInfo.wearableItem === w.value
                                                                ? 'border-fuchsia-500/50 bg-fuchsia-500/15 text-fuchsia-200'
                                                                : 'border-[#2a2a2e] bg-[#121214] text-zinc-500 hover:border-zinc-600'
                                                        )}
                                                    >
                                                        {w.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-[11px] text-zinc-400">
                                                Talent / siapa di video{' '}
                                                <span className="font-normal text-zinc-600">(opsional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={productInfo.whoInVideo}
                                                onChange={(e) =>
                                                    setProductInfo({ ...productInfo, whoInVideo: e.target.value })
                                                }
                                                className={inputClass}
                                                placeholder="Mis. model 20an, POV kamu sendiri — kosongkan jika tidak perlu"
                                            />
                                        </div>

                                        <details className="rounded-xl border border-[#2a2a2e] bg-[#0d0d10] px-3 py-2.5">
                                            <summary className="cursor-pointer text-[11px] font-semibold text-zinc-400">
                                                Lanjutan: adegan, ekspresi, harga terpisah (opsional)
                                            </summary>
                                            <div className="mt-3 space-y-3 border-t border-[#1f1f24] pt-3">
                                                <div>
                                                    <label className="mb-1 block text-[11px] text-zinc-400">
                                                        Gaya adegan
                                                    </label>
                                                    <select
                                                        value={productInfo.scenePreset}
                                                        onChange={(e) =>
                                                            setProductInfo({
                                                                ...productInfo,
                                                                scenePreset: e.target.value as ContentScenePreset,
                                                            })
                                                        }
                                                        className={inputClass}
                                                    >
                                                        {scenePresetOptions.map((s) => (
                                                            <option key={s.value} value={s.value}>
                                                                {s.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <p className="mt-1 text-[10px] text-zinc-600">
                                                        {scenePresetOptions.find((s) => s.value === productInfo.scenePreset)
                                                            ?.hint ?? ''}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-[11px] text-zinc-400">
                                                        Ekspresi talent
                                                    </label>
                                                    <select
                                                        value={productInfo.expressionPreset}
                                                        onChange={(e) =>
                                                            setProductInfo({
                                                                ...productInfo,
                                                                expressionPreset: e.target.value as CharacterExpressionPreset,
                                                            })
                                                        }
                                                        className={inputClass}
                                                    >
                                                        {expressionOptions.map((ex) => (
                                                            <option key={ex.value} value={ex.value}>
                                                                {ex.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-[11px] text-zinc-400">
                                                        Catatan pose / ekspresi{' '}
                                                        <span className="font-normal text-zinc-600">(opsional)</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={productInfo.expressionNote}
                                                        onChange={(e) =>
                                                            setProductInfo({
                                                                ...productInfo,
                                                                expressionNote: e.target.value,
                                                            })
                                                        }
                                                        className={inputClass}
                                                        placeholder='Mis. "senyum ke kaca", gestur tangan'
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-[11px] text-zinc-400">
                                                        Harga / range{' '}
                                                        <span className="font-normal text-zinc-600">(opsional)</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={productInfo.price}
                                                        onChange={(e) =>
                                                            setProductInfo({ ...productInfo, price: e.target.value })
                                                        }
                                                        className={inputClass}
                                                        placeholder="Rp / $ — jika tidak sudah ada di poin jual"
                                                    />
                                                </div>
                                            </div>
                                        </details>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !productInfo.name.trim()}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-fuchsia-500 py-3.5 text-sm font-bold text-[#140514] shadow-lg shadow-fuchsia-500/30 transition hover:bg-fuchsia-400 disabled:pointer-events-none disabled:opacity-40"
                                >
                                    {isGenerating ? (
                                        <>
                                            <RefreshCw className="size-4 animate-spin" />
                                            Membuat…
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="size-4" />
                                            Generate konten
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[10px] leading-relaxed text-zinc-500">
                                    Pilih <span className="text-zinc-400">Lokal</span> atau{' '}
                                    <span className="text-zinc-400">API key</span> di atas. Prompt video meminta hasil{' '}
                                    <span className="text-zinc-400">tanpa watermark platform</span> — perilaku akhir tetap
                                    mengikuti model / layanan video yang Anda pakai.
                                </p>
                            </>
                        )}

                        {activeTab !== 'generator' && (
                            <div className={cn(cardSurface, 'p-4 text-[12px] text-zinc-500')}>
                                Pilih tab <span className="font-semibold text-fuchsia-400">Generator</span> untuk mengisi produk dan
                                men-generate. Template bisa diklik lalu diedit di generator.
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    )
}
