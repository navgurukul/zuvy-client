import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Link from 'next/link'
import React from 'react'
import SubmissionComponent from './submissionComponent'

type Props = {
    moduleNo: number
}

const PraticeProblems = (props: Props) => {
    const arr = [1, 2, 3, 4, 5, 6, 7]
    return (
        <div className="w-full ">
            <h1 className="ml-6 text-start font-semibold">
                Module {props.moduleNo}
            </h1>
            <section className="bg-white dark:bg-gray-900">
                <div className=" px-6 py-5 mx-auto">
                    <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-3">
                        {arr.map((arrItem) => (
                            <SubmissionComponent
                                title={'Invert a binary Tree with python'}
                                totalSubmissions={50}
                                studentsSubmitted={20}
                                key={arrItem}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default PraticeProblems
