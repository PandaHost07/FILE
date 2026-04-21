import Link from 'next/link'
import { TimelapseHubShell } from '@/components/video-timelapse/TimelapseHubShell'

export default function VideoTimelapseIdePage() {
    return (
        <TimelapseHubShell eyebrow="Hub Video timelapse" title="Ide & konten untuk timelapse">
            <p>
                Halaman ini hanya untuk merencanakan konten video timelapse. Semua langkah produksi di app utama
                (scene, prompt, render) dilakukan lewat menu <strong className="text-zinc-300">Workflow</strong> di
                sidebar — terpisah dari hub ini.
            </p>
            <ul className="list-inside list-disc space-y-2 text-zinc-400">
                <li>
                    <strong className="text-zinc-300">Hook3–5 detik:</strong> perubahan visual yang jelas (cuaca,
                    struktur, atau reveal alat).
                </li>
                <li>
                    <strong className="text-zinc-300">Episode arc:</strong> wide establishing → progres detail →
                    payoff (struktur jadi / kilap akhir).
                </li>
                <li>
                    <strong className="text-zinc-300">Cabin / outdoor:</strong> tekankan musim, arah matahari, dan
                    ritme pembangunan agar montase terasa satu hari atau satu musim.
                </li>
                <li>
                    <strong className="text-zinc-300">Restorasi / workshop:</strong> tekankan tekstur, tangan, alat,
                    dan kontras before/after; gerakan kamera minimal agar proses terbaca.
                </li>
            </ul>
            <p className="text-xs text-zinc-600">
                Kembali ke panduan mode lewat menu kartu di hub, atau buka{' '}
                <Link href="/video-timelapse/cabin" className="text-amber-500/90 hover:text-amber-400">
                    Cabin
                </Link>{' '}
                /{' '}
                <Link href="/video-timelapse/restorasi" className="text-amber-500/90 hover:text-amber-400">
                    Restorasi
                </Link>
                .
            </p>
        </TimelapseHubShell>
    )
}
