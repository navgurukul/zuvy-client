import type { Metadata } from 'next'
import { Manrope as FontSans } from 'next/font/google'
import { Outfit as FontHeading } from 'next/font/google'

import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'
import '@remirror/styles/all.css'
import '@/app/globals.css'
import AnalyticsScripts from '@/app/_components/AnalyticsScripts'
import Header from '@/components/global/Header'

const fontSans = FontSans({ 
    subsets: ['latin'],
    variable: '--font-sans',
})

const fontHeading = FontHeading({
    subsets: ['latin'],
    variable: '--font-heading',
})

export const metadata: Metadata = {
    title: 'Zuvy - Learn to Code',
    description: 'Zuvy\'s student learning platform for coding education',
    icons: {
        icon: ['/favicon.ico?v=4'],
        apple: ['/apple-touch-icon.png?v=4'],
        shortcut: ['/apple-touch-icon.png'],
    },
    manifest: '/site.webmanifest',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="light">
            <body
                className={cn(
                    'min-h-screen bg-background font-sans antialiased',
                    fontSans.variable,
                    fontHeading.variable
                )}
            >
                <Header />
                <div className="pt-16">
                    {children}
                </div>
                <Toaster />
                <AnalyticsScripts />
            </body>
        </html>
    )
}
