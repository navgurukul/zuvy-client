import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Link from 'next/link'
import React from 'react'
import AssesmentComponent from './AssesmentComponent'
import { Button } from '@/components/ui/button'

type Props = {
    courseId: number
    name: string
    moduleAssessments: any
}

const Assesments = (props: Props) => {
    return (
        <div className="w-full">
            <section className="bg-white dark:bg-gray-900">
                <div className="px-6 py-5 mx-auto">
                    <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2">
                        {props.moduleAssessments.map((module: any) => (
                            <Link
                                key={module.id}
                                href={`/admin/courses/${props.courseId}/submissions/${module.id}`}
                                className=""
                            >
                                <AssesmentComponent
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
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Assesments
