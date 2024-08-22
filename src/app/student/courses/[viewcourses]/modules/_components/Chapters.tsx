'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import React, { useCallback, useEffect, useState } from 'react'
import StudentChapterItem from '../../../_components/StudentChapterItem'
import Video from './Video'
import Article from './Article'
import CodingChallenge from './CodingChallenge'
import Quiz from './Quiz'
import Assignment from './Assignment'
import { useParams } from 'next/navigation'
import Assessment from './Assessment'
import FeedbackForm from './FeedbackForm'
import { getAssessmentShortInfo } from '@/utils/students'
import Projects from './Projects'

interface Chapter {
    id: number
    title: string
    topicId: number
    chapterTrackingDetails: { id: number }[]
    status: string
}

function Chapters({ params }: any) {
    // misc
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const { viewcourses, moduleID } = useParams()
    const urlParams = new URLSearchParams(window.location.search)
    const nextChapterId = Number(urlParams.get('nextChapterId'))
    // state and variables
    const [chapters, setChapters] = useState<any>([])
    const [activeChapter, setActiveChapter] = useState(0)
    const [topicId, setTopicId] = useState<any>(null)
    const [chapterContent, setChapterContent] = useState<any>({})
    const [chapterId, setChapterId] = useState<number>(0)
    const [projectId, setProjectId] = useState<number>(0)
    const [assessmentShortInfo, setAssessmentShortInfo] = useState<any>({})
    const [assessmentOutSourceId, setAssessmentOutSourceId] = useState<any>()
    const [submissionId, setSubmissionId] = useState<any>()
    const [typeId, setTypeId] = useState<any>(null)

    // func [viewcourses]   [courseId]
    const fetchChapters = useCallback(async () => {
        try {
            const response = await api.get(
                `tracking/getAllChaptersWithStatus/${moduleID}`
            )
            setChapters(response.data.trackingData)
            const firstPending = response.data.trackingData.find(
                (chapter: Chapter) => chapter.status === 'Pending'
            )
            // console.log('response in firstPending.id', response)
            // console.log(
            //     'nextChapterId || firstPending.id in if',
            //     nextChapterId ? nextChapterId : firstPending.id
            // )
            // setActiveChapter(nextChapterId || firstPending.id)
            // fetchChapterContent(nextChapterId || firstPending.id)
            setProjectId(response?.data.moduleDetails[0]?.projectId)
            setActiveChapter(firstPending?.id)
            fetchChapterContent(firstPending?.id)
            setTypeId(response?.data.moduleDetails[0]?.typeId)
        } catch (error) {
            console.log(error)
        }
    }, [])

    const fetchChapterContent = useCallback(
        async (chapterId: number) => {
            if (!userID) return
            try {
                const response = await api.get(
                    `/tracking/getChapterDetailsWithStatus/${chapterId}`
                    // `/tracking/getChapterDetailsWithStatus/${nextChapterId}`
                )
                // console.log('response', response)
                // console.log(
                //     'nextChapterId || chapterId',
                //     nextChapterId || chapterId
                // )
                // setActiveChapter(nextChapterId || chapterId)
                // setChapterId(nextChapterId || response.data.trackingData.id)

                setActiveChapter(chapterId)
                setChapterId(response.data.trackingData.id)
                setTopicId(response.data.trackingData.topicId)
                setChapterContent(response.data.trackingData)
            } catch (error) {
                console.error('Error fetching chapter content:', error)
            }
        },
        [userID]
    )

    const completeChapter = async () => {
        try {
            await api.post(
                `tracking/updateChapterStatus/${viewcourses}/${moduleID}?chapterId=${activeChapter}`
            )
            await fetchChapters()
        } catch (error) {
            console.error('Error updating chapter status:', error)
        }
    }

    const renderChapterContent = () => {
        if (typeId === 2)
            return (
                <Projects
                    moduleId={+moduleID}
                    projectId={projectId}
                    bootcampId={+viewcourses}
                    completeChapter={completeChapter}
                />
            )

        switch (topicId) {
            case 1:
                return (
                    <Video
                        content={chapterContent}
                        completeChapter={completeChapter}
                    />
                )
            case 2:
                return (
                    <Article
                        content={chapterContent}
                        completeChapter={completeChapter}
                    />
                )
            case 3:
                return <CodingChallenge />
            case 4:
                return (
                    <Quiz
                        content={chapterContent}
                        moduleId={moduleID.toString()}
                        // moduleId={moduleIdString}
                        chapterId={chapterId}
                        bootcampId={+viewcourses}
                        fetchChapters={completeChapter}
                    />
                )
            case 5:
                return (
                    <Assignment
                        content={chapterContent}
                        moduleId={+moduleID}
                        projectId={projectId}
                        bootcampId={+viewcourses}
                        completeChapter={completeChapter}
                    />
                )
            case 6:
                return (
                    <Assessment
                        assessmentShortInfo={assessmentShortInfo}
                        assessmentOutSourceId={assessmentOutSourceId}
                        submissionId={submissionId}
                    />
                )
            case 7:
                return (
                    <FeedbackForm
                        content={chapterContent}
                        moduleId={moduleID.toString()}
                        // moduleId={moduleIdString}
                        chapterId={chapterId}
                        bootcampId={+viewcourses}
                        // bootcampId={viewcourses}
                    />
                )
            default:
                return <h1>No Chapters Available Right Now</h1>
        }
    }

    // async
    useEffect(() => {
        if (userID) {
            fetchChapters()
        }
    }, [userID, fetchChapters])

    useEffect(() => {
        if (chapters.length > 0) {
            fetchChapterContent(chapters[0]?.id)
        }
    }, [chapters])

    useEffect(() => {
        if (topicId === 6) {
            getAssessmentShortInfo(
                chapterContent?.assessmentId,
                moduleID,
                viewcourses,
                chapterId,
                setAssessmentShortInfo,
                setAssessmentOutSourceId,
                setSubmissionId
            )
        }
    }, [topicId, chapterId])

    return (
        <>
            {chapters.length > 0 ? (
                <div className="grid  grid-cols-4 mt-5">
                    <div className=" col-span-1">
                        <ScrollArea className="h-dvh pr-4">
                            {chapters?.map((item: any, index: any) => {
                                return (
                                    <StudentChapterItem
                                        key={item.id}
                                        chapterId={item.id}
                                        title={item.title}
                                        topicId={item.topicId}
                                        fetchChapterContent={
                                            fetchChapterContent
                                        }
                                        activeChapter={activeChapter}
                                        status={item.status}
                                    />
                                )
                            })}
                        </ScrollArea>
                    </div>
                    <div className="col-span-3 mx-4">
                        {renderChapterContent()}
                    </div>
                </div>
            ) : (
                <h1 className="mt-5">No Chapters Available Right Now</h1>
            )}
        </>
    )
}

export default Chapters
