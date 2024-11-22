'use client'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import StudentNavbar from '../_components/navbar'
import UnauthorizedUser from '@/components/UnauthorizedUser'
import '../globals.css'

interface User {
    rolesList: any[]
    id: string
    email: string
    name: string
    profile_picture?: string
    [key: string]: any // Allow additional properties if the structure varies
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const AUTH = localStorage.getItem('AUTH') || false
    const user = AUTH && (JSON.parse(AUTH) as User)
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
