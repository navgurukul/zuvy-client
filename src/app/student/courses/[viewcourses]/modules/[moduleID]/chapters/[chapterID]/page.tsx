
'use client'

import { getParamBatchId, useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import React, { useCallback, useEffect, useState } from 'react'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { useParams } from 'next/navigation'
import Chapters from '../../../_components/Chapters'
// import Chapters from '../_components/Chapters'

function Page({ params }: any) {
    // misc
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const { viewcourses, moduleID } = useParams()
    const { paramBatchId } = getParamBatchId()
    const [moduleName, setModuleName] = useState('')

    const crumbs = [
        {
            crumb: 'Courses',
            href: '/student/courses',
            isLast: false,
        },
        {
            crumb: 'Curriculum',
            href: `/student/courses/${viewcourses}/batch/${paramBatchId}`,
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
            <BreadcrumbComponent crumbs={crumbs} />
            <Chapters params={params} />
        </>
    )
}

export default Page
