'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { useParams } from 'next/navigation'
import Chapters from '@/app/student/courses/[viewcourses]/modules/_components/Chapters'
import ChapterContent from '@/app/student/courses/[viewcourses]/modules/_components/ChapterContent'

const Page = ({ params }: any) => {
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const { viewcourses, moduleID } = useParams()
    const [moduleName, setModuleName] = useState('')

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
        {
            crumb: moduleName,
            isLast: true,
        },
    ]

    // // func
    const getModuleName = useCallback(async () => {
        try {
            const response = await api.get(
                `tracking/getAllChaptersWithStatus/${moduleID}`
            )
            setModuleName(response.data.moduleDetails[0].name)
        } catch (error) {
            console.log(error)
        }
    }, [])

    // async
    useEffect(() => {
        if (userID) {
            getModuleName()
        }
    }, [userID, getModuleName])

    return (
        <>
            {/* <BreadcrumbComponent crumbs={crumbs} /> */}
            {/* <Chapters params={params} /> */}
            <ChapterContent />
        </>
    )
}

export default Page
