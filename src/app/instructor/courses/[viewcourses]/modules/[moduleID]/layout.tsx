'use client'

import Link from 'next/link'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useParams } from 'next/navigation'
import Chapters from '@/app/student/courses/[viewcourses]/modules/_components/Chapters'

export default function Layout({ children }: { children: React.ReactNode }) {
    const { projectID } = useParams()

    // const projectId = 1
    return (
        <>
            {projectID ? (
                <MaxWidthWrapper>{children}</MaxWidthWrapper>
            ) : (
                // <MaxWidthWrapper><Project /></MaxWidthWrapper>
                <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
                    <div className="w-full flex-none md:w-64">
                        {/* <Chapter /> */}
                        <Chapters />
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
