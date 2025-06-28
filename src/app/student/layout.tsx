'use client';
import Header from './_components/Header'
import { usePathname } from 'next/navigation';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const hideHeader = pathname.includes('/assessmentResult/');
    return (
        <div className="h-screen bg-background flex flex-col">
            {!hideHeader && <Header />}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
