'use client'

import Chapter from '@/components/ui/chapter'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useParams, usePathname } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
    const { courseId, moduleId, projectID } = useParams()
    const pathname = usePathname()
    const adminAssessmentPreviewRoute =
        pathname?.includes('/admin/courses') &&
        pathname?.includes('/module') &&
        pathname?.includes('/chapter') &&
        pathname?.includes('/assessment') &&
        pathname?.includes('/preview')

    return (
        <>
            {projectID || adminAssessmentPreviewRoute ? (
                <MaxWidthWrapper>{children}</MaxWidthWrapper>
            ) : (
                // <MaxWidthWrapper><Project /></MaxWidthWrapper>
                <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
                    {/* <div className="w-full flex-none md:w-[25%]"> */}
                    {/* <div className="w-full flex-none md:w-[25%] sticky top-0 h-screen overflow-y-auto"> */}
                    <div className="w-full flex-none md:w-[25%] sticky top-0 h-screen">
                        <Chapter />
                    </div>
                    <div className="flex-grow p-6 md:p-12">
                        {/* <div className="flex-grow overflow-auto p-6 md:p-12"> */}
                        {children}
                    </div>
                    {/* <div className="w-full flex-none md:w-[25%] h-screen md:overflow-hidden">
                        <Chapter />
                    </div>
                    <div className="flex-grow p-6 md:p-12 overflow-y-auto h-screen">
                        {children}
                    </div> */}
                </div>
            )}
        </>
    )
}
