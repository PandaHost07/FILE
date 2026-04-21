import type { FFmpeg } from '@ffmpeg/ffmpeg'

let ffmpegSingleton: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

/** Font bebas (DejaVu) — dipakai drawtext di WASM; subtitles= sering gagal tanpa font di MEMFS. */
const OVERLAY_FONT_URL =
    'https://cdn.jsdelivr.net/gh/dejavu-fonts/dejavu-fonts@version_2_37/ttf/DejaVuSans.ttf'

export type ClipAspect = 'portrait' | 'landscape'

/** Perjelas gambar tanpa AI: denoise ringan + unsharp mask (FFmpeg klasik). */
export type ClipEnhance = 'off' | 'light' | 'medium'

/** Sisipkan setelah scale/crop: hqdn3d + unsharp (nilai konservatif agar tidak artefak berlebihan). */
export function applyEnhanceVf(baseFilterGraph: string, enhance: ClipEnhance): string {
    if (enhance === 'off') return baseFilterGraph
    const chain =
        enhance === 'light'
            ? 'hqdn3d=2:1:3:2,unsharp=5:5:0.5:3:3:0.25'
            : 'hqdn3d=2.5:1.5:4:3,unsharp=5:5:0.75:3:3:0.38'
    return `${baseFilterGraph},${chain}`
}

function toError(e: unknown): Error {
    if (e instanceof Error) return e
    if (typeof e === 'string') return new Error(e)
    return new Error(String(e))
}

/** Pesan error untuk UI (FFmpeg worker sering me-reject string, bukan Error). */
export function formatClipError(e: unknown): string {
    const m = toError(e).message.trim()
    return m || 'Gagal memproses video.'
}

/** Muat FFmpeg.wasm sekali (CDN unpkg). */
export async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
    if (ffmpegSingleton) {
        return ffmpegSingleton
    }
    if (loadPromise) return loadPromise

    loadPromise = (async () => {
        const { FFmpeg } = await import('@ffmpeg/ffmpeg')

        const ffmpeg = new FFmpeg()
        if (onLog) {
            ffmpeg.on('log', ({ message }) => onLog(message))
        }
        ffmpeg.on('progress', ({ progress }) => {
            if (onLog && progress > 0) {
                onLog(`progress ${Math.round(progress * 100)}%`)
            }
        })

        /**
         * Pakai URL HTTPS langsung (bukan toBlobURL). Worker FFmpeg memanggil
         * `import(coreURL)`; URL `blob:http://...` sering membuat webpack/Next.js
         * salah mengartikan sebagai modul ("Cannot find module 'blob:...'").
         * unpkg mengirim CORS yang cukup untuk dynamic import di worker.
         */
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
        await ffmpeg.load({
            coreURL: `${baseURL}/ffmpeg-core.js`,
            wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        })

        ffmpegSingleton = ffmpeg
        return ffmpeg
    })()

    return loadPromise
}

function vfScaleCrop(aspect: ClipAspect): string {
    const w = aspect === 'portrait' ? 1080 : 1920
    const h = aspect === 'portrait' ? 1920 : 1080
    return `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`
}

function vfScaledWithEnhance(aspect: ClipAspect, enhance: ClipEnhance): string {
    return applyEnhanceVf(vfScaleCrop(aspect), enhance)
}

/** Teks di video via drawtext + textfile (hindari filter subtitles= yang rawan font di WASM). */
function vfWithDrawtext(aspect: ClipAspect, fontsize: number, enhance: ClipEnhance): string {
    const base = vfScaledWithEnhance(aspect, enhance)
    return `${base},drawtext=fontfile=font.ttf:textfile=text.txt:fontsize=${fontsize}:fontcolor=white:borderw=2:bordercolor=black@0.9:x=(w-tw)/2:y=h-th-100:line_spacing=8:box=1:boxcolor=black@0.45:boxborderw=12`
}

export type RunClipInput = {
    file: File
    startSec: number
    endSec: number
    aspect: ClipAspect
    subtitleText: string
    /** Denoise + ketajaman ringan (bukan AI). Default off. */
    enhance?: ClipEnhance
    onLog?: (msg: string) => void
}

