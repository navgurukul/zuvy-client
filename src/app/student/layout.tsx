'use client';
import Header from './_components/Header'
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import { useThemeStore } from '@/store/store';
import FlashAnnouncementDialog from '../_components/FlashAnnouncement';
import ZoeBanner from '../_components/ZoeBanner';

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
    
    const [showZoeBanner, setShowZoeBanner] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            const zoeBannerDismissed = localStorage.getItem('zoeBannerDismissed');
            if (!zoeBannerDismissed) {
                setShowZoeBanner(true);
            }
        }
    }, []);

    const handleDismissBanner = () => {
        setShowZoeBanner(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem('zoeBannerDismissed', 'true');
        }
    };

    const handleStartInterview = () => {
        const access_token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        window.open(`https://zoe.zuvy.org?token=${access_token}`, '_blank');
    };

    const handleGiveFeedback = () => {
        // Add your feedback form URL here
        window.open('https://forms.fillout.com/t/2wxwRuLW7rus', '_blank');
    };

    return (
        <div className="h-screen bg-background flex flex-col font-manrope">
            
            <ThemeInitializer />
            <div className="sticky top-0 z-50">
                <ZoeBanner 
                    isVisible={showZoeBanner}
                    onDismiss={handleDismissBanner}
                    onStartInterview={handleStartInterview}
                    onGiveFeedback={handleGiveFeedback}
                />
                {!hideHeader && !isOnCourseModulePage && <Header />}
            </div>
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
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading...</p>
                        </div>
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
