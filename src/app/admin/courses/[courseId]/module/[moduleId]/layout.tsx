'use client'

import Chapter from '@/components/ui/chapter'
import Link from 'next/link'
import Project from './project/[projectID]/page'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useParams } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
    const { courseId, moduleId, projectID } = useParams()

    // const projectId = 1
    return (
        <>
            {projectID ? (
                <MaxWidthWrapper>{children}</MaxWidthWrapper>
            ) : (
                // <MaxWidthWrapper><Project /></MaxWidthWrapper>
                <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
                    <div className="w-full flex-none md:w-64">
                        <Chapter />
                    </div>
                    <div className="flex-grow p-6 md:p-12">{children}</div>
                </div>
            )}
        </>
        // <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
        //     <div className="w-full flex-none md:w-64">
        //         {/* <div className="w-full flex-none"> */}
        //         {/* <SideNav /> */}
        //         <Chapter />
        //     </div>
        //     {/* <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div> */}
        //     <div className="flex-grow p-6 md:p-12">{children}</div>
        // </div>
    )
}
