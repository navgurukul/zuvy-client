'use client';
import Header from './_components/Header'
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useThemeStore } from '@/store/store';
import FlashAnnouncementDialog from '../_components/FlashAnnouncement';

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

function StudentLayoutContent({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const chapterId = searchParams.get('chapterId');
    const hideHeader = pathname.includes('/assessmentResult/')  || pathname.includes('/codingChallenge') || pathname.includes('/projects')  ;
    const isOnCourseModulePage = pathname.includes('/student/course/') && chapterId;

    return (
        <div className="h-screen bg-background flex flex-col font-manrope">
            
            <ThemeInitializer />
            {!hideHeader && !isOnCourseModulePage && <Header />}
            <main className="flex-1 overflow-y-auto ">
                {children}
            </main>
        </div>
    )
}

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Suspense fallback={
            <div className="h-screen bg-background flex flex-col font-manrope">
                <main className="flex-1 overflow-y-auto">
                    <div className="flex items-center justify-center h-full">
                        {/* <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                             <p className="text-muted-foreground">Loading...</p> 
                        </div> */}
                    </div>
                </main>
            </div>
        }>
            <StudentLayoutContent>
                {children}
            </StudentLayoutContent>
        </Suspense>
    )
}
