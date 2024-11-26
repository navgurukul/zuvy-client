'use client'

import StudentNavbar from '@/app/_components/navbar'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { usePathname } from 'next/navigation'
import UnauthorizedUser from '@/components/UnauthorizedUser'
import { getUser } from '@/store/store'
import { Spinner } from '@/components/ui/spinner'
import '../globals.css'

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
    const { user, setUser } = getUser()
    const rolesList =
        user && (user.rolesList.length === 0 ? 'student' : user.rolesList[0])

    return (
        <>
            {user.email.length == 0 ? (
                <div className="flex items-center justify-center h-[680px]">
                    <Spinner className="text-secondary" />
                </div>
            ) : user && user.rolesList.length !== 0 ? (
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
