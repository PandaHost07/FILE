import { Sidebar } from '@/components/layout/Sidebar'

export default function MainShellLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="flex h-screen overflow-hidden bg-[#000000]">
            <Sidebar />
            <main className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[#000000] pt-14 lg:pt-0">
                {children}
            </main>
        </div>
    )
}
