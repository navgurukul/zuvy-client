import Link from 'next/link'
import React, { useState } from 'react'

type Props = {
    title: string
    studentsSubmitted: number
    totalSubmissions: number
    courseId: number
    id: string
    moduleId: any
}

const SubmissionComponent = (props: Props) => {
    const [color, setColor] = useState('#ff0000')

    const handleClick = () => {
        const randomColor =
            '#' + Math.floor(Math.random() * 16777215).toString(16)
        setColor(randomColor)
    }

    return (
        <Link
            href={`/admin/courses/${props.courseId}/submissionProblems/${props.moduleId}`}
        >
            <div className="lg:flex h-[100px] shadow-md  rounded-md p-4">
                <div className="flex flex-col justify-between py-2 lg:mx-2">
                    <h1 className="text-md text-start font-semibold text-gray-800  dark:text-white ">
                        {props.title}
                    </h1>

                    <div className="text-start flex gap-x-2">
                        <div className="flex items-center justify-center">
                            <div
                                className="w-2 h-2 rounded-full flex items-center justify-center cursor-pointer"
                                style={{ backgroundColor: color }}
                                onClick={handleClick}
                            ></div>
                        </div>
                        <h3>
                            {props.studentsSubmitted} / {props.totalSubmissions}
                        </h3>
                        <h3 className="text-gray-400 font-semibold">
                            Submissions
                        </h3>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default SubmissionComponent
