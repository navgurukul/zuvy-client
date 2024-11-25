'use client'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useParams } from 'next/navigation'
import Chapters from '@/app/student/courses/[viewcourses]/modules/_components/Chapters'
import useResponsiveHeight from '@/hooks/useResponsiveHeight'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Layout({ children }: { children: React.ReactNode }) {
    const { projectID } = useParams()
    const heightClass = useResponsiveHeight()

    return (
        <div className={`${heightClass}`}>
            {projectID ? (
                <MaxWidthWrapper>{children}</MaxWidthWrapper>
            ) : (
                // <MaxWidthWrapper><Project /></MaxWidthWrapper>
                <div className="flex h-full flex-col md:flex-row md:overflow-hidden">
                    <div className="w-full flex-none md:w-[25%]">
                        <Chapters />
                    </div>

                    <div className="flex-grow p-6 md:p-12">
                        <ScrollArea
                            className={`${heightClass} pr-4`}
                            type="hover"
                            style={{
                                scrollbarWidth: 'none', // Firefox
                                msOverflowStyle: 'none', // IE and Edge
                            }}
                        >
                            {children}
                        </ScrollArea>
                    </div>
                </div>
            )}
        </div>
    )
}
