// export default function Project() {
//     return <h1>Punnu Please add Project from chapters</h1>
// }

'use client'

import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
// import Projects from '../../../_components/Projects'
import { api } from '@/utils/axios.config'
import {
    getStudentChaptersState,
    getTopicId,
    getScrollPosition,
} from '@/store/store'
import { decryptId } from '@/app/utils'
import Projects from '@/app/student/courses/[viewcourses]/modules/_components/Projects'

export default function Project() {
    const { viewcourses, moduleID, projectID } = useParams()
    const course_id = Array.isArray(viewcourses) ? viewcourses[0] : viewcourses
    const decryptedCourseID = decryptId(course_id)
    const module_id = Array.isArray(moduleID) ? moduleID[0] : moduleID
    const decryptedModuleId = decryptId(module_id)
    const chapter_id = Array.isArray(projectID) ? projectID[0] : projectID
    const decryptedProjectId = decryptId(chapter_id)
    const { chapters, setChapters } = getStudentChaptersState()

    const fetchChapters = useCallback(async () => {
        try {
            const response = await api.get(
                `tracking/getAllChaptersWithStatus/${decryptedModuleId}`
            )
            setChapters(response.data.trackingData)
            // const firstPending = response.data.trackingData.find(
            //     (chapter: Chapter) => chapter.status === 'Pending'
            // )
            // console.log('response in firstPending.id', response)
            // console.log(
            //     'nextChapterId || firstPending.id in if',
            //     nextChapterId ? nextChapterId : firstPending.id
            // )
            // setActiveChapter(nextChapterId || firstPending.id)
            // fetchChapterContent(nextChapterId || firstPending.id)
            // console.log('response', response)
            // console.log('firstPending', firstPending)
            // setTypeId(response?.data.moduleDetails[0]?.typeId)
            // setProjectId(response?.data.moduleDetails[0]?.projectId)
            // console.log('firstPending?.id', firstPending?.id)
            // setActiveChapter(firstPending?.id)
            // fetchChapterContent(firstPending?.id)
            // if (activeChapter === 0) {
            //     setActiveChapter(response.data.trackingData[0]?.id)
            // fetchChapterContent(chapter_id)
            // }
        } catch (error) {
            console.log(error)
        }
    }, [])

    const completeChapter = async () => {
        try {
            // await api.post(
            //     `tracking/updateChapterStatus/${viewcourses}/${moduleID}?chapterId=${activeChapter}`
            // )
            await fetchChapters()
        } catch (error) {
            console.error('Error updating chapter status:', error)
        }
    }

    return (
        <>
            <Projects
                moduleId={decryptedModuleId}
                projectId={decryptedProjectId}
                bootcampId={decryptedCourseID}
                completeChapter={completeChapter}
            />
        </>
    )
}
