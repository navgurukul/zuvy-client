import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import Video from './Video'
import Article from './Article'
import CodingChallenge from './CodingChallenge'
import Quiz from './Quiz'
import Assignment from './Assignment'
import Assessment from './Assessment'
import FeedbackForm from './FeedbackForm'
import { useLazyLoadedStudentData } from '@/store/store'
import { getAssessmentShortInfo } from '@/utils/students'
import { api } from '@/utils/axios.config'
import {
    getStudentChapterContentState,
    getStudentChaptersState,
    getTopicId,
    getScrollPosition,
} from '@/store/store'
import { Button } from '@/components/ui/button'
import useResponsiveHeight from '@/hooks/useResponsiveHeight'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Chapter {
    id: number
    title: string
    topicId: number
    chapterTrackingDetails: { id: number }[]
    status: string
}

function ChapterContent() {
    // misc
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const { viewcourses, moduleID, chapterID } = useParams()
    const chapter_id = Array.isArray(chapterID)
        ? Number(chapterID[0])
        : Number(chapterID)
    const { chapters, setChapters } = getStudentChaptersState()
    const [activeChapter, setActiveChapter] = useState(chapter_id)
    const { topicId, setTopicId } = getTopicId()
    const { chapterContent, setChapterContent } =
        getStudentChapterContentState()
    const [chapterId, setChapterId] = useState<number>(0)
    const [projectId, setProjectId] = useState<number>(0)
    const [assessmentShortInfo, setAssessmentShortInfo] = useState<any>({})
    const [assessmentOutSourceId, setAssessmentOutSourceId] = useState<any>()
    const [submissionId, setSubmissionId] = useState<any>()
    const [typeId, setTypeId] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const heightClass = useResponsiveHeight()

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

                // console.log(
                //     'chapterId in getChapterDetailsWithStatus',
                //     chapterId
                // )
                setActiveChapter(chapterId)
                // console.log(
                //     'response data getChapterDetailsWithStatus',
                //     response.data.trackingData
                // )
                setChapterId(response.data.trackingData.id)
                setTopicId(response.data.trackingData.topicId)
                setChapterContent(response.data.trackingData)
                setTimeout(() => {
                    setLoading(false) // Set loading to false after the delay
                }, 2000)
            } catch (error) {
                console.error('Error fetching chapter content:', error)
            }
        },
        [userID]
    )

    useEffect(() => {
        if (chapters.length > 0) {
            // fetchChapterContent(chapters[0]?.id)
            fetchChapterContent(chapter_id)
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
            // console.log('response', response)
            // console.log('firstPending', firstPending)
            setTypeId(response?.data.moduleDetails[0]?.typeId)
            setProjectId(response?.data.moduleDetails[0]?.projectId)
            // console.log('firstPending?.id', firstPending?.id)
            // setActiveChapter(firstPending?.id)
            // fetchChapterContent(firstPending?.id)
            // if (activeChapter === 0) {
            //     setActiveChapter(response.data.trackingData[0]?.id)
            fetchChapterContent(chapter_id)
            // }
        } catch (error) {
            console.log(error)
        }
    }, [])

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
        // console.log('chapterContent', chapterContent)
        // console.log('loading', loading)
        console.log('Content', topicId)
        if (
            topicId &&
            chapterContent &&
            (chapterContent?.id === chapter_id ||
                chapterContent?.chapterId === chapter_id)
        ) {
            switch (topicId) {
                case 1:
                    return (
                        // <ScrollArea
                        //     className={`${heightClass} pr-4`}
                        //     type="hover"
                        //     style={{
                        //         scrollbarWidth: 'none', // Firefox
                        //         msOverflowStyle: 'none', // IE and Edge
                        //     }}
                        // >
                        <Video
                            content={chapterContent}
                            completeChapter={completeChapter}
                        />
                        // </ScrollArea>
                    )
                case 2:
                    return (
                        // <ScrollArea
                        //     className={`${heightClass} pr-4`}
                        //     type="hover"
                        //     style={{
                        //         scrollbarWidth: 'none', // Firefox
                        //         msOverflowStyle: 'none', // IE and Edge
                        //     }}
                        // >
                        <Article
                            content={chapterContent}
                            completeChapter={completeChapter}
                            key={chapterContent.id}
                            status={chapterContent?.status}
                        />
                        // </ScrollArea>
                    )
                case 3:
                    return (
                        <CodingChallenge
                            content={chapterContent}
                            completeChapter={completeChapter}
                            fetchChapters={fetchChapters}
                        />
                    )
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
                        // <ScrollArea
                        //     className={`${heightClass} pr-4`}
                        //     type="hover"
                        //     style={{
                        //         scrollbarWidth: 'none', // Firefox
                        //         msOverflowStyle: 'none', // IE and Edge
                        //     }}
                        // >
                        <Assignment
                            content={chapterContent}
                            moduleId={+moduleID}
                            projectId={projectId}
                            bootcampId={+viewcourses}
                            completeChapter={completeChapter}
                        />
                        // </ScrollArea>
                    )
                case 6:
                    return (
                        <Assessment
                            assessmentShortInfo={assessmentShortInfo}
                            assessmentOutSourceId={assessmentOutSourceId}
                            submissionId={submissionId}
                            chapterContent={chapterContent}
                        />
                    )
                case 7:
                    return (
                        // <ScrollArea
                        //     className={`${heightClass} pr-4`}
                        //     type="hover"
                        //     style={{
                        //         scrollbarWidth: 'none', // Firefox
                        //         msOverflowStyle: 'none', // IE and Edge
                        //     }}
                        // >
                        <FeedbackForm
                            content={chapterContent}
                            moduleId={moduleID.toString()}
                            // moduleId={moduleIdString}
                            chapterId={chapterId}
                            bootcampId={+viewcourses}
                            completeChapter={completeChapter}
                            // bootcampId={viewcourses}
                        />
                        // </ScrollArea>
                    )
                default:
                    return <h1>No Chapters Available Right Now</h1>
            }
        } else {
            return (
                <>
                    {/* <h1>Hello students...!!</h1> */}
                    {loading ? (
                        <div className="my-5 flex justify-center items-center">
                            <div className="absolute h-screen">
                                <div className="relative top-[70%]">
                                    <Spinner className="text-secondary" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <h1>Create New Chapter</h1>
                    )}
                </>
            )
        }
    }

    return <div>{renderChapterContent()}</div>
}

export default ChapterContent
