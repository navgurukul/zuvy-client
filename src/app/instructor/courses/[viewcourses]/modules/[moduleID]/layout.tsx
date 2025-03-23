'use client'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useParams } from 'next/navigation'
import Chapters from '@/app/student/courses/[viewcourses]/modules/_components/Chapters'
import { ScrollArea } from '@/components/ui/scroll-area'
import useResponsiveHeight from '@/hooks/useResponsiveHeight'

export default function Layout({ children }: { children: React.ReactNode }) {
    const { projectID } = useParams()
    const heightClass = useResponsiveHeight()

    return (
        <div className="h-screen">
            {projectID ? (
                <MaxWidthWrapper>{children}</MaxWidthWrapper>
            ) : (
                // <MaxWidthWrapper><Project /></MaxWidthWrapper>
                <div className="flex h-full flex-col md:flex-row md:overflow-hidden">
                    <div className="w-full flex-none md:w-[25%]">
                        <Chapters />
                    </div>
                    <div className="flex-grow pl-10">{children}</div>
                </div>
            )}
        </div>
    )
}
