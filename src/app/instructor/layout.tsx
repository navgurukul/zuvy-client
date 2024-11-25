'use client'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import StudentNavbar from '../_components/navbar'
import UnauthorizedUser from '@/components/UnauthorizedUser'
import { getUser } from '@/store/store'
import '../globals.css'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, setUser } = getUser()
    const rolesList =
        user && (user.rolesList.length === 0 ? 'student' : user.rolesList[0])
    return (
        <>
            {user &&
            (user.rolesList.length === 0 ||
                (user.rolesList.length > 0 &&
                    user.rolesList[0] !== 'instructor')) ? (
                <UnauthorizedUser rolesList={rolesList} />
            ) : (
                <div>
                    <StudentNavbar />
                    <MaxWidthWrapper>{children}</MaxWidthWrapper>
                </div>
            )}
        </>
    )
}
