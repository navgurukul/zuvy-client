'use client'

import React from 'react'
import Projects from '@/app/student/courses/[viewcourses]/modules/_components/Projects'
import { useParams } from 'next/navigation'

export default function Project() {
    const { viewcourses, moduleID, projectID } = useParams()

    return (
        <>
            <Projects
                moduleId={+moduleID}
                projectId={+projectID}
                bootcampId={+viewcourses}
            />
        </>
    )
}
