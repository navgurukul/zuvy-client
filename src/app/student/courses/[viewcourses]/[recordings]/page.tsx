'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { api } from '@/utils/axios.config'
import { useLazyLoadedStudentData } from '@/store/store'
// import UpcomingClasses from './_components/UpcomingClasses'
import BreadcrumbCmponent from '@/app/_components/breadcrumbCmponent'
import {BootcampData} from "@/app/student/courses/[viewcourses]/[recordings]/type"

function Page({
    params,
}: {
    params: { viewcourses: string; moduleID: string }
}) {
    const { studentData } = useLazyLoadedStudentData()
    const [bootcampData, setBootcampData] = useState({} as BootcampData)
    const userID = studentData?.id && studentData?.id

    const crumbs = [
        { crumb: 'My Courses', href: '/student/courses', isLast: false },
        {
            crumb: `${bootcampData?.bootcamp?.name}` || `Course`,
            href: `/student/courses/${params.viewcourses}/batch/206`,
            isLast: false,
        },
        {
            crumb: 'Upcoming Classes',
            // href: `/student/courses/${params.viewcourses}/recordings`,
            isLast: true,
        },
    ]

    useEffect(() => {
        api.get(`/bootcamp/${params.viewcourses}`)
            .then((response) => {
                setBootcampData(response.data)
            })
            .catch((error) => {
                console.error('Error fetching bootcamp data:', error)
            })
    }, [params.viewcourses])

    return (
        <>
            <BreadcrumbCmponent crumbs={crumbs} />
            {/* <div className="w-1/2 mt-10">
                <UpcomingClasses
                    ongoingClasses={ongoingClasses}
                    upcomingClasses={upcomingClasses}
                />
            </div> */}
        </>
    )
}

export default Page
