'use client'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import StudentNavbar from '../_components/navbar'
import '../globals.css'
import { usePathname } from 'next/navigation'
import UnauthorizedUser from '@/components/UnauthorizedUser'
import { getUser } from '@/store/store'

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
        <>
            {user &&
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
        </>
    )
}
