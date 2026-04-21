import { auth } from '@/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { redirect } from 'next/navigation'

/** Lapisan kedua: tanpa sesi tidak boleh me-render shell app (selain middleware). */
export default async function MainShellLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const session = await auth()
    if (!session?.user) {
        redirect('/login')
    }

    return (
        <div className="flex min-h-0 h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#000000]">
            <Sidebar />
            <main className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[#000000] max-lg:z-20 pt-[calc(env(safe-area-inset-top)+3.5rem+1px)] pb-[env(safe-area-inset-bottom)] lg:pt-0 lg:pb-0">
                {children}
            </main>
        </div>
    )
}
