'use client';
import Header from './_components/Header'
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useThemeStore } from '@/store/store';

// Theme Initializer Component
const ThemeInitializer = () => {
    const { isDark, setTheme } = useThemeStore();

    useEffect(() => {
        // Apply theme on initial load/hydration
        if (typeof window !== 'undefined') {
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [isDark]);

    return null;
};

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const hideHeader = pathname.includes('/assessmentResult/')  || pathname.includes('/codingChallenge') || pathname.includes('/projects');
    
    return (
        <div className="h-screen bg-background flex flex-col font-manrope">
            <ThemeInitializer />
            {!hideHeader && <Header />}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
