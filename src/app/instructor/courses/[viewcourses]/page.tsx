'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { api } from '@/utils/axios.config'
import CurricullumCard from '../../_components/curricullumCard'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { useParams } from 'next/navigation'
import { decryptId } from '@/app/utils'

const Curricullum = () => {
    const { viewcourses } = useParams()
    const course_id = Array.isArray(viewcourses) ? viewcourses[0] : viewcourses
    const decryptedCourseID = decryptId(course_id)
    const [allCourses, setAllCourses] = useState<any[]>([])

    const crumbs = [
        {
            crumb: 'Courses',
            href: '/instructor/courses',
            isLast: false,
        },
        {
            crumb: 'Curriculum',
            href: `/instructor/courses/${viewcourses}`,
            isLast: false,
        },
    ]

    const getAllCourses = useCallback(async () => {
        try {
            const response = await api.get(
                `Content/allModules/${decryptedCourseID}`
            )
            setAllCourses(response.data)
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }, [])

    useEffect(() => {
        getAllCourses()
    }, [getAllCourses])

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />

            <div className="flex flex-col justify-center items-center">
                <div className="items-start w-1/2">
                    <h1 className="font-semibold text-xl text-start mb-2 ">
                        Courses Modules
                    </h1>
                </div>

                {allCourses.map((item) => (
                    <div key={item.id} className="lg:w-1/2 w-full">
                        <div
                            className={`${
                                item.typeId === 2
                                    ? 'bg-yellow/50'
                                    : 'bg-popover'
                            } my-3 p-3  flex rounded-xl border-none shadow-[0_1px_5px_0_rgba(74,74,74,0.10),0_2px_1px_0_rgba(74,74,74,0.06),0_1px_2px_0_rgba(74,74,74,0.08)]`}
                        >
                            <CurricullumCard key={item} course={item} />
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default Curricullum
