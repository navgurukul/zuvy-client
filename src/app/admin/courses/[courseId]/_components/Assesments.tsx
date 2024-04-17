import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Link from 'next/link'
import React from 'react'
import AssesmentComponent from './AssesmentComponent'

type Props = {}

const Assesments = (props: Props) => {
    const arr = [1, 2, 3]
    return (
        <Link href={''}>
            <div className="w-full ">
                <h1 className="ml-6 text-start font-semibold"></h1>
                <section className="bg-white dark:bg-gray-900">
                    <div className=" px-6 py-5 mx-auto">
                        <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2">
                            {arr.map((arrItem) => (
                                <AssesmentComponent
                                    title={'Python basic Assesment 1'}
                                    codingChallenges={5}
                                    mcq={10}
                                    openEnded={2}
                                    key={arrItem}
                                    totalSubmissions={50}
                                    studentsSubmitted={20}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </Link>
    )
}

export default Assesments
