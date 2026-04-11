'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Settings, Clapperboard, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WORKFLOW_NAV } from '@/lib/workflowNav'
import useAppStore from '@/store/useAppStore'
import { GlobalProgressBar } from './GlobalProgressBar'

const NAV = [
    {
        group: 'Menu',
        items: [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/library', label: 'Library', icon: BookOpen },
        ],
    },
    {
        group: 'Workflow',
        items: WORKFLOW_NAV.map(({ href, label, icon }) => ({ href, label, icon })),
    },
    {
        group: 'Lanjutan',
        items: [{ href: '/tools', label: 'Tools & lanjutan', icon: Wrench }],
    },
    {
        group: 'Sistem',
        items: [
            { href: '/settings', label: 'Pengaturan', icon: Settings },
        ],
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const { activeProjectId, projects } = useAppStore()
    const activeProject = projects.find((p) => p.id === activeProjectId) ?? null

    return (
        <aside className="flex h-screen w-52 shrink-0 flex-col border-r border-zinc-800/60 bg-zinc-900/50 overflow-hidden">

            {/* Brand */}
            <div className="flex items-center gap-2.5 px-4 py-4 border-b border-zinc-800/60 shrink-0">
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15">
                    <Clapperboard className="size-3.5 text-amber-500" />
                </div>
                <div>
                    <p className="text-sm font-bold text-zinc-100 leading-none">RestoreGen</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">AI Prompt Generator</p>
                </div>
            </div>

            {/* Active project */}
            <div className="px-4 py-3 border-b border-zinc-800/60 shrink-0 space-y-1.5">
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Project Aktif</p>
                <p className="text-xs font-medium text-zinc-200 truncate">
                    {activeProject?.name ?? <span className="text-zinc-600 italic font-normal">Belum dipilih</span>}
                </p>
                <GlobalProgressBar />
            </div>

            {/* Nav — scrollable only if needed */}
            <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-3 scrollbar-none">
                {NAV.map(({ group, items }) => (
                    <div key={group}>
                        <p className="px-3 mb-1 text-[10px] font-semibold text-zinc-700 uppercase tracking-wider">{group}</p>
                        {items.map(({ href, label, icon: Icon }) => {
                            const active = pathname === href || pathname.startsWith(href + '/')
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs transition-all',
                                        active
                                            ? 'bg-amber-500/10 text-amber-400 font-semibold'
                                            : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'
                                    )}
                                >
                                    <Icon className="size-3.5 shrink-0" />
                                    {label}
                                </Link>
                            )
                        })}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-zinc-800/60 shrink-0">
                <p className="text-[10px] text-zinc-700 text-center">v1.0 · Gemini AI</p>
            </div>
        </aside>
    )
}
