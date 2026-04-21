import Link from 'next/link'
import { TimelapseHubShell } from '@/components/video-timelapse/TimelapseHubShell'

export default function VideoTimelapseChecklistPage() {
    return (
        <TimelapseHubShell eyebrow="Hub Video timelapse" title="Checklist sebelum render & edit">
            <p>
                Daftar cek untuk timelapse — terpisah dari Export Center atau Timeline di app utama. Setelah gambar &
                prompt Anda siap di workflow utama, gunakan daftar ini sebagai peninjauan naratif/visual.
            </p>
            <ul className="list-inside list-disc space-y-2 text-zinc-400">
                <li>Semua shot punya arah cahaya yang masuk akal dalam satu rangkaian waktu.</li>
                <li>Gerakan kamera (jika ada) tidak melawan arah cut berikutnya.</li>
                <li>Transisi waktu (siang→malam atau progres minggu) terbaca tanpa jeda kasar.</li>
                <li>Audio bed atau musik tidak menutupi detail ASMR yang ingin Anda tonjolkan.</li>
                <li>Teks di layar (jika ada) tidak menutupi area kerja utama.</li>
            </ul>
            <p className="text-xs text-zinc-600">
                Kembali ke{' '}
                <Link href="/video-timelapse" className="text-amber-500/90 hover:text-amber-400">
                    hub Video timelapse
                </Link>
                .
            </p>
        </TimelapseHubShell>
    )
}
