import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { ToastProvider, ToastList } from '@/components/ui/toast'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  preload: true,
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: 'RestoreGen — Restoration Prompt Generator',
  description: 'Generate AI prompts for restoration content projects',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${inter.variable} dark antialiased`}>
      <body className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
        <ToastProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto min-w-0">
            {children}
          </main>
          <RightSidebar />
          <ToastList />
        </ToastProvider>
      </body>
    </html>
  )
}
