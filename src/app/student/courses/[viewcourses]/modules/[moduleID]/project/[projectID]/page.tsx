'use client'

import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Projects from '../../../_components/Projects'
import { api } from '@/utils/axios.config'
import {
    getStudentChaptersState,
    getTopicId,
    getScrollPosition,
} from '@/store/store'

export default function Project() {
    const { viewcourses, moduleID, projectID } = useParams()
    const { chapters, setChapters } = getStudentChaptersState()

    const fetchChapters = useCallback(async () => {
        try {
            const response = await api.get(
                `tracking/getAllChaptersWithStatus/${moduleID}`
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
                moduleId={+moduleID}
                projectId={+projectID}
                bootcampId={+viewcourses}
                completeChapter={completeChapter}
            />
        </>
    )
}
