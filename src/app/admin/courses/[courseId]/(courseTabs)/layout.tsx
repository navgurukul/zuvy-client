'use client'
import React, { useEffect } from 'react'
import CourseLayout from '../_components/CourseLayout'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { usePathname } from 'next/navigation'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    useEffect(() => {
        // This will run whenever the route changes
        if (!pathname.includes('submissions')) {
            localStorage.removeItem('tab')
        }
    }, [pathname])

    return (
        <div>
            <CourseLayout />

            <MaxWidthWrapper>{children}</MaxWidthWrapper>
        </div>
    )
}
