'use client'

import React, { useCallback, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Projects from '../../../_components/Projects'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import {
    useLazyLoadedStudentData,
    getParamBatchId,
    getModuleName,
} from '@/store/store'
import { api } from '@/utils/axios.config'
import {Params, Crumb, ModuleDetails}from '@/app/student/courses/[viewcourses]/modules/[moduleID]/project/[projectID]/type'
export default function Project() {
    const { studentData } = useLazyLoadedStudentData()
    const { viewcourses, moduleID, projectID } = useParams()
    const { moduleName, setModuleName } = getModuleName()
    const { paramBatchId } = getParamBatchId()
    const userID = studentData?.id && studentData?.id

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

    const getModule = useCallback(async () => {
        try {
            const response = await api.get<{
        moduleDetails: ModuleDetails[]
      }>(
                `tracking/getAllChaptersWithStatus/${moduleID}`
            )
            setModuleName(response.data.moduleDetails[0].name)
        } catch (error) {
            console.error(error)
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
                moduleId={Number(moduleID)}
                projectId={Number(projectID)}
                bootcampId={Number(viewcourses)}
            />
        </>
    )
}


