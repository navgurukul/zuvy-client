'use client';
import Header from './_components/Header'
import { TourProvider, TourOverlay, TourTooltip } from './_components/guided-tour';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import { getUser, useThemeStore } from '@/store/store';
// import { useRoles } from '@/hooks/useRoles'
import { Spinner } from '@/components/ui/spinner';
import Notfound from '../not-found';
import UnauthorizedStudent from '@/components/UnauthorizedStudent';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import ZoeBanner from '../_components/ZoeBanner';
import { useLatestUpdatedCourse } from '@/hooks/useLatestUpdatedCourse';
import { useMentors } from '@/hooks/useMentors';

const inter = Inter({ subsets: ["latin"] });

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
    const hideHeader = pathname.includes('/assessmentResult/') || pathname.includes('/codingChallenge') || pathname.includes('/projects');
    const isOnCourseModulePage = pathname.includes('/student/course/') && chapterId;
    // const { roles, loading } = useRoles()
    const { user } = getUser()
    const roleFromPath = pathname.split('/')[1]?.toLowerCase() || ''
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    // const isRoleInSystem = roles?.some(r => r.name?.toLowerCase() === roleFromPath)
    const [showZoeBanner, setShowZoeBanner] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Derive the active courseId the same way Header does so TourProvider can
    // know whether mentorship is enabled for the current course.
    const courseIdMatch = pathname.match(/\/course\/([^\/]+)/);
    const courseIdFromPath = courseIdMatch?.[1];
    const courseIdFromQuery = searchParams.get('courseId');
    const activeCourseId = courseIdFromPath || courseIdFromQuery || '';
    const { latestCourseData } = useLatestUpdatedCourse(activeCourseId);
    const mentorshipEnabled = Boolean(latestCourseData?.mentorshipEnabled);

    // Fetch mentors only when mentorship is enabled so we can decide whether
    // the tour should continue past the "Browse Mentors" step.
    const { mentors, loading: mentorsLoading } = useMentors('', mentorshipEnabled, 1000, 0);
    const hasAvailableMentors = mentorsLoading ? true : mentors.some(
        (m) => m.availabilityStatus?.trim().toLowerCase() === 'available'
    );

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            const zoeBannerDismissed = localStorage.getItem('zoeBannerDismissed');
            if (!zoeBannerDismissed) {
                setShowZoeBanner(true);
            }
        }
    }, []);

    useEffect(() => {
        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
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
        <TourProvider mentorshipEnabled={mentorshipEnabled} hasAvailableMentors={hasAvailableMentors}>
            <div className="h-screen overflow-hidden bg-background flex flex-col font-manrope">

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
                <main id="main-scroll-container" className="flex-1 overflow-y-auto">
                    {children}
                </main>
                <TourOverlay />
                <TourTooltip />
            </div>
        </TourProvider>
    )
}

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    // const { roles, loading } = useRoles()
    const { user } = getUser()
    const roleFromPath = pathname.split('/')[1]?.toLowerCase() || ''
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    // const isRoleInSystem = roles?.some(r => r.name?.toLowerCase() === roleFromPath)

    if (roleFromPath === userRole) {
        return (
            <Suspense fallback={
                <div className="h-screen bg-background flex flex-col">
                    {/* <main className="flex-1 overflow-y-auto">
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading...</p>
                            </div>
                        </div>
                    </main> */}
                </div>
            }>
                <StudentLayoutContent>
                    {children}
                </StudentLayoutContent>
            </Suspense>
        )
    } if (user.email.length === 0) {
        return (
            <div className="flex items-center justify-center h-[680px]">
                <Spinner className="text-[rgb(81,134,114)]" />
            </div>
        )
    } if (userRole !== roleFromPath) {
        return <UnauthorizedStudent userRole={userRole} roleFromPath={roleFromPath} />
    }
    // if (!isRoleInSystem) {
    //     return (
    //         <Notfound
    //             error={new Error('Unauthorized access')}
    //             reset={() => console.error('URL Not Found')}
    //         />
    //     )
    // } 
    return (
        <html lang="en">
            <body className={`${inter.className} font-body`}>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
