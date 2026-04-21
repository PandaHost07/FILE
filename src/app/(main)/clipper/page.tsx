'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    Scissors,
    Upload,
    Download,
    Loader2,
    AlertCircle,
    Video,
    Info,
    Smartphone,
    Monitor,
    ArrowLeft,
    Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { cardSurface, cardHeaderBar, cardBodyPad, inputField, pageGradient, shellBg } from '@/lib/uiTokens'
import type { ClipAspect, ClipEnhance } from '@/lib/ffmpegClipper'
import { parseYoutubeVideoId } from '@/lib/parseYoutubeClipper'

const MAX_DURATION_SEC = 300

export default function ClipperPage() {
    const [file, setFile] = useState<File | null>(null)
    const [startSec, setStartSec] = useState(0)
    const [endSec, setEndSec] = useState(30)
    const [aspect, setAspect] = useState<ClipAspect>('portrait')
    const [subtitle, setSubtitle] = useState('')
    const [enhance, setEnhance] = useState<ClipEnhance>('off')
    const [youtubeUrl, setYoutubeUrl] = useState('')
    const [busy, setBusy] = useState(false)
    const [logLines, setLogLines] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
    /** Pratinjau lokal — object URL dari File (bukan dipakai sebagai modul). */
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [videoDurationSec, setVideoDurationSec] = useState<number | null>(null)

    const videoId = useMemo(() => parseYoutubeVideoId(youtubeUrl), [youtubeUrl])

    const clipDurationSec = Math.max(0, endSec - startSec)

    useEffect(() => {
        return () => {
            if (downloadUrl) URL.revokeObjectURL(downloadUrl)
        }
    }, [downloadUrl])

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null)
            setVideoDurationSec(null)
            return
        }
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        return () => {
            URL.revokeObjectURL(url)
        }
    }, [file])

    const appendLog = useCallback((msg: string) => {
        setLogLines((prev) => [...prev.slice(-40), msg])
    }, [])

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        setFile(f ?? null)
        setError(null)
        setDownloadUrl(null)
        setVideoDurationSec(null)
    }

    const handleProcess = async () => {
        if (!file) {
            setError('Pilih file video dulu (MP4/MOV/WebM).')
            return
        }
        const dur = endSec - startSec
        if (dur < 0.5) {
            setError('Durasi minimal ~0,5 detik.')
            return
        }
        if (dur > MAX_DURATION_SEC) {
            setError(`Potongan maksimal ${MAX_DURATION_SEC} detik agar browser tidak kehabisan memori.`)
            return
        }

        setBusy(true)
        setError(null)
        setLogLines([])

        let formatErr = (e: unknown) => (e instanceof Error ? e.message : String(e))
        try {
            const { runClipJob, formatClipError } = await import('@/lib/ffmpegClipper')
            formatErr = formatClipError
            const blob = await runClipJob({
                file,
                startSec,
                endSec,
                aspect,
                subtitleText: subtitle,
                enhance,
                onLog: appendLog,
            })
            setDownloadUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev)
                return URL.createObjectURL(blob)
            })
        } catch (e) {
            setError(formatErr(e))
        } finally {
            setBusy(false)
        }
    }

    const inputClass = inputField('amber')

    return (
        <div className={cn('relative flex min-h-0 flex-1 flex-col', shellBg)}>
            <div className={pageGradient.amber} aria-hidden />

            <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pt-9">
                    <header className="mb-7 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/90">
                                Tools
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 ring-1 ring-amber-500/25 sm:size-12">
                                    <Scissors className="size-6 text-amber-400 sm:size-7" aria-hidden />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-[1.65rem]">
                                        Clipper
                                    </h1>
                                    <p className="mt-0.5 text-[12px] text-zinc-500 sm:text-[13px]">
                                        Potong, crop 9:16 / 16:9, subtitle burn-in — di browser. Opsional perjelas
                                        (denoise + sharpen FFmpeg, tanpa AI).
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Link
                            href="/tools"
                            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-[12px] font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200 sm:py-2"
                        >
                            <ArrowLeft className="size-3.5" aria-hidden />
                            Kembali ke Tools
                        </Link>
                    </header>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                        {/* Pratinjau YouTube — sticky di desktop */}
                        <section
                            className="lg:col-span-5 lg:sticky lg:top-4 lg:self-start"
                            aria-labelledby="clipper-youtube-heading"
                        >
                            <div className={cn(cardSurface, 'border-amber-500/10 shadow-black/40')}>
                                <div
                                    className={cn(
                                        cardHeaderBar,
                                        'flex flex-wrap items-center gap-2 sm:justify-between'
                                    )}
                                >
                                    <span
                                        id="clipper-youtube-heading"
                                        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-zinc-400"
                                    >
                                        <span className="flex size-6 items-center justify-center rounded-lg bg-red-500/15">
                                            <Video className="size-3.5 text-red-400" aria-hidden />
                                        </span>
                                        Pratinjau YouTube
                                    </span>
                                    <span className="hidden text-[10px] text-zinc-600 sm:inline">Hanya embed</span>
                                </div>
                                <div className={cn(cardBodyPad, 'space-y-4')}>
                                    <p className="text-[12px] leading-relaxed text-zinc-500 sm:text-[13px]">
                                        Tempel URL untuk melihat pratinjau. Unduh sumber ke perangkat Anda (sesuai aturan
                                        YouTube), lalu unggah di panel sebelah untuk dipotong.
                                    </p>
                                    <input
                                        type="url"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className={cn(inputClass, 'text-[13px]')}
                                        autoComplete="off"
                                    />
                                    {videoId ? (
                                        <div className="overflow-hidden rounded-2xl border border-zinc-800/90 bg-black shadow-2xl ring-1 ring-white/5">
                                            <div className="aspect-video w-full">
                                                <iframe
                                                    title="Pratinjau video YouTube"
                                                    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                                                    className="size-full min-h-0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                        </div>
                                    ) : youtubeUrl.trim() ? (
                                        <p className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-[12px] text-amber-200/90">
                                            <AlertCircle className="size-4 shrink-0 text-amber-400" aria-hidden />
                                            <span>URL tidak dikenali. Pakai link watch, Shorts, atau youtu.be.</span>
                                        </p>
                                    ) : (
                                        <div className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50 px-4 py-6 text-center">
                                            <Video className="mb-2 size-8 text-zinc-700" aria-hidden />
                                            <p className="text-[12px] text-zinc-600">Masukkan URL untuk pratinjau</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Workflow utama */}
                        <section className="min-w-0 space-y-6 lg:col-span-7" aria-labelledby="clipper-file-heading">
                            <div className={cn(cardSurface, 'shadow-black/40')}>
                                <div className={cn(cardHeaderBar, 'flex flex-wrap items-center gap-2')}>
                                    <span
                                        id="clipper-file-heading"
                                        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-zinc-400"
                                    >
                                        <span className="flex size-6 items-center justify-center rounded-lg bg-amber-500/15">
                                            <Upload className="size-3.5 text-amber-400" aria-hidden />
                                        </span>
                                        File &amp; ekspor
                                    </span>
                                </div>
                                <div className={cn(cardBodyPad, 'space-y-5 sm:space-y-6')}>
                                    <label
                                        htmlFor="clipper-file-input"
                                        className="group flex min-h-[min(200px,42vh)] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-700/90 bg-gradient-to-b from-zinc-900/50 to-zinc-950/80 px-4 py-8 transition hover:border-amber-500/35 hover:from-zinc-900/70 sm:min-h-[180px] sm:flex-row sm:justify-between sm:px-6"
                                    >
                                        <input
                                            id="clipper-file-input"
                                            type="file"
                                            accept="video/*,.mp4,.mov,.webm,.mkv"
                                            className="sr-only"
                                            onChange={handleFile}
                                        />
                                        <div className="flex flex-col items-center gap-2 text-center sm:flex-1 sm:items-start sm:text-left">
                                            <span className="flex size-14 items-center justify-center rounded-2xl bg-zinc-800/80 ring-1 ring-zinc-700/80 transition group-hover:bg-amber-500/10 group-hover:ring-amber-500/20">
                                                <Upload className="size-7 text-zinc-500 transition group-hover:text-amber-400/90" />
                                            </span>
                                            <span className="text-sm font-semibold text-zinc-200 sm:text-[15px]">
                                                {file ? file.name : 'Pilih atau seret video ke sini'}
                                            </span>
                                            <span className="max-w-md text-[11px] leading-relaxed text-zinc-600 sm:text-[12px]">
                                                MP4, MOV, WebM. Untuk browser, lebih aman di bawah ~500 MB.
                                            </span>
                                        </div>
                                        {file && (
                                            <span className="rounded-full bg-zinc-800/90 px-3 py-1.5 font-mono text-[10px] text-zinc-500 sm:shrink-0">
                                                {(file.size / (1024 * 1024)).toFixed(1)} MB
                                            </span>
                                        )}
                                    </label>

                                    {previewUrl && file && (
                                        <div className="overflow-hidden rounded-2xl border border-zinc-800/90 bg-black shadow-inner ring-1 ring-white/5">
                                            <video
                                                key={previewUrl}
                                                src={previewUrl}
                                                controls
                                                playsInline
                                                preload="metadata"
                                                className="max-h-[min(380px,48vh)] w-full object-contain"
                                                onLoadedMetadata={(e) => {
                                                    const d = e.currentTarget.duration
                                                    if (!Number.isFinite(d) || d <= 0) return
                                                    setVideoDurationSec(d)
                                                    setStartSec((s) => Math.min(Math.max(0, s), Math.max(0, d - 0.5)))
                                                    setEndSec((end) => Math.min(Math.max(0.5, end), d))
                                                }}
                                            />
                                            {videoDurationSec != null && (
                                                <p className="border-t border-zinc-800/80 bg-zinc-950/80 px-3 py-2 text-[11px] text-zinc-500">
                                                    Durasi sumber:{' '}
                                                    <span className="font-mono tabular-nums text-zinc-400">
                                                        {videoDurationSec.toFixed(1)} s
                                                    </span>
                                                    <span className="text-zinc-600"> — sesuaikan rentang potong di bawah</span>
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                                            <Clock className="size-3.5 text-zinc-600" aria-hidden />
                                            Rentang waktu (detik)
                                        </p>
                                        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-3 sm:gap-4">
                                            <div className="min-w-0">
                                                <label className="mb-1.5 block text-[11px] text-zinc-500">Mulai</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    step={0.1}
                                                    value={startSec}
                                                    onChange={(e) => setStartSec(Number(e.target.value))}
                                                    className={cn(inputClass, 'min-h-[44px]')}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <label className="mb-1.5 block text-[11px] text-zinc-500">Akhir</label>
                                                <input
                                                    type="number"
                                                    min={0.5}
                                                    step={0.1}
                                                    value={endSec}
                                                    onChange={(e) => setEndSec(Number(e.target.value))}
                                                    className={cn(inputClass, 'min-h-[44px]')}
                                                />
                                            </div>
                                            <div className="flex min-h-[44px] flex-col justify-end rounded-xl border border-zinc-800/90 bg-zinc-950/60 px-3 py-2 xs:col-span-2 sm:col-span-1">
                                                <span className="text-[10px] uppercase tracking-wide text-zinc-600">
                                                    Durasi klip
                                                </span>
                                                <span
                                                    className={cn(
                                                        'font-mono text-sm font-semibold tabular-nums',
                                                        clipDurationSec > MAX_DURATION_SEC
                                                            ? 'text-red-400'
                                                            : 'text-amber-200/90'
                                                    )}
                                                >
                                                    {clipDurationSec.toFixed(1)} s
                                                    <span className="ml-1 text-[11px] font-normal text-zinc-600">
                                                        / max {MAX_DURATION_SEC}s
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                                            Rasio output
                                        </p>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setAspect('portrait')}
                                                className={cn(
                                                    'flex min-h-[52px] items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition',
                                                    aspect === 'portrait'
                                                        ? 'border-amber-500/45 bg-gradient-to-br from-amber-500/15 to-amber-600/5 text-amber-100 ring-1 ring-amber-500/30'
                                                        : 'border-[#2a2a2e] bg-[#121214] text-zinc-500 hover:border-zinc-600 hover:bg-zinc-900/80'
                                                )}
                                            >
                                                <Smartphone
                                                    className={cn(
                                                        'mt-0.5 size-5 shrink-0',
                                                        aspect === 'portrait' ? 'text-amber-400' : 'text-zinc-600'
                                                    )}
                                                    aria-hidden
                                                />
                                                <span>
                                                    <span className="block text-[13px] font-semibold">9:16 portrait</span>
                                                    <span className="mt-0.5 block text-[11px] font-normal text-zinc-600">
                                                        TikTok, Reels, Shorts
                                                    </span>
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAspect('landscape')}
                                                className={cn(
                                                    'flex min-h-[52px] items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition',
                                                    aspect === 'landscape'
                                                        ? 'border-amber-500/45 bg-gradient-to-br from-amber-500/15 to-amber-600/5 text-amber-100 ring-1 ring-amber-500/30'
                                                        : 'border-[#2a2a2e] bg-[#121214] text-zinc-500 hover:border-zinc-600 hover:bg-zinc-900/80'
                                                )}
                                            >
                                                <Monitor
                                                    className={cn(
                                                        'mt-0.5 size-5 shrink-0',
                                                        aspect === 'landscape' ? 'text-amber-400' : 'text-zinc-600'
                                                    )}
                                                    aria-hidden
                                                />
                                                <span>
                                                    <span className="block text-[13px] font-semibold">16:9 landscape</span>
                                                    <span className="mt-0.5 block text-[11px] font-normal text-zinc-600">
                                                        YouTube wide
                                                    </span>
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                                            Perjelas video (tanpa AI)
                                        </p>
                                        <p className="mb-2 text-[11px] leading-relaxed text-zinc-600">
                                            Denoise ringan + unsharp mask — membantu kesan lebih bersih; tidak bisa
                                            memulihkan rekaman sangat blur.
                                        </p>
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                            {(
                                                [
                                                    ['off', 'Mati', 'Tanpa filter tambahan'],
                                                    ['light', 'Ringan', 'Disarankan pertama'],
                                                    ['medium', 'Sedang', 'Lebih kuat — risiko artefak'],
                                                ] as const
                                            ).map(([id, label, hint]) => (
                                                <button
                                                    key={id}
                                                    type="button"
                                                    onClick={() => setEnhance(id)}
                                                    className={cn(
                                                        'rounded-2xl border px-3 py-2.5 text-left transition',
                                                        enhance === id
                                                            ? 'border-amber-500/45 bg-amber-500/10 ring-1 ring-amber-500/25'
                                                            : 'border-[#2a2a2e] bg-[#121214] hover:border-zinc-600'
                                                    )}
                                                >
                                                    <span className="block text-[12px] font-semibold text-zinc-200">
                                                        {label}
                                                    </span>
                                                    <span className="mt-0.5 block text-[10px] text-zinc-500">{hint}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-[11px] text-zinc-500">
                                            Teks di video (opsional, satu blok untuk seluruh klip)
                                        </label>
                                        <textarea
                                            value={subtitle}
                                            onChange={(e) => setSubtitle(e.target.value)}
                                            rows={3}
                                            placeholder="Contoh: Follow untuk tips lainnya!"
                                            className={cn(inputClass, 'resize-y text-[13px] leading-relaxed')}
                                        />
                                    </div>

                                    {error && (
                                        <div
                                            role="alert"
                                            className="flex items-start gap-2 rounded-2xl border border-red-500/35 bg-red-500/10 px-3.5 py-3 text-[12px] leading-relaxed text-red-200"
                                        >
                                            <AlertCircle className="size-4 shrink-0 text-red-400" aria-hidden />
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                                        <button
                                            type="button"
                                            onClick={() => void handleProcess()}
                                            disabled={busy || !file}
                                            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 text-sm font-bold text-[#140514] shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {busy ? (
                                                <>
                                                    <Loader2 className="size-4 animate-spin" aria-hidden />
                                                    Memproses di browser…
                                                </>
                                            ) : (
                                                <>
                                                    <Scissors className="size-4" aria-hidden />
                                                    Potong &amp; ekspor MP4
                                                </>
                                            )}
                                        </button>
                                        {downloadUrl && (
                                            <a
                                                href={downloadUrl}
                                                download={`clip-${aspect}-${Date.now()}.mp4`}
                                                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/20 sm:max-w-[200px] sm:flex-none"
                                            >
                                                <Download className="size-4" aria-hidden />
                                                Unduh hasil
                                            </a>
                                        )}
                                    </div>

                                    {logLines.length > 0 && (
                                        <details className="group rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 sm:p-4">
                                            <summary className="cursor-pointer list-none text-[11px] font-medium text-zinc-500 [&::-webkit-details-marker]:hidden">
                                                <span className="inline-flex items-center gap-2">
                                                    Log FFmpeg
                                                    <span className="text-zinc-700 group-open:rotate-180">▼</span>
                                                </span>
                                            </summary>
                                            <pre className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl bg-black/40 p-3 font-mono text-[10px] leading-relaxed text-zinc-500 sm:text-[11px]">
                                                {logLines.join('\n')}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-2xl border border-zinc-800/90 bg-zinc-900/35 px-4 py-3.5 text-[12px] leading-relaxed text-zinc-500 sm:px-5 sm:py-4 sm:text-[13px]">
                                <Info className="size-4 shrink-0 text-amber-500/50 sm:mt-0.5" aria-hidden />
                                <p>
                                    FFmpeg berjalan di perangkat Anda. Video panjang atau resolusi tinggi bisa lambat di
                                    HP — perpendek durasi klip. Mode <span className="text-zinc-400">Perjelas</span>{' '}
                                    memakai filter klasik (hqdn3d + unsharp), bukan AI — tidak menambah detail yang
                                    hilang di sumber.
                                </p>
                            </div>

                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
