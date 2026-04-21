import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider, ToastList } from '@/components/ui/toast'
import { StorePersistence } from '@/components/StorePersistence'

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-sans',
})

export const metadata: Metadata = {
    title: 'RestoreGen — Restoration Prompt Generator',
    description: 'Generate AI prompts for restoration content projects',
}

/** HP berponceng: `env(safe-area-inset-*)` berfungsi jika viewport memakai cover. */
export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="id" className={`${inter.variable} dark antialiased`}>
            <body className="bg-zinc-950 text-zinc-100">
                <ToastProvider>
                    <StorePersistence />
                    {children}
                    <ToastList />
                </ToastProvider>
            </body>
        </html>
    )
}
