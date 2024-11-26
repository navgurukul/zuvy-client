'use client'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import StudentNavbar from '../_components/navbar'
import UnauthorizedUser from '@/components/ui/UnauthorizedUser'
import { usePathname } from 'next/navigation'
import { getUser } from '@/store/store'
import { Spinner } from '@/components/ui/spinner'
import '../globals.css'

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
                <UnauthorizedUser rolesList={rolesList} />
            ) : (
                <div>
                    {!adminAssessmentPreviewRoute && <StudentNavbar />}
                    <MaxWidthWrapper>{children}</MaxWidthWrapper>
                </div>
            )}
        </div>
    )
}
