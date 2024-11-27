'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/utils/axios.config'
import {
    getChapterContentState,
    getChapterDataState,
    getModuleData,
    getCurrentChapterState,
    getTopicId,
} from '@/store/store'

import { renderChapterContent } from '../../../_components/RenderChapterContent'

export default function Page({
    params,
}: {
    params: { moduleId: any; courseId: any }
}) {
    const { courseId, moduleId, chapterID } = useParams()
    const moduleID = Array.isArray(moduleId) ? moduleId[0] : moduleId
    const chapter_id = Array.isArray(chapterID)
        ? Number(chapterID[0])
        : Number(chapterID)
    const { chapterData, setChapterData } = getChapterDataState()
    const { chapterContent, setChapterContent } = getChapterContentState()
    const { moduleData, setModuleData } = getModuleData()
    const [chapterId, setChapterId] = useState<number>(0)
    const [activeChapterTitle, setActiveChapterTitle] = useState('')
    const { currentChapter, setCurrentChapter } = getCurrentChapterState()
    const [activeChapter, setActiveChapter] = useState(chapter_id)
    const [topicId, setTopicId] = useState(0)
    const [key, setKey] = useState(0)
    const [loading, setLoading] = useState(true)

    const fetchChapterContent = useCallback(
        async (chapterId: number, topicId: number) => {
            try {
                const response = await api.get(
                    `Content/chapterDetailsById/${chapterID}?bootcampId=${courseId}&moduleId=${moduleId}&topicId=${topicId}`
                )

                setChapterId(chapterId)
                const currentModule: any = moduleData.find(
                    (myModule: any) => myModule.chapterId === chapterId
                )

                if (currentModule) {
                    setActiveChapterTitle(currentModule?.chapterTitle)
                    setCurrentChapter(currentModule)
                }

                if (currentModule?.topicName === 'Quiz') {
                    setChapterContent(
                        response.data
                        // .quizQuestionDetails as QuizQuestionDetails[]
                    )
                } else if (currentModule?.topicName === 'Coding Question') {
                    setChapterContent(response.data)
                } else if (currentModule?.topicName === 'Form') {
                    setChapterContent(response.data)
                } else {
                    setChapterContent(response.data)
                }

                setTimeout(() => {
                    setLoading(false) // Set loading to false after the delay
                }, 100)

                if(currentModule?.topicId > 0){
                    setTopicId(currentModule?.topicId)
                }
                setActiveChapter(chapterId)
                setKey((prevKey: any) => prevKey + 1)
            } catch (error) {
                console.error('Error fetching chapter content:', error)
                setTimeout(() => {
                    setLoading(false) // Set loading to false after the delay
                }, 100)
            }
        },
        [moduleData, courseId, moduleId]
    )

    useEffect(() => {
        if (chapterData.length > 0) {
            fetchChapterContent(chapter_id, topicId)
        } else {
            setActiveChapter(0)
            setChapterContent([])
            setActiveChapterTitle('')
            setTopicId(0)
            setTimeout(() => {
                setLoading(false) // Set loading to false after the delay
            }, 100)
        }
    }, [chapterData, fetchChapterContent])

    return (
        <div className="">
            {renderChapterContent({
                topicId,
                chapterId,
                chapterContent,
                moduleID,
                activeChapterTitle,
                loading,
                fetchChapterContent,
            })}
        </div>
    )
}
