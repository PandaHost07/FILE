'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type FocusEvent, type MouseEvent } from 'react'
import {
    LayoutDashboard,
    BookOpen,
    Settings,
    Timer,
    Layers,
    Sparkles,
    Wand2,
    Link as LinkIcon,
    Video,
    ChevronLeft,
    ChevronRight,
    Menu,
    Scissors,
    Clapperboard,
    ShoppingBag,
    X,
    type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import useAppStore from '@/store/useAppStore'
import type { RestoreCategory } from '@/types'

const CATEGORY_LABEL: Record<RestoreCategory, string> = {
    furniture: 'Furniture',
    bangunan: 'Bangunan',
    kendaraan: 'Kendaraan',
    elektronik: 'Elektronik',
    lainnya: 'Lainnya',
}

type NavAccent = 'emerald' | 'violet' | 'cyan' | 'amber' | 'fuchsia' | 'zinc'

const ACCENT: Record<
    NavAccent,
    { bar: string; surface: string; icon: string; ring: string }
> = {
    emerald: {
        bar: 'bg-emerald-500',
        surface: 'bg-emerald-500/[0.07] border-emerald-500/20',
        icon: 'text-emerald-400',
        ring: 'shadow-[0_0_24px_-10px_rgba(16,185,129,0.45)]',
    },
    violet: {
        bar: 'bg-violet-500',
        surface: 'bg-violet-500/[0.07] border-violet-500/20',
        icon: 'text-violet-400',
        ring: 'shadow-[0_0_24px_-10px_rgba(139,92,246,0.45)]',
    },
    cyan: {
        bar: 'bg-cyan-500',
        surface: 'bg-cyan-500/[0.07] border-cyan-500/20',
        icon: 'text-cyan-400',
        ring: 'shadow-[0_0_24px_-10px_rgba(34,211,238,0.4)]',
    },
    amber: {
        bar: 'bg-amber-500',
        surface: 'bg-amber-500/[0.07] border-amber-500/20',
        icon: 'text-amber-400',
        ring: 'shadow-[0_0_24px_-10px_rgba(245,158,11,0.4)]',
    },
    fuchsia: {
        bar: 'bg-fuchsia-500',
        surface: 'bg-fuchsia-500/[0.08] border-fuchsia-500/25',
        icon: 'text-fuchsia-400',
        ring: 'shadow-[0_0_24px_-10px_rgba(217,70,239,0.45)]',
    },
    zinc: {
        bar: 'bg-zinc-500',
        surface: 'bg-zinc-500/[0.08] border-zinc-600/40',
        icon: 'text-zinc-300',
        ring: 'shadow-[0_0_20px_-10px_rgba(161,161,170,0.25)]',
    },
}

const NAV: {
    group: string
    items: {
        href: string
        label: string
        icon: LucideIcon
        accent: NavAccent
        /** Tampilkan badge maintenance (fitur belum stabil). */
        maintenance?: boolean
    }[]
}[] = [
    {
        group: 'Utama',
        items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, accent: 'emerald' }],
    },
    {
        group: 'Alur restore',
        items: [
            { href: '/idea-generator', label: 'Idea Generator', icon: Sparkles, accent: 'violet' },
            { href: '/scene-builder', label: 'Scene Builder', icon: Layers, accent: 'violet' },
            { href: '/prompt-studio', label: 'Prompt Studio', icon: Wand2, accent: 'cyan' },
        ],
    },
    {
        group: 'Tools',
        items: [
            { href: '/video-timelapse', label: 'Video Timelapse', icon: Timer, accent: 'amber' },
            { href: '/filmmaker', label: 'Filmmaker', icon: Clapperboard, accent: 'cyan' },
            { href: '/tiktok-affiliate', label: 'TikTok Affiliate', icon: Video, accent: 'fuchsia' },
            {
                href: '/product-ad',
                label: 'Iklan Produk',
                icon: ShoppingBag,
                accent: 'violet',
            },
            {
                href: '/clipper',
                label: 'Clipper',
                icon: Scissors,
                accent: 'amber',
                maintenance: true,
            },
        ],
    },
    {
        group: 'Sistem',
        items: [
            { href: '/library', label: 'Library', icon: BookOpen, accent: 'emerald' },
            { href: '/settings', label: 'Pengaturan', icon: Settings, accent: 'zinc' },
        ],
    },
]

