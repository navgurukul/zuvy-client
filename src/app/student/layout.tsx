'use client';
import Header from './_components/Header'

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="pt-0">
                {children}
            </div>
        </div>
    )
}
