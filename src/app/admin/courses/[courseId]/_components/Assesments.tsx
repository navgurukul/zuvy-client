import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Link from 'next/link'
import React from 'react'
import AssesmentComponent from './AssesmentComponent'
import { Button } from '@/components/ui/button'

type Props = {
    courseId: number
}

const Assesments = (props: Props) => {
    const arr = [1, 2, 3]
    return (
        <div className="w-full ">
            <section className="bg-white dark:bg-gray-900">
                <div className=" px-6 py-5 mx-auto">
                    <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2">
                        {arr.map((arrItem) => (
                            <Link
                                key={arrItem}
                                href={`/admin/courses/${props.courseId}/submissions/${arrItem}`}
                            >
                                <AssesmentComponent
                                    title={'Python basic Assesment 1'}
                                    codingChallenges={5}
                                    mcq={10}
                                    openEnded={2}
                                    key={arrItem}
                                    totalSubmissions={50}
                                    studentsSubmitted={20}
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
