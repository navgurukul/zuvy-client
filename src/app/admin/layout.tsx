'use client'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import StudentNavbar from '../_components/navbar'

import { usePathname } from 'next/navigation'
import UnauthorizedUser from '@/components/UnauthorizedUser'
import { getUser } from '@/store/store'
import { Spinner } from '@/components/ui/spinner'

import '../globals.css'
import { useEffect } from 'react'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const adminAssessmentPreviewRoute = pathname?.includes('/preview')
    const { user, setUser } = getUser()
    const rolesList =
        user && (user.rolesList.length === 0 ? 'student' : user.rolesList[0])

    const isAssessmentRouteClasses = (route: string) => {
        const adminRoutes = /admin.*courses.*module.*chapters/

        if (adminRoutes.test(pathname || '')) {
            return 'overflow-hidden'
        }
        return ''
    }

    return (
        <div>
            {user.email.length == 0 ? (
                <div className="flex items-center justify-center h-[680px]">
                    <Spinner className="text-secondary" />
                </div>
            ) : user &&
              (user.rolesList.length === 0 ||
                  (user.rolesList.length > 0 &&
                      user.rolesList[0] !== 'admin')) ? (
                <UnauthorizedUser rolesList={rolesList} path={'Admin'} />
            ) : (
                <div className={`${isAssessmentRouteClasses(pathname)}`}>
                    {!adminAssessmentPreviewRoute && <StudentNavbar />}

                    <div className={`${adminAssessmentPreviewRoute ? '' : 'pt-16'} h-screen`}>
                        <MaxWidthWrapper>{children}</MaxWidthWrapper>
                    </div>
                </div>
            )}
        </div>
    )
}
