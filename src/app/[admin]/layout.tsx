'use client'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { usePathname } from 'next/navigation'
import UnauthorizedUser from '@/components/UnauthorizedUser'
import { getUser } from '@/store/store'
import { Spinner } from '@/components/ui/spinner'
import '../globals.css'
import StudentNavbar from '../_components/navbar'
import { useRoles } from '@/hooks/useRoles'
import { useAllCourses } from '@/hooks/useAllCourses'
import Notfound from '../not-found'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { refetchAllCourses } = useAllCourses(true)
    const pathname = usePathname()
    const { roles, loading } = useRoles()
    const { user } = getUser()

    const roleFromPath = pathname.split('/')[1]?.toLowerCase() || ''
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isRoleInSystem = roles?.some(r => r.name?.toLowerCase() === roleFromPath)

    const adminAssessmentPreviewRoute = pathname?.includes('/preview')
    const isFullWidthRoute =
        pathname.includes('/module') || pathname.includes('/project') || adminAssessmentPreviewRoute

    const isAssessmentRouteClasses = (route: string) => {
        const adminRoutes = /admin.*courses.*module.*chapters/
        return adminRoutes.test(route || '') ? 'overflow-hidden' : ''
    }

    if(roleFromPath === userRole) {
            // ✅ Authorized user
    return (
        // <div className={isFullWidthRoute ? '' : 'container mx-auto px-2 pt-2 pb-2 max-w-7xl'}>
        <div className='font-body'>
            <div className={isAssessmentRouteClasses(pathname)}>
                {!adminAssessmentPreviewRoute && <StudentNavbar />}
                <div className={`${adminAssessmentPreviewRoute ? '' : 'pt-16'} h-screen flex-1`}>
                    {children}
                </div>
            </div>
        </div>
    )
    }
  
    // 🧠 Guard loading states properly
    if (user.email.length === 0 || loading) {
        return (
            <div className="flex items-center justify-center h-[680px] font-manrope">
                {/* <Spinner className="text-[rgb(81,134,114)]" />  */}
            </div>
        )
    }

    // 🚫 Role not in system
    if (!isRoleInSystem) {
        return (
            <Notfound
                error={new Error('Unauthorized access')}
                reset={() => console.error('URL Not Found')}
            />
        )
    }

    // ❌ Unauthorized for this route
    if (userRole !== roleFromPath) {
        return <UnauthorizedUser userRole={userRole} roleFromPath={roleFromPath} />
    }
}
