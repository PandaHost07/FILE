import Link from 'next/link'
import { TimelapseHubShell } from '@/components/video-timelapse/TimelapseHubShell'

export default function VideoTimelapsePerencanaanVisualPage() {
    return (
        <TimelapseHubShell eyebrow="Restorasi / workshop" title="Perencanaan urutan & shot visual">
            <p>
                Checklist perencanaan shot untuk konten workshop — hanya di dalam hub Video timelapse, tanpa tautan ke
                storyboard atau library prompt app utama.
            </p>
            <ul className="list-inside list-disc space-y-2 text-zinc-400">
                <li>
                    <strong className="text-zinc-300">Before:</strong> satu frame penuh objek + konteks meja; cahaya
                    konsisten dengan after.
                </li>
                <li>
                    <strong className="text-zinc-300">Proses:</strong> urutkan dari kasar ke halus (amplas → lapisan →
                    kilap); satu gerakan utama per segmen pendek.
                </li>
                <li>
                    <strong className="text-zinc-300">After:</strong> hero shot + detail tekstur; satu transisi lambat
                    before→after jika memungkinkan.
                </li>
                <li>Jaga palet hangat dan refleksi konsisten antar shot agar terasa satu sesi.</li>
            </ul>
            <p className="text-xs text-zinc-600">
                Lihat juga{' '}
                <Link href="/video-timelapse/restorasi" className="text-amber-500/90 hover:text-amber-400">
                    panduan Restorasi
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
