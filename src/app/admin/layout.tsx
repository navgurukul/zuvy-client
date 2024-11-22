'use client'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import StudentNavbar from '../_components/navbar'
import '../globals.css'
import { usePathname } from 'next/navigation'

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
    const pathname = usePathname()
    const adminAssessmentPreviewRoute = pathname?.includes('/preview')
    const AUTH = localStorage.getItem('AUTH') || false
    const user = AUTH && (JSON.parse(AUTH) as User)
    return (
        <>
            {user &&
            (user.rolesList.length === 0 ||
                (user.rolesList.length > 0 &&
                    user.rolesList[0] !== 'admin')) ? (
                <h1>Unauthorized User</h1>
            ) : (
                <div>
                    {!adminAssessmentPreviewRoute && <StudentNavbar />}
                    <MaxWidthWrapper>{children}</MaxWidthWrapper>
                </div>
            )}
        </>
    )
}
