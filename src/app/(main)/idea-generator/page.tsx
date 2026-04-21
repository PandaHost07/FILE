'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Sparkles, Loader2, ChevronRight, Settings, Paperclip, Send, RotateCcw, Bot } from 'lucide-react'
import Link from 'next/link'
import useAppStore from '@/store/useAppStore'
import { generateIdeaPrompts } from '@/lib/gemini'
import { IdeaCard } from '@/components/idea-generator/IdeaCard'
import type { ContentMode, IdeaResult } from '@/types'
import { cn } from '@/lib/utils'

const STYLE_OPTIONS = ['Cinematic', 'Documentary', 'Aesthetic', 'Raw/Industrial', 'Warm & Cozy', 'Photorealistic'] as const

const VIRAL_OPTIONS: { label: string; value: string }[] = [
    { label: 'Transformasi ekstrem (before/after)', value: 'extreme transformation, shocking before-after contrast' },
    { label: 'Proses memuaskan (ASMR)', value: 'satisfying restoration process, ASMR-like details' },
    { label: 'Timelapse cepat', value: 'fast-paced timelapse, high energy, quick cuts' },
    { label: 'Reveal dramatis', value: 'dramatic reveal moment, emotional transformation' },
]

const QUICK_COMBOS: {
    label: string
    hint: string
    objectType: string
    initialCondition: string
    visualStyle: string
    viralAngle: string
    contentMode: ContentMode
}[] = [
    {
        label: 'Kabin Frame & Struktur',
        hint: 'Framing kayu di hutan, progress sangat cepat',
        objectType: 'pembangunan kabin kayu kecil di lereng',
        initialCondition: 'tahap framing, debu serbuk kayu',
        visualStyle: 'Documentary',
        viralAngle: 'fast-paced timelapse, structural progress',
        contentMode: 'cabin_build',
    },
    {
        label: 'Eksterior Kabin Jadi',
        hint: 'Siding, stain, atap dramatis',
        objectType: 'penyelesaian eksterior kabin',
        initialCondition: 'pemasangan atap logam, hutan',
        visualStyle: 'Photorealistic',
        viralAngle: 'dramatic reveal moment, hero wide shot',
        contentMode: 'cabin_build',
    },
    {
        label: 'Restorasi Kursi Antik',
        hint: 'Kondisi patah & hancur total',
        objectType: 'kursi kayu antik',
        initialCondition: 'cat mengelupas parah, berdebu',
        visualStyle: 'Cinematic',
        viralAngle: 'extreme transformation, before-after',
        contentMode: 'restoration',
    },
    {
        label: 'Mesin Motor Klasik',
        hint: 'Bongkar karatan ke mengkilap',
        objectType: 'mesin motor klasik',
        initialCondition: 'berkarat parah, kotor, gudang bocor',
        visualStyle: 'Raw/Industrial',
        viralAngle: 'satisfying restoration process, ASMR',
        contentMode: 'restoration',
    },
]

