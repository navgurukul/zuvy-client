'use client';
import Header from './_components/Header'

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