const SIDEBAR_COLLAPSED_KEY = 'rg-sidebar-collapsed'

export function Sidebar() {
    const pathname = usePathname()
    const { activeProjectId, projects } = useAppStore()
    const activeProject = projects.find((p) => p.id === activeProjectId) ?? null

    const [collapsed, setCollapsed] = useState(false)
    /** Di viewport di bawah breakpoint lg: sidebar overlay; false = tertutup (konten full width). */
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const [collapsedFlyout, setCollapsedFlyout] = useState<{
        label: string
        left: number
        top: number
    } | null>(null)
    const flyoutLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const closeMobileSidebar = useCallback(() => {
        if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
            setMobileNavOpen(false)
        }
    }, [])

    /** HP: drawer selalu tampil lebar penuh dengan label (bukan mode ikon). */
    const openMobileMenu = useCallback(() => {
        setCollapsed(false)
        setMobileNavOpen(true)
    }, [])

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)')
        const sync = () => setMobileNavOpen(mq.matches)
        sync()
        mq.addEventListener('change', sync)
        return () => mq.removeEventListener('change', sync)
    }, [])

    /** Kunci scroll latar saat menu HP terbuka (iOS/Android). */
    useEffect(() => {
        const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
        if (!mobile || !mobileNavOpen) return
        const html = document.documentElement
        const body = document.body
        const prevHtml = html.style.overflow
        const prevBody = body.style.overflow
        html.style.overflow = 'hidden'
        body.style.overflow = 'hidden'
        return () => {
            html.style.overflow = prevHtml
            body.style.overflow = prevBody
        }
    }, [mobileNavOpen])

    useEffect(() => {
        return () => {
            if (flyoutLeaveTimerRef.current) clearTimeout(flyoutLeaveTimerRef.current)
        }
    }, [])

    useEffect(() => {
        if (!collapsed) queueMicrotask(() => setCollapsedFlyout(null))
    }, [collapsed])

    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1') {
                queueMicrotask(() => setCollapsed(true))
            }
        } catch {
            /* ignore */
        }
    }, [])

    const toggleCollapsed = useCallback(() => {
        setCollapsed((c) => {
            const next = !c
            try {
                localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0')
            } catch {
                /* ignore */
            }
            return next
        })
    }, [])

    const handleCollapsedItemEnter = useCallback(
        (label: string) => (e: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>) => {
            if (!collapsed) return
            if (flyoutLeaveTimerRef.current) {
                clearTimeout(flyoutLeaveTimerRef.current)
                flyoutLeaveTimerRef.current = null
            }
            const r = e.currentTarget.getBoundingClientRect()
            setCollapsedFlyout({
                label,
                left: r.right + 8,
                top: r.top + r.height / 2,
            })
        },
        [collapsed]
    )

    const handleCollapsedItemLeave = useCallback(() => {
        flyoutLeaveTimerRef.current = setTimeout(() => {
            setCollapsedFlyout(null)
            flyoutLeaveTimerRef.current = null
        }, 80)
    }, [])

    function isActive(href: string) {
        return pathname === href || pathname.startsWith(href + '/')
    }

    return (
        <div
            className={cn(
                'max-lg:w-0 max-lg:min-w-0 max-lg:shrink-0 max-lg:overflow-visible',
                'lg:flex lg:w-auto lg:min-w-0 lg:shrink-0 lg:overflow-visible'
            )}
        >
            {/* Navbar HP / tablet: RestoreGen + menu (max-lg) */}
            <header
                role="banner"
                aria-label="RestoreGen"
                className={cn(
                    'fixed inset-x-0 top-0 z-[60] border-b border-[#1a1a1a]',
                    'bg-[#0a0a0c]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[#0a0a0c]/80',
                    'pt-[env(safe-area-inset-top)] shadow-[0_6px_24px_-8px_rgba(0,0,0,0.45)] lg:hidden'
                )}
            >
                <div className="flex min-h-14 items-center gap-2.5 px-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]">
                    <button
                        type="button"
                        onClick={() => (mobileNavOpen ? setMobileNavOpen(false) : openMobileMenu())}
                        className="touch-manipulation flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#2a2a2e] bg-[#121214] text-zinc-200 shadow-sm transition hover:border-emerald-500/35 hover:bg-emerald-500/[0.06] hover:text-emerald-200 active:scale-95"
                        aria-expanded={mobileNavOpen}
                        aria-controls="app-sidebar-nav"
                        aria-label={mobileNavOpen ? 'Tutup menu' : 'Buka menu'}
                    >
                        {mobileNavOpen ? (
                            <X className="size-5" aria-hidden />
                        ) : (
                            <Menu className="size-5" aria-hidden />
                        )}
                    </button>
                    <Link
                        href="/"
                        title="RestoreGen — beranda"
                        onClick={closeMobileSidebar}
                        className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl py-0.5 pl-1 pr-2 no-underline outline-none transition-[background] active:scale-[0.99] hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    >
                        <div
                            className={cn(
                                'flex size-9 shrink-0 items-center justify-center rounded-xl',
                                'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500',
                                'font-bold text-[17px] text-white shadow-md shadow-emerald-900/30 ring-1 ring-white/10',
                                'transition group-hover:shadow-lg group-hover:shadow-emerald-500/20'
                            )}
                        >
                            <span className="leading-none tracking-tight">R</span>
                        </div>
                        <div className="min-w-0 flex-1 text-left leading-tight">
                            <span className="block truncate text-[15px] font-bold tracking-tight text-white sm:text-[16px]">
                                Restore<span className="font-medium text-zinc-500">Gen</span>
                            </span>
                            <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-500/85">
                                Prompt &amp; scene
                            </span>
                        </div>
                    </Link>
                </div>
            </header>

            {mobileNavOpen && (
                <button
                    type="button"
                    onClick={() => setMobileNavOpen(false)}
                    className="touch-manipulation fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 lg:hidden"
                    aria-label="Tutup menu"
                />
            )}

            <aside
                className={cn(
                    'flex shrink-0 flex-col overflow-hidden transition-[width,transform] duration-300 ease-out motion-reduce:transition-none',
                    'fixed bottom-0 left-0 lg:relative lg:inset-auto',
                    mobileNavOpen ? 'z-50' : 'max-lg:z-[5]',
                    'lg:z-auto',
                    /* Di bawah app bar mobile (tinggi = safe + 3.5rem + border 1px) */
                    'max-lg:top-[calc(env(safe-area-inset-top)+3.5rem+1px)] max-lg:h-[calc(100dvh-env(safe-area-inset-top)-3.5rem-1px)] max-lg:max-h-none',
                    'lg:top-auto lg:h-[100dvh] lg:max-h-[100dvh]',
                    mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                    !mobileNavOpen && 'max-lg:pointer-events-none',
                    collapsed ? 'w-[72px]' : 'w-[min(264px,85vw)] lg:w-[264px]',
                    'border-r border-[#1f1f24] bg-[#0a0a0c]',
                    'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-0 before:h-[min(220px,35vh)]',
                    'before:bg-[radial-gradient(ellipse_90%_70%_at_50%_-20%,rgba(16,185,129,0.07),transparent_65%)]',
                    'after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-24',
                    'after:bg-gradient-to-t after:from-[#0a0a0c] after:to-transparent'
                )}
            >
            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                {/* Brand */}
                <div
                    className={cn(
                        'flex shrink-0 items-center border-b border-[#1a1a1a]',
                        collapsed
                            ? 'min-h-[76px] flex-col justify-center gap-2 px-2 py-3'
                            : 'h-[76px] justify-between gap-2 px-4'
                    )}
                >
                    <Link
                        href="/"
                        title="RestoreGen"
                        onClick={closeMobileSidebar}
                        className={cn(
                            'group flex min-w-0 items-center outline-none transition-opacity hover:opacity-95',
                            collapsed ? 'justify-center' : 'gap-3'
                        )}
                    >
                        <div
                            className={cn(
                                'flex shrink-0 items-center justify-center rounded-xl',
                                'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500',
                                'font-bold text-white shadow-lg shadow-emerald-500/25 ring-1 ring-white/10',
                                collapsed ? 'size-10 text-[16px]' : 'size-9 text-[17px]'
                            )}
                        >
                            <span className="leading-none tracking-tight">R</span>
                        </div>
                        {!collapsed && (
                            <div className="min-w-0 leading-tight">
                                <span className="text-[16px] font-bold tracking-tight text-white">
                                    Restore<span className="font-medium text-zinc-500">Gen</span>
                                </span>
                                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-500/80">
                                    Prompt &amp; scene
                                </p>
                            </div>
                        )}
                    </Link>
                    <button
                        type="button"
                        onClick={toggleCollapsed}
                        onMouseEnter={handleCollapsedItemEnter(collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar')}
                        onMouseLeave={handleCollapsedItemLeave}
                        onFocus={handleCollapsedItemEnter(collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar')}
                        onBlur={handleCollapsedItemLeave}
                        title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
                        aria-expanded={!collapsed}
                        aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
                        className={cn(
                            'flex shrink-0 items-center justify-center rounded-lg border border-[#2a2a2e] bg-[#121214] text-zinc-400 transition hover:border-emerald-500/30 hover:bg-emerald-500/[0.06] hover:text-emerald-300',
                            collapsed ? 'size-8' : 'size-9'
                        )}
                    >
                        {collapsed ? (
                            <ChevronRight className="size-4" aria-hidden />
                        ) : (
                            <ChevronLeft className="size-4" aria-hidden />
                        )}
                    </button>
                </div>

                {/* Nav — id untuk aria-controls tombol menu mobile */}
                <nav
                    id="app-sidebar-nav"
                    className={cn(
                        'scrollbar-none flex-1 space-y-6 overflow-y-auto py-5 pb-4',
                        collapsed ? 'px-2' : 'px-3'
                    )}
                >
                    {NAV.map(({ group, items }) => (
                        <div key={group}>
                            {!collapsed && (
                                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                                    {group}
                                </p>
                            )}
                            <ul className={cn('space-y-1', collapsed && 'space-y-0.5')}>
                                {items.map(({ href, label, icon: Icon, accent, maintenance }) => {
                                    const active = isActive(href)
                                    const a = ACCENT[accent]
                                    const isDashboard = href === '/dashboard'
                                    const flyoutLabel = maintenance
                                        ? `${label} · maintenance (belum stabil)`
                                        : label
                                    return (
                                        <li key={href} className={cn('relative', isDashboard && 'overflow-visible')}>
                                            <Link
                                                href={href}
                                                aria-label={maintenance ? `${label}, maintenance, belum stabil` : label}
                                                title={
                                                    collapsed
                                                        ? undefined
                                                        : maintenance
                                                          ? 'Clipper sedang dalam perbaikan — pemrosesan video di browser belum selalu berhasil.'
                                                          : label
                                                }
                                                onClick={closeMobileSidebar}
                                                onMouseEnter={handleCollapsedItemEnter(flyoutLabel)}
                                                onMouseLeave={handleCollapsedItemLeave}
                                                onFocus={handleCollapsedItemEnter(flyoutLabel)}
                                                onBlur={handleCollapsedItemLeave}
                                                className={cn(
                                                    'group/nav relative flex items-center rounded-xl text-[13px] font-medium transition-all duration-200',
                                                    collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
                                                    isDashboard ? 'overflow-visible' : 'overflow-hidden',
                                                    isDashboard
                                                        ? cn(
                                                              'border border-emerald-500/35 shadow-[0_0_26px_-10px_rgba(45,212,191,0.5)]',
                                                              active
                                                                  ? cn(a.surface, a.ring, 'text-white')
                                                                  : 'border-emerald-500/30 bg-emerald-950/[0.22] text-zinc-400 hover:border-emerald-400/40 hover:bg-emerald-950/35 hover:text-zinc-100 hover:shadow-[0_0_28px_-8px_rgba(52,211,153,0.55)]'
                                                          )
                                                        : cn(
                                                              'border border-transparent',
                                                              active
                                                                  ? cn(a.surface, a.ring, 'text-white')
                                                                  : 'text-zinc-500 hover:border-[#2a2a2e] hover:bg-[#121214] hover:text-zinc-200'
                                                          )
                                                )}
                                            >
                                                {isDashboard && (
                                                    <>
                                                        <span
                                                            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
                                                            aria-hidden
                                                        >
                                                            <span className="absolute inset-0 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-cyan-500/15" />
                                                            <span className="absolute inset-0 animate-pulse bg-emerald-400/[0.14]" />
                                                        </span>
                                                        <span
                                                            className="pointer-events-none absolute -inset-px -z-20 rounded-[13px] bg-emerald-500/25 opacity-50 blur-md animate-pulse"
                                                            aria-hidden
                                                        />
                                                    </>
                                                )}
                                                {active && (
                                                    <>
                                                        <span
                                                            className={cn(
                                                                'absolute left-0 top-1/2 z-[1] h-7 w-[3px] -translate-y-1/2 rounded-r-full',
                                                                a.bar
                                                            )}
                                                            aria-hidden
                                                        />
                                                        <span
                                                            className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-white/[0.03] to-transparent opacity-90"
                                                            aria-hidden
                                                        />
                                                    </>
                                                )}
                                                <Icon
                                                    className={cn(
                                                        'relative z-[1] size-[18px] shrink-0 transition-colors',
                                                        active
                                                            ? a.icon
                                                            : isDashboard
                                                              ? 'text-emerald-400/95 group-hover/nav:text-emerald-300'
                                                              : 'text-zinc-600 group-hover/nav:text-zinc-400'
                                                    )}
                                                />
                                                {!collapsed && (
                                                    <span className="relative z-[1] flex min-w-0 flex-1 items-center gap-2">
                                                        <span
                                                            className={cn(
                                                                'min-w-0 flex-1 truncate',
                                                                active && 'font-semibold',
                                                                isDashboard && !active && 'text-zinc-300'
                                                            )}
                                                        >
                                                            {label}
                                                        </span>
                                                        {maintenance && (
                                                            <span
                                                                className="shrink-0 rounded-md border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-400/95"
                                                                title="Fitur belum stabil"
                                                            >
                                                                Maintenance
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Project — border + glow animasi warna (globals.css) */}
                {collapsed ? (
                    <div className="shrink-0 px-2 pb-6 pt-2">
                        <div className="flex flex-col items-center gap-2">
                            <Link
                                href="/library"
                                aria-label={
                                    activeProject
                                        ? `Library — ${activeProject.name}`
                                        : 'Library — pilih proyek'
                                }
                                title={undefined}
                                onClick={closeMobileSidebar}
                                onMouseEnter={handleCollapsedItemEnter(
                                    activeProject
                                        ? `Proyek aktif: ${activeProject.name} (${CATEGORY_LABEL[activeProject.category]})`
                                        : 'Library — pilih proyek'
                                )}
                                onMouseLeave={handleCollapsedItemLeave}
                                onFocus={handleCollapsedItemEnter(
                                    activeProject
                                        ? `Proyek aktif: ${activeProject.name} (${CATEGORY_LABEL[activeProject.category]})`
                                        : 'Library — pilih proyek'
                                )}
                                onBlur={handleCollapsedItemLeave}
                                className={cn(
                                    'flex size-11 items-center justify-center rounded-xl text-xs font-bold uppercase text-white shadow-inner ring-1 ring-white/10 transition hover:ring-emerald-500/40',
                                    'bg-gradient-to-br from-violet-600 to-indigo-700'
                                )}
                            >
                                {activeProject ? activeProject.name.slice(0, 2) : '—'}
                            </Link>
                            <Link
                                href="/settings"
                                aria-label="Pengaturan"
                                title={undefined}
                                onClick={closeMobileSidebar}
                                onMouseEnter={handleCollapsedItemEnter('Pengaturan · API & pengaturan')}
                                onMouseLeave={handleCollapsedItemLeave}
                                onFocus={handleCollapsedItemEnter('Pengaturan · API & pengaturan')}
                                onBlur={handleCollapsedItemLeave}
                                className="flex size-9 items-center justify-center rounded-lg border border-[#2a2a2e] bg-[#121214] text-zinc-400 transition hover:border-emerald-500/25 hover:text-emerald-300"
                            >
                                <Settings className="size-4" aria-hidden />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="shrink-0 px-3 pb-6 pt-2">
                        <div className="rg-sidebar-project-shell">
                            <div className="rg-sidebar-project-inner">
                                <div className="rg-sidebar-project-aurora" aria-hidden />
                                <div className="relative z-10">
                                    <div className="border-b border-[#1a1a1a] bg-[#0f0f12]/98 px-3 py-2.5 backdrop-blur-sm">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                            Proyek aktif
                                        </p>
                                    </div>
                                    <div className="space-y-3 bg-[#121214]/90 p-3 backdrop-blur-[1px]">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    'flex size-10 shrink-0 items-center justify-center rounded-xl',
                                                    'bg-gradient-to-br from-violet-600 to-indigo-700 shadow-inner ring-1 ring-white/10'
                                                )}
                                            >
                                                <span className="text-sm font-bold uppercase text-white">
                                                    {activeProject ? activeProject.name.slice(0, 2) : '—'}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[13px] font-semibold text-zinc-100">
                                                    {activeProject ? activeProject.name : 'Belum ada proyek'}
                                                </p>
                                                <p className="truncate text-[11px] text-zinc-500">
                                                    {activeProject ? CATEGORY_LABEL[activeProject.category] : 'Pilih di Library'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg border border-[#2a2a2e] bg-[#0d0d10] px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <LinkIcon className="size-3.5 text-cyan-500/80" aria-hidden />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                    Status
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="relative flex size-2">
                                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60 opacity-40" />
                                                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                                                </span>
                                                <span className="text-[11px] font-medium text-emerald-400/90">Siap</span>
                                            </div>
                                        </div>

                                        <Link
                                            href="/settings"
                                            onClick={closeMobileSidebar}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#2a2a2e] bg-[#121214] py-2 text-[12px] font-medium text-zinc-400 transition hover:border-emerald-500/25 hover:bg-emerald-500/[0.06] hover:text-emerald-300"
                                        >
                                            <Settings className="size-3.5" />
                                            API &amp; pengaturan
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {collapsed && collapsedFlyout && (
                <div
                    role="tooltip"
                    aria-hidden
                    className="pointer-events-none fixed z-[9999] max-w-[min(260px,calc(100vw-5rem))] -translate-y-1/2 rounded-lg border border-[#2a2a2e] bg-[#0f0f12] px-3 py-1.5 text-left text-[12px] font-medium leading-snug text-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
                    style={{ left: collapsedFlyout.left, top: collapsedFlyout.top }}
                >
                    {collapsedFlyout.label}
                </div>
            )}
        </aside>
        </div>
    )
}