export default function IdeaGeneratorPage() {
    const router = useRouter()
    const { apiKeys, activeProjectId, createProject, addScenesFromIdea } = useAppStore()

    const [ideas, setIdeas] = useState<IdeaResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [objectType, setObjectType] = useState('')
    const [condition, setCondition] = useState('')
    const [visualStyle, setVisualStyle] = useState<string>('Cinematic')
    const [viralAngle, setViralAngle] = useState(VIRAL_OPTIONS[0].value)
    const [projectContentMode, setProjectContentMode] = useState<ContentMode>('restoration')
    
    // Track sent prompts for display
    const [lastPrompt, setLastPrompt] = useState<{object: string, condition: string} | null>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Persist State across navigation
    useEffect(() => {
        const saved = sessionStorage.getItem('ideaGeneratorState')
        if (saved) {
            try {
                const s = JSON.parse(saved)
                setIdeas(s.ideas || [])
                setObjectType(s.objectType || '')
                setCondition(s.condition || '')
                setVisualStyle(s.visualStyle || 'Cinematic')
                setViralAngle(s.viralAngle || VIRAL_OPTIONS[0].value)
                setProjectContentMode(s.projectContentMode || 'restoration')
                setLastPrompt(s.lastPrompt || null)
            } catch (e) {
                console.error('Failed to parse idea generator state', e)
            }
        }
    }, [])

    useEffect(() => {
        sessionStorage.setItem('ideaGeneratorState', JSON.stringify({
            ideas, objectType, condition, visualStyle, viralAngle, projectContentMode, lastPrompt
        }))
    }, [ideas, objectType, condition, visualStyle, viralAngle, projectContentMode, lastPrompt])

    const canGenerate = objectType.trim().length > 0 && Boolean(apiKeys.gemini)

    // Scroll to bottom when new ideas arrive or loading changes
    useEffect(() => {
        if (ideas.length > 0 || isLoading) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [ideas, isLoading])

    async function runGenerate(payload: {
        objectType: string
        condition: string
        visualStyle: string
        viralAngle: string
    }) {
        setIsLoading(true)
        setError(null)
        setLastPrompt({ object: payload.objectType, condition: payload.condition })
        try {
            const results = await generateIdeaPrompts(apiKeys.gemini, {
                objectType: payload.objectType,
                initialCondition: `${payload.condition}. Viral angle: ${payload.viralAngle}`,
                visualStyle: payload.visualStyle,
            })
            setIdeas(results)
            // Do not clear inputs so user sees context, let them start a "New Idea Chat" if they want to.
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat generate ide.')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleGenerate() {
        if (!canGenerate) return
        await runGenerate({ objectType: objectType.trim(), condition: condition.trim(), visualStyle, viralAngle })
    }

    async function handleQuickCombo(combo: (typeof QUICK_COMBOS)[0]) {
        setProjectContentMode(combo.contentMode)
        setObjectType(combo.objectType)
        setCondition(combo.initialCondition)
        setVisualStyle(combo.visualStyle)
        setViralAngle(combo.viralAngle)
        if (!apiKeys.gemini) {
           setError('API Keu Gemini belum disetting!')
           return
        }
        await runGenerate({
            objectType: combo.objectType,
            condition: combo.initialCondition,
            visualStyle: combo.visualStyle,
            viralAngle: combo.viralAngle,
        })
    }

    function handleSelect(idea: IdeaResult) {
        let projectId = activeProjectId
        if (!projectId) {
            projectId = createProject(idea.title, 'lainnya', projectContentMode)
        }
        addScenesFromIdea(projectId, idea.suggestedScenes)
        router.push('/scene-builder')
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#050505]">
            {/* Main Chat Area Left/Center */}
            <div className="relative flex min-w-0 flex-1 flex-col bg-[#050505]">
                {/* Header */}
                <header className="flex shrink-0 items-center gap-3 border-b border-zinc-800/60 bg-[#050505] px-6 py-4 z-10">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded bg-[#10B981]/10">
                        <Bot className="size-4 text-[#10B981]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-zinc-100">Gemini Idea Chat</h1>
                        <p className="text-xs text-zinc-500">Chat with AI to brainstorm your next viral hit</p>
                    </div>
                    {!apiKeys.gemini && (
                        <Link href="/settings" className="ml-auto flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/20">
                            <AlertTriangle className="size-3" />
                            Missing API Key
                        </Link>
                    )}
                </header>

                {/* Chat Scroll View */}
                <div className="flex-1 overflow-y-auto px-4 pb-36 pt-8 scrollbar-thin md:px-8">
                    <div className="mx-auto max-w-4xl space-y-8">

                        {/* Empty State / Start Conversation */}
                        {ideas.length === 0 && !isLoading && (
                            <div className="flex flex-col items-center justify-center pt-8 md:pt-16">
                                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-zinc-800/80 bg-[#0A0A0A] shadow-xl">
                                    <Bot className="size-8 text-[#10B981]" />
                                </div>
                                <h2 className="mb-3 text-2xl font-bold tracking-tight text-zinc-100">Start a conversation</h2>
                                <p className="mb-10 max-w-md text-center text-sm text-zinc-500">
                                    Type an object or subject below to start generating scenes, or choose from our tested viral quick combos.
                                </p>

                                <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
                                    {QUICK_COMBOS.map((combo) => (
                                        <button
                                            key={combo.label}
                                            onClick={() => void handleQuickCombo(combo)}
                                            disabled={!apiKeys.gemini || isLoading}
                                            className="group flex flex-col justify-between gap-3 rounded-xl border border-zinc-800/70 bg-[#0A0A0A]/50 px-5 py-4 text-left transition-all hover:border-[#10B981]/40 hover:bg-[#10B981]/5 disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-semibold text-zinc-200">{combo.label}</p>
                                                <p className="mt-1 line-clamp-2 text-xs text-zinc-500 group-hover:text-zinc-400">{combo.hint}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mx-auto max-w-3xl rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-400 shadow-sm">
                                {error}
                            </div>
                        )}

                        {/* Sent Message Bubble */}
                        {(ideas.length > 0 || isLoading) && lastPrompt && (
                            <div className="flex w-full justify-end">
                                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-zinc-800/60 px-5 py-4 text-[13px] text-zinc-200 shadow-sm border border-zinc-700/30">
                                    <span className="mb-1 block font-medium text-[#10B981]">Subject: {lastPrompt.object}</span>
                                    {lastPrompt.condition && <span className="block text-zinc-400 mt-1.5 leading-relaxed">{lastPrompt.condition}</span>}
                                </div>
                            </div>
                        )}

                        {/* Received Message Results */}
                        {ideas.length > 0 && (
                            <div className="flex w-full justify-start">
                                <div className="flex w-full max-w-5xl items-start gap-4">
                                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
                                        <Sparkles className="size-4 text-[#10B981]" />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-5">
                                        <p className="text-[13px] font-medium text-zinc-300">Here are some viral concept ideas for your video:</p>
                                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                            {ideas.map((idea, i) => (
                                                <IdeaCard key={i} idea={idea} index={i} onSelect={handleSelect} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loading State AI Thinking */}
                        {isLoading && (
                            <div className="flex w-full justify-start">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
                                        <Loader2 className="size-4 animate-spin text-[#10B981]" />
                                    </div>
                                    <div className="flex items-center rounded-2xl rounded-tl-sm border border-zinc-800/60 bg-[#0A0A0A] px-5 py-3.5 mt-0.5">
                                        <div className="flex gap-1.5">
                                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-600 [animation-delay:-0.3s]"></div>
                                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-600 [animation-delay:-0.15s]"></div>
                                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-600"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} className="h-1" />
                    </div>
                </div>

                {/* Fixed Chat Input Area */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-12 pb-6 px-4 md:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="relative flex items-end gap-2 rounded-2xl border border-zinc-700/60 bg-[#0e0e11] p-2 shadow-2xl transition-colors focus-within:border-[#10B981]/50">
                            <button className="flex size-10 shrink-0 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-300">
                                <Paperclip className="size-5" />
                            </button>
                            <textarea
                                value={objectType}
                                onChange={(e) => setObjectType(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        if (canGenerate && !isLoading) void handleGenerate()
                                    }
                                }}
                                disabled={isLoading}
                                placeholder="Type a subject like 'Vintage sofa' or 'Log cabin in woods'... (Shift+Enter for new line)"
                                className="max-h-32 min-h-[40px] w-full resize-none border-0 bg-transparent py-2.5 text-[13px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-0 disabled:opacity-50 scrollbar-thin"
                                rows={1}
                            />
                            <button
                                onClick={() => void handleGenerate()}
                                disabled={!canGenerate || isLoading}
                                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#10B981] text-zinc-950 transition-all hover:bg-[#0ea5e9]/90 hover:brightness-110 disabled:bg-zinc-800 disabled:text-zinc-500"
                            >
                                <Send className="size-4 -ml-0.5" />
                            </button>
                        </div>
                        <div className="mt-2.5 text-center text-[10px] text-zinc-600 font-medium">
                            Powered by Google Gemini AI. Ensure you configure visual and viral styles in the settings sidebar.
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Idea Settings */}
            <div className="hidden w-[320px] shrink-0 flex-col overflow-y-auto border-l border-zinc-800/60 bg-[#070709] lg:flex">
                <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800/60 px-5 py-[18px]">
                    <Settings className="size-4 text-zinc-400" />
                    <h2 className="text-sm font-semibold text-zinc-100">Chat Settings</h2>
                    <span className="ml-auto text-[10px] font-medium text-zinc-500">Gemini AI Config</span>
                </div>

                <div className="flex-1 space-y-8 p-5">
                    {/* Project Mode */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#10B981]">
                            <Sparkles className="size-3.5" />
                            <span>Configuration</span>
                        </div>
                        <div className="flex rounded-lg border border-zinc-800/80 bg-[#0A0A0A] p-1">
                            <button
                                onClick={() => setProjectContentMode('restoration')}
                                className={cn(
                                    'flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                                    projectContentMode === 'restoration'
                                        ? 'bg-[#18181B] text-zinc-100 border border-zinc-700/50 shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                )}
                            >
                                Restorasi
                            </button>
                            <button
                                onClick={() => setProjectContentMode('cabin_build')}
                                className={cn(
                                    'flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                                    projectContentMode === 'cabin_build'
                                        ? 'bg-[#18181B] text-zinc-100 border border-zinc-700/50 shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                )}
                            >
                                Kabin
                            </button>
                        </div>
                    </div>

                    {/* Visual Style */}
                    <div className="space-y-2.5">
                        <label className="text-xs font-semibold text-zinc-300">Visual Style</label>
                        <div className="relative">
                            <select
                                value={visualStyle}
                                onChange={(e) => setVisualStyle(e.target.value)}
                                className="w-full appearance-none rounded-lg border border-zinc-800 bg-[#0A0A0A] px-3.5 py-2.5 text-xs font-medium text-zinc-200 outline-none transition-colors hover:border-zinc-700 focus:border-[#10B981]/50 cursor-pointer"
                            >
                                {STYLE_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <ChevronRight className="size-3.5 rotate-90 text-zinc-500" />
                            </div>
                        </div>
                    </div>

                    {/* Viral Angle */}
                    <div className="space-y-2.5">
                        <label className="text-xs font-semibold text-zinc-300">Viral Angle Pattern</label>
                        <div className="relative">
                            <select
                                value={viralAngle}
                                onChange={(e) => setViralAngle(e.target.value)}
                                className="w-full appearance-none rounded-lg border border-zinc-800 bg-[#0A0A0A] px-3.5 py-2.5 text-xs font-medium text-zinc-200 outline-none transition-colors hover:border-zinc-700 focus:border-[#10B981]/50 cursor-pointer"
                            >
                                {VIRAL_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <ChevronRight className="size-3.5 rotate-90 text-zinc-500" />
                            </div>
                        </div>
                    </div>

                    {/* Initial Condition */}
                    <div className="space-y-2.5 pt-6 border-t border-zinc-800/40">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-semibold text-[#10B981]">System Prompt</h3>
                        </div>
                        <p className="text-[11px] leading-relaxed text-zinc-500">
                            Optional. Sets the detailed physical condition of the object or environment before the video starts.
                        </p>
                        <textarea
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            placeholder="e.g. 'Rusted surface, moss growing over engine, abandoned in the woods...'"
                            className="w-full min-h-[140px] resize-none rounded-lg border border-zinc-800 bg-[#0A0A0A] p-3 text-[13px] text-zinc-200 placeholder:text-zinc-600 outline-none transition-colors hover:border-zinc-700 focus:border-[#10B981]/50 scrollbar-thin"
                        />
                        <div className="flex items-center justify-between px-1 text-[10px] font-medium text-zinc-600 uppercase tracking-wide">
                            <span>Characters</span>
                            <span>{condition.length} / 500</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-auto shrink-0 border-t border-zinc-800/60 bg-[#070709] p-5">
                    <button
                        onClick={() => {
                            setIdeas([])
                            setObjectType('')
                            setCondition('')
                            setLastPrompt(null)
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#10B981]/15 border border-[#10B981]/20 px-4 py-2.5 text-[13px] font-semibold text-[#10B981] transition-colors hover:bg-[#10B981]/25 hover:border-[#10B981]/30"
                    >
                        <RotateCcw className="size-4" />
                        New Chat
                    </button>
                </div>
            </div>
        </div>
    )
}
