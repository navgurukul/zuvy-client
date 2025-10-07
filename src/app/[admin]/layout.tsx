'use client'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'

import { usePathname } from 'next/navigation'
import UnauthorizedUser from '@/components/UnauthorizedUser'
import { getUser } from '@/store/store'
import { Spinner } from '@/components/ui/spinner'

import '../globals.css'
import { useEffect } from 'react'
import StudentNavbar from '../_components/navbar'
import { useRoles } from '@/hooks/useRoles'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const { roles } = useRoles()
    const adminAssessmentPreviewRoute = pathname?.includes('/preview')
    const isFullWidthRoute = pathname.includes('/module') || pathname.includes('/project') || adminAssessmentPreviewRoute;
    const { user, setUser } = getUser()
    const rolesList = user && user.rolesList.length > 0 && user.rolesList[0]

    const isAssessmentRouteClasses = (route: string) => {
        const adminRoutes = /admin.*courses.*module.*chapters/

        if (adminRoutes.test(pathname || '')) {
            return 'overflow-hidden'
        }
        return ''
    }

    return (
        <div className={isFullWidthRoute ? '' : 'container mx-auto px-2 pt-2 pb-2 max-w-7xl'}>
            {user.email.length == 0 ? (
                <div className="flex items-center justify-center h-[680px]">
                    <Spinner className="text-[rgb(81,134,114)]" />
                </div>
            ) : user &&
              (user.rolesList.length === 0 ||
                  (user.rolesList.length > 0 &&
                      roles.includes(rolesList))) ? (
                <UnauthorizedUser role={rolesList} />
            ) : (                
                <div className={`${isAssessmentRouteClasses(pathname)}`}>
                    {!adminAssessmentPreviewRoute && <StudentNavbar />}

                    <div
                        className={`${
                            adminAssessmentPreviewRoute ? '' : 'pt-16'
                        } h-screen`}
                    >
                        <MaxWidthWrapper>{children}</MaxWidthWrapper>
                    </div>
                </div>
            )}
        </div>
    )
}
