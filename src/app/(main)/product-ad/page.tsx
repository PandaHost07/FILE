'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    ShoppingBag,
    Upload,
    Loader2,
    Sparkles,
    Film,
    SunMedium,
    Megaphone,
    Hash,
    Link2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { cardBodyPad, cardHeaderBar, cardSurface, inputField, pageGradient, shellBg } from '@/lib/uiTokens'
import { useToast } from '@/components/ui/toast'
import useAppStore from '@/store/useAppStore'
import { parseKeys } from '@/lib/keyRotation'
import { generateProductAdIndonesiaAI } from '@/lib/gemini'
import {
    buildLocalProductAd,
    type ProductAdCategory,
    type ProductAdResult,
} from '@/lib/productAdIndonesia'

const CATEGORIES: { value: ProductAdCategory; label: string }[] = [
    { value: 'parfum', label: 'Parfum / wewangian' },
    { value: 'skincare', label: 'Skincare' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'makanan', label: 'Makanan' },
    { value: 'minuman', label: 'Minuman' },
    { value: 'elektronik', label: 'Elektronik / gadget' },
    { value: 'lainnya', label: 'Lainnya' },
]

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.onerror = () => reject(r.error ?? new Error('Gagal membaca file'))
        r.readAsDataURL(file)
    })
}

