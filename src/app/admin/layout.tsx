'use client'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import StudentNavbar from '../_components/navbar'

import '../globals.css'
import { usePathname } from 'next/navigation'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const adminAssessmentPreviewRoute = pathname?.includes('/preview')
    return (
        <div>
            {!adminAssessmentPreviewRoute && <StudentNavbar />}
            <MaxWidthWrapper>{children}</MaxWidthWrapper>
        </div>
    )
}
