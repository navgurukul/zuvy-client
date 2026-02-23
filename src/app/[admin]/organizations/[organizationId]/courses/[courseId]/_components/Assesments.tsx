import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Link from 'next/link'
import React from 'react'
import AssesmentComponent from './AssesmentComponent'
import { Button } from '@/components/ui/button'
import { ModuleProps } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminCourseCourseIdComponentType'
import { usePathname } from 'next/navigation'
import { getUser } from '@/store/store'

const Assesments = (props: ModuleProps) => {
    const pathname = usePathname()
    const orgName = pathname.split('/')[2]
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''

    return (
        <div className="w-full">
            <section className="bg-white dark:bg-gray-900">
                <div className="px-6 py-5 mx-auto">
                    <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2">
                        {props.moduleAssessments.map((module) => (
                            <Link
                                key={module.id}
                                href={`/${userRole}/${orgName}/courses/${props.courseId}/submissions/${module.id}`}
                                className=""
                            >
                                {/* <AssesmentComponent
                                    title={module.title}
                                    codingChallenges={
                                        module.codingChallenges || 10
                                    }
                                    mcq={module.mcq?.length || 0}
                                    openEnded={module.openEnded?.length || 0}
                                    totalSubmissions={
                                        module.totalSubmissions || 50
                                    }
                                    studentsSubmitted={
                                        module.studentsSubmitted || 20
                                    }
                                /> */}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Assesments
