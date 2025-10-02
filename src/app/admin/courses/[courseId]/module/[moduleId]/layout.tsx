'use client'

import Chapter from '@/components/ui/chapter'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import useResponsiveHeight from '@/hooks/useResponsiveHeight'

export default function Layout({ children }: { children: React.ReactNode }) {
    const { courseId, moduleId, projectID } = useParams()
    const pathname = usePathname()
    const adminAssessmentPreviewRoute = pathname?.includes('/preview')
    const heightClass = useResponsiveHeight()

    return (
        <div className="min-h-screen -mx-6 -md:mx-10 -my-5">
            {projectID || adminAssessmentPreviewRoute ? (
                <div>{children}</div>
            ) : (
                <div className="flex w-full sticky top-0 h-3/5">
                    <div className='w-[22%] border-r border-gray-200'>
                        <Chapter /> 
                    </div>
                    <div className="w-[78%]">{children}</div>
                </div>
            )}
        </div>
    )
}