function buildArgs(
    inName: string,
    outName: string,
    start: number,
    duration: number,
    vf: string,
    audioMode: 'aac' | 'none',
    crf: number
): string[] {
    const tail =
        audioMode === 'aac'
            ? ['-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-y', outName]
            : ['-an', '-movflags', '+faststart', '-y', outName]

    return [
        '-i',
        inName,
        '-ss',
        String(start),
        '-t',
        String(duration),
        '-vf',
        vf,
        '-pix_fmt',
        'yuv420p',
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        String(crf),
        ...tail,
    ]
}

/** Potong, crop ke 9:16 atau 16:9, opsional teks bakar dengan drawtext. */
export async function runClipJob(input: RunClipInput): Promise<Blob> {
    const { fetchFile } = await import('@ffmpeg/util')
    const ffmpeg = await getFFmpeg(input.onLog)

    const start = Math.max(0, input.startSec)
    const end = Math.max(start + 0.5, input.endSec)
    const duration = end - start
    const enhance = input.enhance ?? 'off'
    const crf = enhance === 'off' ? 23 : 22

    const inName = 'clip_in.mp4'
    const outName = 'clip_out.mp4'
    const textName = 'text.txt'
    const fontName = 'font.ttf'

    await ffmpeg.writeFile(inName, await fetchFile(input.file))

    const text = input.subtitleText.trim()
    let hasOverlay = false
    if (text) {
        try {
            const fontBuf = await fetchFile(OVERLAY_FONT_URL)
            if (fontBuf.byteLength > 1000) {
                await ffmpeg.writeFile(fontName, fontBuf)
                await ffmpeg.writeFile(textName, new TextEncoder().encode(text.replace(/\r\n/g, '\n')))
                hasOverlay = true
            }
        } catch {
            input.onLog?.('Font overlay tidak bisa diunduh — lanjut tanpa teks di video.')
        }
    }

    const fontsize = input.aspect === 'portrait' ? 52 : 48
    const vfPlain = vfScaleCrop(input.aspect)

    async function runEncode(vf: string): Promise<void> {
        let first: unknown
        try {
            await ffmpeg.exec(buildArgs(inName, outName, start, duration, vf, 'aac', crf))
            return
        } catch (e) {
            first = e
        }
        try {
            await ffmpeg.exec(buildArgs(inName, outName, start, duration, vf, 'none', crf))
        } catch (e) {
            throw toError(first ?? e)
        }
    }

    const vfWithText = hasOverlay
        ? vfWithDrawtext(input.aspect, fontsize, enhance)
        : vfScaledWithEnhance(input.aspect, enhance)
    const vfWithTextNoEnhance = hasOverlay
        ? vfWithDrawtext(input.aspect, fontsize, 'off')
        : vfScaledWithEnhance(input.aspect, 'off')

    try {
        await runEncode(vfWithText)
    } catch (e1) {
        if (enhance !== 'off') {
            input.onLog?.(
                `Filter perjelas gagal: ${formatClipError(e1)} — mengulang tanpa hqdn3d/unsharp.`
            )
            try {
                await runEncode(vfWithTextNoEnhance)
            } catch (e2) {
                if (hasOverlay) {
                    input.onLog?.(`Encode dengan teks gagal: ${formatClipError(e2)} — coba tanpa teks.`)
                    await ffmpeg.deleteFile(textName).catch(() => {})
                    await ffmpeg.deleteFile(fontName).catch(() => {})
                    await runEncode(vfPlain)
                } else {
                    throw toError(e2)
                }
            }
        } else if (hasOverlay) {
            input.onLog?.(`Encode dengan teks gagal: ${formatClipError(e1)} — coba tanpa teks.`)
            await ffmpeg.deleteFile(textName).catch(() => {})
            await ffmpeg.deleteFile(fontName).catch(() => {})
            await runEncode(vfPlain)
        } else {
            throw toError(e1)
        }
    }

    let data: Uint8Array | string
    try {
        data = await ffmpeg.readFile(outName)
    } catch (e) {
        throw new Error(
            `Tidak ada file keluaran. ${formatClipError(e)} — cek log FFmpeg atau kurangi durasi/resolusi.`
        )
    }

    const u8 =
        data instanceof Uint8Array
            ? data
            : new Uint8Array(data as unknown as ArrayBuffer)

    await ffmpeg.deleteFile(inName).catch(() => {})
    await ffmpeg.deleteFile(outName).catch(() => {})
    await ffmpeg.deleteFile(textName).catch(() => {})
    await ffmpeg.deleteFile(fontName).catch(() => {})

    const copy = u8.slice()
    return new Blob([copy], { type: 'video/mp4' })
}
