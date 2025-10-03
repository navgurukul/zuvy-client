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
        <div className="min-h-screen">
            {projectID || adminAssessmentPreviewRoute ? (
                <div>{children}</div>
            ) : (
                // <MaxWidthWrapper><Project /></MaxWidthWrapper>
                <div className="flex w-full sticky top-0 h-3/5">
                    {/* <div className="w-full flex-none md:w-[25%]"> */}
                    {/* <div className="w-full flex-none md:w-[25%] sticky top-0 h-screen overflow-y-auto"> */}
                    <div className='w-[22%] border-r border-gray-200'>
                        <Chapter /> 
                    </div>
                    <div className="w-[78%]">{children}</div>
                    {/* <div className=" flex w-screen sticky top-0 ">
                    </div> */}
                    {/* <div className="flex-grow "> */}
                    {/* <div className="flex-grow overflow-auto p-6 md:p-12"> */}
                    {/* </div> */}
                    {/* <div className="w-full flex-none md:w-[25%] h-screen md:overflow-hidden">
                        <Chapter />
                    </div>
                    <div className="flex-grow p-6 md:p-12 overflow-y-auto h-screen">
                        {children}
                    </div> */}
                </div>
            )}
        </div>
    )
}
