'use client'

import ChapterItem from '@/app/admin/courses/[courseId]/module/_components/ChapterItem'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getParamBatchId, useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import React, { useCallback, useEffect, useState } from 'react'
import StudentChapterItem from '../../../_components/StudentChapterItem'
import CodingChallenge from '../_components/CodingChallenge'
import Video from '../_components/Video'
import Article from '../_components/Article'
import Quiz from '../_components/Quiz'
import Assignment from '../_components/Assignment'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { useParams } from 'next/navigation'
import Assessment from '../_components/Assessment'
import FeedbackForm from '../_components/FeedbackForm'
import { getAssessmentShortInfo } from '@/utils/students'

interface Chapter {
    id: number
    title: string
    topicId: number
    chapterTrackingDetails: { id: number }[]
    status: string
}

function Page({ params }: any) {
    // misc
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const { viewcourses, moduleID } = useParams()
    const { paramBatchId } = getParamBatchId()
    const urlParams = new URLSearchParams(window.location.search)
    const nextChapterId = Number(urlParams.get('nextChapterId'))
    // state and variables
    const [chapters, setChapters] = useState<any>([])
    const [activeChapter, setActiveChapter] = useState(0)
    const [topicId, setTopicId] = useState(0)
    const [moduleName, setModuleName] = useState('')
    const [chapterContent, setChapterContent] = useState<any>({})
    const [chapterId, setChapterId] = useState<number>(0)

    const [assessmentShortInfo, setAssessmentShortInfo] = useState<any>({})
    const [assessmentOutSourceId, setAssessmentOutSourceId] = useState<any>()
    const [submissionId, setSubmissionId] = useState<any>()

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

    // console.log('nextChapterId', nextChapterId)
    // console.log('activeChapter', activeChapter)

    // func
    const fetchChapters = useCallback(async () => {
        try {
            const response = await api.get(
                `tracking/getAllChaptersWithStatus/${moduleID}`
            )
            setChapters(response.data.trackingData)
            setModuleName(response.data.moduleDetails[0].name)
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
            setActiveChapter(firstPending.id)
            fetchChapterContent(firstPending.id)
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

    const completeChapter = () => {
        api.post(
            `tracking/updateChapterStatus/${viewcourses}/${moduleID}?chapterId=${activeChapter}`
            // `tracking/updateChapterStatus/${viewcourses}/${moduleID}?chapterId=${nextChapterId}`
        )

        fetchChapters()
    }

    // console.log('chapterContent', chapterContent)

    const renderChapterContent = () => {
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
                        moduleId={params.moduleID}
                        chapterId={chapterId}
                        bootcampId={params.viewcourses}
                        fetchChapters={fetchChapters}
                    />
                )
            case 5:
                return <Assignment />
            case 6:
                return (
                    <Assessment
                        assessmentShortInfo={assessmentShortInfo}
                        assessmentOutSourceId={assessmentOutSourceId}
                        submissionId={submissionId}
                    />
                )
            case 7:
                return <FeedbackForm />
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
            <BreadcrumbComponent crumbs={crumbs} />
            <div className="grid  grid-cols-4 mt-5">
                <div className=" col-span-1">
                    <ScrollArea className="h-dvh pr-4">
                        {chapters &&
                            chapters?.map((item: any, index: any) => {
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
                <div className="col-span-3 mx-4">{renderChapterContent()}</div>
            </div>
        </>
    )
}

export default Page
