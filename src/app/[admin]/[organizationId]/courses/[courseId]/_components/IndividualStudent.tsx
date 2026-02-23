'use client'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { IndividuleStudentProps } from '@/app/[admin]/[organizationId]/courses/[courseId]/_components/adminCourseCourseIdComponentType'

const IndividualStudent = (props: IndividuleStudentProps) => {
    const [color, setColor] = useState('#ff0000')
    const handleClick = () => {
        const randomColor =
            '#' + Math.floor(Math.random() * 16777215).toString(16)
        setColor(randomColor)
    }
    return (
        <div>
            <div className="lg:flex h-[150px] shadow-md  rounded-md p-4">
                <div className="flex flex-col justify-between py-2 lg:mx-2 w-full">
                    <div className="flex items-center justify-between w-full">
                        <h1 className="text-md font-semibold text-gray-800  dark:text-white ">
                            {props.title}
                        </h1>
                        <Link
                            className=" flex items-center text-secondary font-bold"
                            href={''}
                        >
                            See Solutions
                            <ChevronRight size={20} />
                        </Link>
                    </div>
                    <div className="flex  gap-x-3 items-start">
                        <h1>Time taken: {props.timetaken} mins</h1>
                        <h1>Copy paste: {props.copyPaste}</h1>
                        <h1>Tab changes: {props.tabChanges}</h1>
                    </div>

                    <div className="text-start flex gap-x-2">
                        <div className="flex items-center justify-center">
                            <div
                                className="w-2 h-2 rounded-full flex items-center justify-center cursor-pointer"
                                style={{ backgroundColor: color }}
                                onClick={handleClick}
                            ></div>
                        </div>
                        <h3 className="text-gray-400 font-semibold">
                            Submissions
                        </h3>
                        <h3>
                            {props.studentsSubmitted} / {props.totalSubmissions}
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IndividualStudent