export default function ProductAdPage() {
    const { toast } = useToast()
    const { apiKeys } = useAppStore()

    const [productName, setProductName] = useState('')
    const [category, setCategory] = useState<ProductAdCategory>('parfum')
    const [brand, setBrand] = useState('')
    const [extraNotes, setExtraNotes] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [result, setResult] = useState<ProductAdResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState('')

    const inputClass = inputField('violet')

    const hasAiKeys = useMemo(
        () =>
            parseKeys(apiKeys.gemini).length > 0 ||
            parseKeys(apiKeys.openai).length > 0 ||
            parseKeys(apiKeys.groq).length > 0,
        [apiKeys.gemini, apiKeys.openai, apiKeys.groq]
    )

    useEffect(() => {
        if (!imageFile) {
            setImagePreview(null)
            return
        }
        const url = URL.createObjectURL(imageFile)
        setImagePreview(url)
        return () => URL.revokeObjectURL(url)
    }, [imageFile])

    const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (!f) {
            setImageFile(null)
            return
        }
        if (!f.type.startsWith('image/')) {
            toast({ title: 'Bukan gambar', description: 'Pilih file JPG, PNG, atau WebP.', variant: 'destructive' })
            return
        }
        if (f.size > 6 * 1024 * 1024) {
            toast({ title: 'File terlalu besar', description: 'Maksimal ~6 MB.', variant: 'destructive' })
            return
        }
        setImageFile(f)
    }

    const handleCopy = useCallback(
        (label: string, text: string) => {
            navigator.clipboard.writeText(text)
            setCopied(label)
            setTimeout(() => setCopied(''), 2000)
        },
        []
    )

    const buildInput = useCallback(
        () => ({
            productName: productName.trim(),
            category,
            brand: brand.trim(),
            extraNotes: extraNotes.trim(),
        }),
        [productName, category, brand, extraNotes]
    )

    const handleGenerate = async () => {
        const name = productName.trim()
        if (!name) {
            toast({
                title: 'Nama produk wajib',
                description: 'Isi nama produk terlebih dahulu.',
                variant: 'destructive',
            })
            return
        }

        const input = buildInput()
        setLoading(true)
        try {
            let imageDataUrl: string | null = null
            if (imageFile) {
                imageDataUrl = await readFileAsDataUrl(imageFile)
            }

            if (hasAiKeys) {
                const { result: out } = await generateProductAdIndonesiaAI(
                    apiKeys.gemini,
                    input,
                    imageDataUrl,
                    apiKeys.openai,
                    apiKeys.groq
                )
                setResult(out)
                toast({
                    title: 'Iklan siap',
                    description: imageDataUrl && parseKeys(apiKeys.gemini).length > 0
                        ? 'Prompt disesuaikan dengan gambar (Gemini vision).'
                        : 'Konten dari model AI.',
                })
            } else {
                setResult(buildLocalProductAd(input))
                toast({
                    title: 'Iklan siap (lokal)',
                    description: 'Tanpa kunci API — template tetap profesional. Tambahkan API di Pengaturan untuk variasi AI + analisis gambar.',
                })
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Gagal'
            setResult(buildLocalProductAd(buildInput()))
            toast({
                title: 'Fallback lokal',
                description: msg,
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const bundleText = useMemo(() => {
        if (!result) return ''
        return [
            `[Judul]\n${result.headline}`,
            `[Hook]\n${result.hook}`,
            `[Copy]\n${result.bodyCopy}`,
            `[Prompt video / syuting]\n${result.videoPrompt}`,
            `[Shot list]\n${result.shotList}`,
            `[Cahaya & mood]\n${result.lightingMood}`,
            `[CTA]\n${result.callToAction}`,
            `[Hashtag]\n${result.hashtags.join(' ')}`,
        ].join('\n\n')
    }, [result])

    return (
        <div className={cn('relative flex min-h-0 flex-1 flex-col', shellBg)}>
            <div className={pageGradient.violet} aria-hidden />

            <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto">
                <header className="border-b border-[#1f1f24] px-4 py-6 sm:px-8">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-violet-500/90">
                        RestoreGen
                    </p>
                    <div className="flex flex-wrap items-start gap-4">
                        <ShoppingBag className="size-8 shrink-0 text-violet-400" aria-hidden />
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Iklan Produk</h1>
                            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-zinc-500">
                                Unggah foto produk (parfum, skincare, minuman, dll.), isi data singkat — AI menyusun{' '}
                                <span className="text-zinc-400">copy iklan profesional</span> dan{' '}
                                <span className="text-zinc-400">arahan syuting video</span> (shot list, cahaya, mood).
                                Dengan kunci Gemini + gambar, model memakai <span className="text-zinc-400">vision</span>{' '}
                                untuk selaras dengan kemasan Anda.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 space-y-6 px-4 py-6 sm:px-8 sm:py-8">
                    <div className={cardSurface}>
                        <div className={cn(cardHeaderBar, 'flex flex-wrap items-center justify-between gap-2')}>
                            <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                                Data produk & gambar
                            </span>
                            {hasAiKeys ? (
                                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                                    API tersedia
                                </span>
                            ) : (
                                <Link
                                    href="/settings"
                                    className="text-[10px] font-semibold text-violet-400 hover:text-violet-300"
                                >
                                    Pengaturan → kunci API
                                </Link>
                            )}
                        </div>
                        <div className={cardBodyPad}>
                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[11px] font-semibold text-zinc-400">Nama produk *</label>
                                        <input
                                            type="text"
                                            value={productName}
                                            onChange={(e) => setProductName(e.target.value)}
                                            placeholder="Contoh: Noir Absolu EDP 50ml"
                                            className={cn(inputClass, 'mt-1')}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-zinc-400">Kategori</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value as ProductAdCategory)}
                                            className={cn(inputClass, 'mt-1')}
                                        >
                                            {CATEGORIES.map((c) => (
                                                <option key={c.value} value={c.value}>
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-zinc-400">
                                            Merek (opsional)
                                        </label>
                                        <input
                                            type="text"
                                            value={brand}
                                            onChange={(e) => setBrand(e.target.value)}
                                            placeholder="Nama brand"
                                            className={cn(inputClass, 'mt-1')}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-zinc-400">
                                            Catatan (opsional)
                                        </label>
                                        <textarea
                                            value={extraNotes}
                                            onChange={(e) => setExtraNotes(e.target.value)}
                                            placeholder="Target pasar, varian aroma, promo, dll."
                                            rows={3}
                                            className={cn(inputClass, 'mt-1 min-h-[80px] resize-y')}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-semibold text-zinc-400">Foto produk</label>
                                    <p className="mb-2 text-[11px] text-zinc-500">
                                        JPG/PNG/WebP, maks ~6 MB. Untuk analisis visual paling baik pakai kunci{' '}
                                        <span className="text-zinc-400">Gemini</span> di Pengaturan.
                                    </p>
                                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-violet-500/35 bg-violet-500/[0.04] px-4 py-8 transition hover:border-violet-500/55">
                                        <Upload className="mb-2 size-8 text-violet-400/80" aria-hidden />
                                        <span className="text-[12px] font-semibold text-zinc-300">
                                            Klik atau seret gambar ke sini
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="sr-only"
                                            onChange={handlePickImage}
                                        />
                                    </label>
                                    {imagePreview && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={imagePreview}
                                            alt="Pratinjau produk"
                                            className="mt-3 max-h-56 w-full rounded-xl border border-[#2a2a2e] object-contain"
                                        />
                                    )}
                                    {imageFile && (
                                        <button
                                            type="button"
                                            onClick={() => setImageFile(null)}
                                            className="mt-2 text-[11px] font-semibold text-zinc-500 hover:text-zinc-400"
                                        >
                                            Hapus gambar
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => void handleGenerate()}
                                disabled={loading}
                                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500/20 py-3 text-[13px] font-bold text-violet-100 ring-1 ring-violet-500/40 transition hover:bg-violet-500/30 disabled:opacity-50 sm:w-auto sm:px-8"
                            >
                                {loading ? (
                                    <Loader2 className="size-4 animate-spin" aria-hidden />
                                ) : (
                                    <Sparkles className="size-4" aria-hidden />
                                )}
                                {loading ? 'Membuat iklan…' : 'Generate iklan & arahan video'}
                            </button>
                        </div>
                    </div>

                    {result && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h2 className="text-[12px] font-bold uppercase tracking-wide text-zinc-500">Hasil</h2>
                                <button
                                    type="button"
                                    onClick={() => handleCopy('all', bundleText)}
                                    className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-[11px] font-bold text-violet-200 hover:bg-violet-500/20"
                                >
                                    {copied === 'all' ? '✓ Disalin' : 'Salin semua'}
                                </button>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <section className={cardSurface}>
                                    <div className={cn(cardHeaderBar, 'flex items-center gap-2')}>
                                        <Megaphone className="size-4 text-violet-400" />
                                        <span className="text-[11px] font-bold uppercase text-zinc-400">
                                            Judul & hook
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleCopy(
                                                    'h',
                                                    `${result.headline}\n\n${result.hook}`
                                                )
                                            }
                                            className="ml-auto text-[10px] font-semibold text-violet-400 hover:text-violet-300"
                                        >
                                            {copied === 'h' ? '✓' : 'Salin'}
                                        </button>
                                    </div>
                                    <div className={cardBodyPad}>
                                        <p className="text-[15px] font-semibold text-zinc-100">{result.headline}</p>
                                        <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{result.hook}</p>
                                    </div>
                                </section>

                                <section className={cardSurface}>
                                    <div className={cn(cardHeaderBar, 'flex items-center gap-2')}>
                                        <Link2 className="size-4 text-violet-400" />
                                        <span className="text-[11px] font-bold uppercase text-zinc-400">Copy iklan</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy('b', result.bodyCopy)}
                                            className="ml-auto text-[10px] font-semibold text-violet-400 hover:text-violet-300"
                                        >
                                            {copied === 'b' ? '✓' : 'Salin'}
                                        </button>
                                    </div>
                                    <div className={cardBodyPad}>
                                        <p className="text-[13px] leading-relaxed text-zinc-300">{result.bodyCopy}</p>
                                    </div>
                                </section>
                            </div>

                            <section className={cardSurface}>
                                <div className={cn(cardHeaderBar, 'flex items-center gap-2')}>
                                    <Film className="size-4 text-violet-400" />
                                    <span className="text-[11px] font-bold uppercase text-zinc-400">
                                        Prompt video & syuting
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy('v', result.videoPrompt)}
                                        className="ml-auto text-[10px] font-semibold text-violet-400 hover:text-violet-300"
                                    >
                                        {copied === 'v' ? '✓' : 'Salin'}
                                    </button>
                                </div>
                                <div className={cardBodyPad}>
                                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-zinc-300">
                                        {result.videoPrompt}
                                    </p>
                                </div>
                            </section>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <section className={cardSurface}>
                                    <div className={cn(cardHeaderBar, 'flex items-center gap-2')}>
                                        <Film className="size-4 text-violet-400" />
                                        <span className="text-[11px] font-bold uppercase text-zinc-400">Shot list</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy('s', result.shotList)}
                                            className="ml-auto text-[10px] font-semibold text-violet-400 hover:text-violet-300"
                                        >
                                            {copied === 's' ? '✓' : 'Salin'}
                                        </button>
                                    </div>
                                    <div className={cardBodyPad}>
                                        <pre className="whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-zinc-400">
                                            {result.shotList}
                                        </pre>
                                    </div>
                                </section>

                                <section className={cardSurface}>
                                    <div className={cn(cardHeaderBar, 'flex items-center gap-2')}>
                                        <SunMedium className="size-4 text-violet-400" />
                                        <span className="text-[11px] font-bold uppercase text-zinc-400">
                                            Cahaya & mood
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy('l', result.lightingMood)}
                                            className="ml-auto text-[10px] font-semibold text-violet-400 hover:text-violet-300"
                                        >
                                            {copied === 'l' ? '✓' : 'Salin'}
                                        </button>
                                    </div>
                                    <div className={cardBodyPad}>
                                        <p className="text-[13px] leading-relaxed text-zinc-400">{result.lightingMood}</p>
                                    </div>
                                </section>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <section className={cardSurface}>
                                    <div className={cn(cardHeaderBar, 'flex items-center gap-2')}>
                                        <Megaphone className="size-4 text-violet-400" />
                                        <span className="text-[11px] font-bold uppercase text-zinc-400">CTA</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy('c', result.callToAction)}
                                            className="ml-auto text-[10px] font-semibold text-violet-400 hover:text-violet-300"
                                        >
                                            {copied === 'c' ? '✓' : 'Salin'}
                                        </button>
                                    </div>
                                    <div className={cardBodyPad}>
                                        <p className="text-[13px] text-zinc-300">{result.callToAction}</p>
                                    </div>
                                </section>

                                <section className={cardSurface}>
                                    <div className={cn(cardHeaderBar, 'flex items-center gap-2')}>
                                        <Hash className="size-4 text-violet-400" />
                                        <span className="text-[11px] font-bold uppercase text-zinc-400">Hashtag</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy('t', result.hashtags.join(' '))}
                                            className="ml-auto text-[10px] font-semibold text-violet-400 hover:text-violet-300"
                                        >
                                            {copied === 't' ? '✓' : 'Salin'}
                                        </button>
                                    </div>
                                    <div className={cardBodyPad}>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.hashtags.map((tag, i) => (
                                                <span
                                                    key={`${tag}-${i}`}
                                                    className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[12px] text-violet-200/95"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
