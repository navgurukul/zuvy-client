import type { Metadata } from 'next'
import { Karla } from 'next/font/google'
// import Navbar from "@/app/_components/Navbar";
import { SessionExpiredModal } from '@/components/SessionExpiredModal'

import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'
import '@remirror/styles/all.css'
import '@/app/globals.css'
import AnalyticsScripts from '@/app/_components/AnalyticsScripts'

const karla = Karla({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Zuvy LMS',
    description: 'A gateway to affordable tech learning ',
    icons: {
        icon: ['/favicon.ico?v=4'],
        apple: ['/apple-touch-icon.png?v=4'],
        shortcut: ['/apple-touch-icon.png'],
    },
    manifest: '/site.webmanifest',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="light">
            <body
                className={cn(
                    'min-h-screen text-center antialiased',
                    karla.className
                )}
            >
                {/* <Navbar /> */}
                {children}
                <Toaster />
                <AnalyticsScripts />
                <SessionExpiredModal />
            </body>
        </html>
    )
}
