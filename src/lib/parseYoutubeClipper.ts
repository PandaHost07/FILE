/** Ekstrak ID video YouTube dari URL (untuk embed). Tanpa dependensi FFmpeg — aman untuk impor statis di halaman Clipper. */
export function parseYoutubeVideoId(url: string): string | null {
    const s = url.trim()
    if (!s) return null
    try {
        const u = new URL(s.startsWith('http') ? s : `https://${s}`)
        if (u.hostname === 'youtu.be') {
            const id = u.pathname.slice(1).split('/')[0]
            return id?.length === 11 ? id : null
        }
        if (u.hostname.includes('youtube.com')) {
            const v = u.searchParams.get('v')
            if (v && v.length === 11) return v
            const m = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/)
            if (m) return m[1]!
            const s2 = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/)
            if (s2) return s2[1]!
        }
    } catch {
        return null
    }
    return null
}
