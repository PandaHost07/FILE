'use client'

import { useState } from 'react'
import { TrendingUp, AlertCircle, CheckCircle, Clock, Target, BarChart3 } from 'lucide-react'

interface AnalysisResult {
    score: number
    strengths: string[]
    improvements: string[]
    recommendations: string[]
    engagement: {
        potential: 'Low' | 'Medium' | 'High' | 'Very High'
        estimatedViews: string
        estimatedLikes: string
        conversionRate: string
    }
    timing: {
        bestPostTimes: string[]
        optimalFrequency: string
        contentPacing: string
    }
}

interface GeneratedContentShape {
    hook?: string
    caption?: string
    hashtags?: string[]
    callToAction?: string
    shootingTip?: string
    videoPrompt?: string
    rencanaShot?: string
}

export function ContentAnalyzer({ content }: { content: GeneratedContentShape }) {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const analyzeContent = async () => {
        setIsAnalyzing(true)

        setTimeout(() => {
            const result: AnalysisResult = {
                score: 85,
                strengths: [
                    'Hook menarik perhatian di detik awal',
                    'CTA jelas untuk konversi',
                    'Hashtag relevan dengan audiens',
                    'Struktur narasi mudah diikuti',
                ],
                improvements: [
                    'Tambahkan pemicu emosi spesifik (restorasi / before-after)',
                    'Cantumkan saran audio trending TikTok',
                    'Sesuaikan panjang caption untuk 9:16',
                    'Ide kontinuitas seri (part 2, proses, hasil akhir)',
                ],
                recommendations: [
                    'Posting jam ramai (19:00–21:00) untuk jangkauan maksimal',
                    'Padukan dengan visual timelapse dari Prompt Studio / Video Timelapse',
                    'Buat seri 3–5 video dengan hook serupa',
                    'Cross-promo ke Reels / Shorts dengan skrip yang sama',
                ],
                engagement: {
                    potential: 'High',
                    estimatedViews: '250K–500K',
                    estimatedLikes: '15K–30K',
                    conversionRate: '8–12%',
                },
                timing: {
                    bestPostTimes: ['19:00–21:00', '12:00–13:00', '15:00–17:00'],
                    optimalFrequency: '3–4 kali per minggu',
                    contentPacing: 'Seri 3–5 konten terkait',
                },
            }
            setAnalysis(result)
            setIsAnalyzing(false)
        }, 2000)
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400'
        if (score >= 60) return 'text-amber-400'
        return 'text-red-400'
    }

    const getPotentialColor = (potential: string) => {
        switch (potential) {
            case 'Very High':
                return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            case 'High':
                return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
            case 'Medium':
                return 'border-amber-500/30 bg-amber-500/10 text-amber-400'
            default:
                return 'border-zinc-600 bg-zinc-800/60 text-zinc-400'
        }
    }

    const hasContent = Boolean(content?.hook?.trim())

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-100">
                    <BarChart3 className="size-5 text-emerald-400" />
                    Analisa konten
                </h3>
                <button
                    type="button"
                    onClick={analyzeContent}
                    disabled={isAnalyzing || !hasContent}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {isAnalyzing ? (
                        <>
                            <Clock className="size-4 animate-spin" />
                            Menganalisa…
                        </>
                    ) : (
                        <>
                            <TrendingUp className="size-4" />
                            Analisa
                        </>
                    )}
                </button>
            </div>

            {!hasContent && (
                <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[13px] text-amber-200/90">
                    Generate konten di tab Generator dulu, lalu kembali ke sini untuk analisa estimasi performa.
                </p>
            )}

            {analysis && (
                <div className="space-y-4">
                    <div className="rounded-xl border border-[#1f1f24] bg-[#121214] p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-zinc-100">Skor konten</h4>
                            <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                                {analysis.score}/100
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-800">
                            <div
                                className={`h-2 rounded-full transition-all ${
                                    analysis.score >= 80
                                        ? 'bg-emerald-500'
                                        : analysis.score >= 60
                                          ? 'bg-amber-500'
                                          : 'bg-red-500'
                                }`}
                                style={{ width: `${analysis.score}%` }}
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#1f1f24] bg-[#121214] p-6">
                        <h4 className="mb-4 text-sm font-semibold text-zinc-100">Potensi engagement</h4>
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm text-zinc-400">Level</span>
                            <span
                                className={`rounded-full border px-3 py-1 text-xs font-medium ${getPotentialColor(analysis.engagement.potential)}`}
                            >
                                {analysis.engagement.potential}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="mb-1 text-xs text-zinc-500">Est. views</p>
                                <p className="text-lg font-bold text-emerald-400">{analysis.engagement.estimatedViews}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-zinc-500">Est. likes</p>
                                <p className="text-lg font-bold text-cyan-400">{analysis.engagement.estimatedLikes}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-zinc-500">Konversi</p>
                                <p className="text-lg font-bold text-violet-400">{analysis.engagement.conversionRate}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#1f1f24] bg-[#121214] p-6">
                        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-100">
                            <CheckCircle className="size-4 text-emerald-400" />
                            Kekuatan
                        </h4>
                        <ul className="space-y-2">
                            {analysis.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                                    <span className="mt-0.5 text-emerald-400">+</span>
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-xl border border-[#1f1f24] bg-[#121214] p-6">
                        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-100">
                            <AlertCircle className="size-4 text-amber-400" />
                            Perbaikan
                        </h4>
                        <ul className="space-y-2">
                            {analysis.improvements.map((improvement, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                                    <span className="mt-0.5 text-amber-400">!</span>
                                    {improvement}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-xl border border-[#1f1f24] bg-[#121214] p-6">
                        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-100">
                            <Target className="size-4 text-violet-400" />
                            Rekomendasi
                        </h4>
                        <ul className="space-y-2">
                            {analysis.recommendations.map((recommendation, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                                    <span className="mt-0.5 text-violet-400">•</span>
                                    {recommendation}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-xl border border-[#1f1f24] bg-[#121214] p-6">
                        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-100">
                            <Clock className="size-4 text-cyan-400" />
                            Strategi waktu
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <p className="mb-1 text-xs text-zinc-500">Jam posting</p>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.timing.bestPostTimes.map((time, index) => (
                                        <span
                                            key={index}
                                            className="rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300"
                                        >
                                            {time}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-zinc-500">Frekuensi</p>
                                <p className="text-sm text-zinc-300">{analysis.timing.optimalFrequency}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-zinc-500">Ritme serial</p>
                                <p className="text-sm text-zinc-300">{analysis.timing.contentPacing}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
