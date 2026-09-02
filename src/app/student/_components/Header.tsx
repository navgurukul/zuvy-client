'use client'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Moon, Sun, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation'
import { Logout } from '@/utils/logout'
import { useThemeStore, useLazyLoadedStudentData } from '@/store/store'
import StudentProfileDropDown from './StudentProfileDropDown'
import { useOnboardingStorage } from '@/app/student/hooks/use-profile'
import { useLatestUpdatedCourse } from '@/app/student/hooks/useLatestUpdatedCourse'
import { getMentorsHref } from '@/utils/studentMentorshipRoutes'

const Header = () => {
    const { isDark, toggleTheme } = useThemeStore()
    const { studentData } = useLazyLoadedStudentData()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const { onboardingData, isLoading: isOnboardingLoading } = useOnboardingStorage()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = useParams()
    const orgId = params.orgId
    const courseIdMatch = pathname.match(/\/course\/([^\/]+)/)
    const orgIdMatch = pathname.match(/\/org\/([^\/]+)/)
    const courseIdFromPath = courseIdMatch?.[1]
    const orgIdFromPath = orgIdMatch?.[1] || (orgId as string | undefined)
    const courseIdFromQuery = searchParams.get('courseId')
    const orgIdFromQuery = searchParams.get('orgId')
    const currentCourseId = courseIdFromPath || courseIdFromQuery || ''
    const { latestCourseData } = useLatestUpdatedCourse(currentCourseId)
    const fallbackOrgId = studentData?.orgId
    const currentOrgId = orgIdFromPath || orgIdFromQuery || (fallbackOrgId ? String(fallbackOrgId) : '')
    const shouldShowMentorshipLinks = Boolean(latestCourseData?.mentorshipEnabled)

    // Ensure client-side rendering for hydration
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Hide header on assessment page for security and focus
    if (pathname.includes('/studentAssessment')) {
        return null
    }

    const handleLogoClick = () => {
        router.push('/student?stay=dashboard')
    }

    const handleDashboardClick = () => {
        router.push('/student?stay=dashboard')
    }

    const getCurrentCourseId = () => {
        const fallbackCourseId = latestCourseData?.bootcampId
        return courseIdFromPath || courseIdFromQuery || (fallbackCourseId ? String(fallbackCourseId) : null)
    }

    const handleSyllabusClick = () => {
        const courseId = getCurrentCourseId()
        if (courseId) {
            router.push(`/student/course/${courseId}/org/${currentOrgId}/courseSyllabus`)
            return
        }

        router.push('/student')
    }

    const handleMentorshipClick = () => {
        const courseId = getCurrentCourseId()
        if (courseId) {
            router.push(getMentorsHref({ courseId, orgId: currentOrgId }))
            return
        }

        router.push('/student/mentors')
    }

    const handleLogoutClick = () => {
        setShowLogoutDialog(true)
    }

    const handleLogout = async () => {
        setShowLogoutDialog(false)
        await Logout()
    }

    const handleProfileClick = () => {
        router.push('/student/profile?mode=edit')
    }

    const isInProfileSetupFlow =
        pathname === '/student/profile' &&
        !isOnboardingLoading &&
        !onboardingData?.isCompleted

    // Show profile option in dropdown whenever the student is not in the initial onboarding flow
    const showProfileOption = !isInProfileSetupFlow

    // Check if we're on a course-related page
    const isOnCoursePage = pathname.includes('/course/')
    const isMentorOrSessionFlow =
        pathname.startsWith('/student/mentors') ||
        pathname.startsWith('/student/sessions')
    const showCourseNavLinks =
        isOnCoursePage || isMentorOrSessionFlow
    const showMentorshipNavLink = shouldShowMentorshipLinks || isMentorOrSessionFlow

    // Check active page states
    const isOnCourseSyllabus = () => {
        return pathname.includes('/courseSyllabus')
    }

    // Shared nav link styles
    const navLinkBase = 'font-semibold text-foreground hover:underline hover:text-primary'
    const navLinkActive = 'text-primary font-semibold'

    // Don't render theme toggle until client-side (SSR skeleton)
    if (!isClient) {
        return (
            <header className="w-full h-16 px-4 sm:px-6 font-semibold flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50 shadow-4dp sticky top-0 z-50">
                {/* Left - Logo */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <div
                        className="flex items-center cursor-pointer flex-shrink-0"
                        onClick={handleLogoClick}
                    >
                        <img src={'/logo.PNG'} alt="Zuvy" className="h-12" />
                    </div>

                    {/* Desktop nav links (md and above) */}
                    {showCourseNavLinks && (
                        <nav className="hidden md:flex items-center gap-1">
                            <Button
                                variant="link"
                                size="sm"
                                onClick={handleDashboardClick}
                                className={`text-sm ${navLinkBase}`}
                            >
                                Dashboard
                            </Button>
                            <Button
                                id="tour-course-syllabus"
                                variant="link"
                                size="sm"
                                onClick={handleSyllabusClick}
                                className={`text-sm ${navLinkBase}`}
                            >
                                Course Syllabus
                            </Button>
                            {showMentorshipNavLink && (
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={handleMentorshipClick}
                                    className={`text-sm ${navLinkBase}`}
                                >
                                    Mentorship
                                </Button>
                            )}
                        </nav>
                    )}
                </div>

                {/* Right - actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Mobile hamburger (only when nav links exist) */}
                    {showCourseNavLinks && (
                        <div className="flex md:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Open menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={handleDashboardClick} className="text-sm font-medium cursor-pointer">
                                        Dashboard
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleSyllabusClick} className="text-sm font-medium cursor-pointer">
                                        Course Syllabus
                                    </DropdownMenuItem>
                                    {showMentorshipNavLink && (
                                        <DropdownMenuItem onClick={handleMentorshipClick} className="text-sm font-medium cursor-pointer">
                                            Mentorship
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    {/* Theme toggle placeholder */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9" />

                    {/* Profile dropdown */}
                    <StudentProfileDropDown
                        studentData={studentData}
                        handleLogoutClick={handleLogoutClick}
                        showLogoutDialog={showLogoutDialog}
                        setShowLogoutDialog={setShowLogoutDialog}
                        handleLogout={handleLogout}
                        onProfileClick={handleProfileClick}
                        showProfileOption={showProfileOption}
                    />
                </div>
            </header>
        )
    }

    return (
        <header className="w-full h-16 px-4 sm:px-6 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50 shadow-4dp sticky top-0 z-50">
            {/* Left - Logo and Desktop Nav */}
            <div className="flex items-center gap-2 sm:gap-4">
                <div
                    className="flex items-center cursor-pointer mb-1 flex-shrink-0"
                    onClick={handleLogoClick}
                >
                    {isDark ?
                        <img src={'/zuvy-logo-horizontal-dark.png'} alt="Zuvy" className="h-7" />
                        :
                        <img src={'/zuvy-logo-horizontal.png'} alt="Zuvy" className="h-7" />
                    }
                </div>

                {/* Desktop nav links — hidden on mobile */}
                {showCourseNavLinks && (
                    <nav className="hidden md:flex items-center gap-1">
                        <Button
                            variant="link"
                            size="sm"
                            onClick={handleDashboardClick}
                            className={`text-sm font-semibold ${navLinkBase}`}
                        >
                            Dashboard
                        </Button>
                        <Button
                            id="tour-course-syllabus"
                            variant="link"
                            size="sm"
                            onClick={handleSyllabusClick}
                            className={`text-sm font-semibold ${
                                isOnCourseSyllabus() ? navLinkActive : navLinkBase
                            }`}
                        >
                            Course Syllabus
                        </Button>
                        {showMentorshipNavLink && (
                            <Button
                                id="tour-mentorship"
                                variant="link"
                                size="sm"
                                onClick={handleMentorshipClick}
                                className={`text-sm font-semibold ${navLinkBase}`}
                            >
                                Mentorship
                            </Button>
                        )}
                    </nav>
                )}
            </div>

            {/* Right - Theme Switch, Mobile Menu, Avatar */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {/* Mobile hamburger — shown only when nav links exist, hidden on md+ */}
                {showCourseNavLinks && (
                    <div className="flex md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Open navigation menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                    onClick={handleDashboardClick}
                                    className="text-sm font-medium cursor-pointer"
                                >
                                    Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleSyllabusClick}
                                    className={`text-sm font-medium cursor-pointer ${isOnCourseSyllabus() ? 'text-primary' : ''}`}
                                >
                                    Course Syllabus
                                </DropdownMenuItem>
                                {showMentorshipNavLink && (
                                    <DropdownMenuItem
                                        onClick={handleMentorshipClick}
                                        className="text-sm font-medium cursor-pointer"
                                    >
                                        Mentorship
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {/* Theme toggle */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="w-8 h-8 sm:w-9 sm:h-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    {isDark ? (
                        <Sun className="h-4 w-4" />
                    ) : (
                        <Moon className="h-4 w-4" />
                    )}
                </Button>

                {/* Profile dropdown */}
                <StudentProfileDropDown
                    studentData={studentData}
                    handleLogoutClick={handleLogoutClick}
                    showLogoutDialog={showLogoutDialog}
                    setShowLogoutDialog={setShowLogoutDialog}
                    handleLogout={handleLogout}
                    onProfileClick={handleProfileClick}
                    showProfileOption={showProfileOption}
                />
            </div>
        </header>
    )
}

export default Header
