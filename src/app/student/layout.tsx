'use client'

import StudentNavbar from '@/app/_components/navbar'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { usePathname } from 'next/navigation'

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
        pathname?.includes('/assessment')&&
        !pathname?.includes('/viewresults')

    return (
        <div
        // className={cn(
        //   "min-h-screen text-center antialiased",
        //   karla.className
        // )}
        >
            {!isAssessmentRoute && <StudentNavbar />}
            <MaxWidthWrapper>{children}</MaxWidthWrapper>
        </div>
    )
}
