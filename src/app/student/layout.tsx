'use client'

import StudentNavbar from '@/app/_components/navbar'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { usePathname } from 'next/navigation'
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
    // Get the current path
    const pathname = usePathname()
    const isAssessmentRoute =
        pathname?.includes('/student/courses') &&
        pathname?.includes('/modules') &&
        pathname?.includes('/assessment')
    const AUTH = localStorage.getItem('AUTH') || false
    const user = AUTH && (JSON.parse(AUTH) as User)
    const rolesList =
        user && (user.rolesList.length === 0 ? 'student' : user.rolesList[0])
    return (
        <>
            {user && user.rolesList.length !== 0 ? (
                <UnauthorizedUser rolesList={rolesList} />
            ) : (
                <div
                // className={cn(
                //   "min-h-screen text-center antialiased",
                //   karla.className
                // )}
                >
                    {!isAssessmentRoute && <StudentNavbar />}
                    <MaxWidthWrapper>{children}</MaxWidthWrapper>
                </div>
            )}
        </>
    )
}
