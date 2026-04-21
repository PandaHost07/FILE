import { Sidebar } from '@/components/layout/Sidebar'

export default function MainShellLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="flex min-h-0 h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#000000]">
            <Sidebar />
            <main className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[#000000] pt-[max(3.5rem,calc(1rem+env(safe-area-inset-top)+2.75rem))] pb-[env(safe-area-inset-bottom)] lg:pt-0 lg:pb-0">
                {children}
            </main>
        </div>
    )
}
