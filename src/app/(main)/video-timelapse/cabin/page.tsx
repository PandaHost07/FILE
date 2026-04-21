'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Lightbulb, FileText } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { TIMELAPSE_TO_CONTENT_MODE } from '@/lib/videoTimelapseNav'

export default function VideoTimelapseCabinPage() {
    const { activeProjectId, updateProjectContentMode } = useAppStore()

    useEffect(() => {
        if (activeProjectId) {
            updateProjectContentMode(activeProjectId, TIMELAPSE_TO_CONTENT_MODE.cabin)
        }
    }, [activeProjectId, updateProjectContentMode])

    return (
        <div className="min-h-full bg-zinc-950">
            <div className="w-full min-w-0 space-y-8 px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
                <Link
                    href="/video-timelapse"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-amber-400"
                >
                    ← Hub Video timelapse
                </Link>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500/90">Mode cabin</p>
                    <h1 className="mt-1 text-2xl font-bold text-zinc-100">Timelapse outdoor & pembangunan</h1>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                        Gunakan sudut <strong className="text-zinc-300">establishing</strong> untuk lokasi, lalu
                        persempit ke detail struktur. Jaga konsistensi arah cahaya dan musim antar scene agar montase
                        timelapse terasa satu rangkaian.
                    </p>
                </div>

                <ul className="space-y-3 rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-5 text-sm text-zinc-400">
                    <li className="flex gap-2">
                        <span className="text-emerald-500">•</span>
                        Prioritaskan prompt yang menyebut langit, awan, dan bayangan panjang untuk transisi waktu.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-emerald-500">•</span>
                        Untuk video prompt: gerakan kamera lambat (pan / dolly) agar cocok dengan iringan musik
                        dokumenter.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-emerald-500">•</span>
                        Narasi episode: gunakan halaman{' '}
                        <strong className="text-zinc-300">Narasi & iringan</strong> di hub ini (bukan menu app utama).
                    </li>
                </ul>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/video-timelapse/ide"
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
                    >
                        <Lightbulb className="size-4" />
                        Ide & konten (hub)
                        <ArrowRight className="size-4" />
                    </Link>
                    <Link
                        href="/video-timelapse/narasi"
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
                    >
                        <FileText className="size-4" />
                        Narasi & iringan
                    </Link>
                    <Link
                        href="/video-timelapse/restorasi"
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
                    >
                        <BookOpen className="size-4" />
                        Lihat panduan Restorasi
                    </Link>
                </div>

                <p className="text-xs text-zinc-600">
                    Untuk membuat scene & prompt di RestoreGen, gunakan grup <strong className="text-zinc-400">Workflow</strong>{' '}
                    di sidebar — terpisah dari hub Video timelapse ini.
                </p>
            </div>
        </div>
    )
}
