'use client'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useParams, usePathname } from 'next/navigation'
import Chapters from '../_components/Chapters'
import { ScrollArea } from '@/components/ui/scroll-area'
import useResponsiveHeight from '@/hooks/useResponsiveHeight'

export default function Layout({ children }: { children: React.ReactNode }) {
    const heightClass = useResponsiveHeight()
    const { projectID } = useParams()
    const pathname = usePathname()
    const assessmentRoute =
        pathname?.includes('/assessment') ||
        pathname?.includes('/codepanel') ||
        pathname?.includes('/codingresult')

    return (
        <div className={`h-screen`}>
            {projectID || assessmentRoute ? (
                <MaxWidthWrapper>{children}</MaxWidthWrapper>
            ) : (
                // <MaxWidthWrapper><Project /></MaxWidthWrapper>
                <div className="flex h-full flex-col md:flex-row">
                    {/* <div className="flex h-full flex-col md:flex-row md:overflow-hidden"> */}
                    <div className="w-full flex-none md:w-[25%]">
                        <Chapters />
                    </div>
                    <div className="flex-grow  sm:pl-10 pl-4">{children}</div>

                    {/* <div className="flex-grow pl-10">
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
                    </div> */}
                </div>
            )}
        </div>
    )
}
