'use client'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useParams, usePathname } from 'next/navigation'
import Chapters from '../_components/Chapters'

export default function Layout({ children }: { children: React.ReactNode }) {
    const { projectID } = useParams()
    const pathname = usePathname()
    const assessmentRoute =
        pathname?.includes('/assessment') ||
        pathname?.includes('/codepanel') ||
        pathname?.includes('/codingresult')

    return (
        <>
            {projectID || assessmentRoute ? (
                <MaxWidthWrapper>{children}</MaxWidthWrapper>
            ) : (
                // <MaxWidthWrapper><Project /></MaxWidthWrapper>
                <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
                    <div className="w-full flex-none md:w-[25%]">
                        <Chapters />
                    </div>
                    <div className="flex-grow p-6 md:p-12">{children}</div>
                </div>
            )}
        </>
    )
}
