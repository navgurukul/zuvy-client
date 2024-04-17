import React from 'react'
import IndividualStudent from './IndividualStudent'

type Props = {}

const IndividualStudentAssesment = (props: Props) => {
    const arr = [1, 2, 3]

    return (
        <div className="w-full ">
            <h1 className="ml-6 text-start font-semibold">
                {/* Module {props.moduleNo} */}
            </h1>
            <section className="bg-white dark:bg-gray-900">
                <div className=" px-6 py-5 mx-auto">
                    <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2">
                        {arr.map((arrItem) => (
                            <IndividualStudent
                                title={'Run A String Of Pair'}
                                totalSubmissions={50}
                                studentsSubmitted={20}
                                key={arrItem}
                                timetaken={10}
                                copyPaste={'None'}
                                tabChanges={'None'}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default IndividualStudentAssesment
