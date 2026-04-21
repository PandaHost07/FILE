import Link from 'next/link'
import { TimelapseHubShell } from '@/components/video-timelapse/TimelapseHubShell'

export default function VideoTimelapseNarasiPage() {
    return (
        <TimelapseHubShell eyebrow="Cabin / outdoor" title="Narasi & iringan episode">
            <p>
                Panduan narasi khusus timelapse pembangunan. Tidak terhubung ke generator script di app utama — ini
                hanya kerangka untuk Anda tulis atau rekam sendiri.
            </p>
            <ul className="list-inside list-disc space-y-2 text-zinc-400">
                <li>Buka dengan lokasi dan tujuan struktur (mis. &ldquo;Hari ke-12: atap mulai menutup…&rdquo;).</li>
                <li>Tengah episode: sebutkan material dan cuaca agar selaras dengan gambar timelapse.</li>
                <li>Penutup: satu kalimat emosional + ajakan singkat (subscribe / episode berikutnya).</li>
                <li>Musik: dokumenter akustik atau ambient; hindari vokal keras yang bertabrakan dengan suara alam.</li>
            </ul>
            <p className="text-xs text-zinc-600">
                Lihat juga{' '}
                <Link href="/video-timelapse/cabin" className="text-amber-500/90 hover:text-amber-400">
                    panduan Cabin
                </Link>{' '}
                dan{' '}
                <Link href="/video-timelapse/ide" className="text-amber-500/90 hover:text-amber-400">
                    ide & konten
                </Link>
                .
            </p>
        </TimelapseHubShell>
    )
}
