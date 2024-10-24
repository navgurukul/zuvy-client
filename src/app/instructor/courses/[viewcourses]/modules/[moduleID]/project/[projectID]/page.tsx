'use client'

import React, { useCallback, useEffect } from 'react'
import Projects from '@/app/student/courses/[viewcourses]/modules/_components/Projects'
import { useParams } from 'next/navigation'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import {
    useLazyLoadedStudentData,
    getParamBatchId,
    getModuleName,
} from '@/store/store'
import { api } from '@/utils/axios.config'

export default function Project() {
    const { studentData } = useLazyLoadedStudentData()
    const { viewcourses, moduleID, projectID } = useParams()
    const { moduleName, setModuleName } = getModuleName()
    const { paramBatchId } = getParamBatchId()
    const userID = studentData?.id && studentData?.id

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

    const getModule = useCallback(async () => {
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
            getModule()
        }
    }, [userID, getModule])

    return (
        <>
            <div className="mb-5">
                <BreadcrumbComponent crumbs={crumbs} />
            </div>
            <Projects
                moduleId={+moduleID}
                projectId={+projectID}
                bootcampId={+viewcourses}
            />
        </>
    )
}
