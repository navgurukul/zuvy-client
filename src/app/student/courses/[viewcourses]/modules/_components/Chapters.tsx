'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import React, { useCallback, useEffect, useState, useRef } from 'react'
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
import {
    getStudentChapterContentState,
    getStudentChaptersState,
    getTopicId,
    getScrollPosition
} from '@/store/store'
import { Spinner } from '@/components/ui/spinner'

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
    const { viewcourses, moduleID, chapterID } = useParams()
    const chapter_id = Array.isArray(chapterID)
        ? Number(chapterID[0])
        : Number(chapterID)
    // const urlParams = new URLSearchParams(window.location.search)
    // const nextChapterId = Number(urlParams.get('nextChapterId'))
    // state and variables
    // const [chapters, setChapters] = useState<any>([])
    const { chapters, setChapters } = getStudentChaptersState()
    const [activeChapter, setActiveChapter] = useState(chapter_id)
    // const [topicId, setTopicId] = useState<any>(null)
    const { topicId, setTopicId } = getTopicId()
    const { chapterContent, setChapterContent } =
        getStudentChapterContentState()
    // const [chapterContent, setChapterContent] = useState<any>({})
    // const [chapterId, setChapterId] = useState<number>(Number(chapterID) || 0)
    const [chapterId, setChapterId] = useState<number>(0)
    const [projectId, setProjectId] = useState<number>(0)
    const [assessmentShortInfo, setAssessmentShortInfo] = useState<any>({})
    const [assessmentOutSourceId, setAssessmentOutSourceId] = useState<any>()
    const [submissionId, setSubmissionId] = useState<any>()
    const [typeId, setTypeId] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const { scrollPosition, setScrollPosition } =
    getScrollPosition()
    // const [scrollPosition, setScrollPosition] = useState(10)

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

    console.log('Before change scrollPosition', scrollPosition)

    const handleScroll = useCallback((event: Event) => {
        const target = event.target as HTMLDivElement
        const newScrollPosition = target.scrollTop
        console.log('Scroll event triggered. New position:', newScrollPosition)
        setScrollPosition(newScrollPosition)
    }, [])

    useEffect(() => {
        console.log('Setting up scroll event listener')
        const scrollArea = scrollAreaRef.current
        if (scrollArea) {
            const scrollableElement = scrollArea.querySelector('[data-radix-scroll-area-viewport]')
            const targetElement = scrollableElement || scrollArea
            
            targetElement.addEventListener('scroll', handleScroll, { passive: true })
            console.log('Scroll event listener added to:', targetElement)
            
            return () => {
                targetElement.removeEventListener('scroll', handleScroll)
                console.log('Scroll event listener removed')
            }
        }
    }, [handleScroll])

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollableElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
            const targetElement = scrollableElement || scrollAreaRef.current
    
            console.log('Attempting to set scrollTop to:', scrollPosition)
            targetElement.scrollTop = scrollPosition
            console.log('scrollTop after setting:', targetElement.scrollTop)
        }
    }, [chapterContent, scrollPosition])

    console.log('scrollAreaRef', scrollAreaRef)
    console.log('scrollPosition', scrollPosition)

    // console.log('activeChapter', activeChapter)
    // console.log('chapters', chapters)
    // console.log('topicId', topicId)
    // console.log('chapterContent ^^^', chapterContent)

    const renderChapterContent = () => {
        // console.log('chapterContent', chapterContent)
        // console.log('loading', loading)
        if (
            topicId &&
            chapterContent &&
            (chapterContent?.id === chapter_id ||
                chapterContent?.chapterId === chapter_id)
        ) {
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
                            key={chapterContent.id}
                        />
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
                            chapterContent={chapterContent}
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
                            completeChapter={completeChapter}
                            // bootcampId={viewcourses}
                        />
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

    // async
    useEffect(() => {
        if (userID) {
            fetchChapters()
        }
    }, [userID, fetchChapters])

    // console.log('chapters', chapters)

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

    return (
        <>
            {chapters.length > 0 ? (
                <div className="grid  grid-cols-4 mt-5">
                    <div className=" col-span-1">
                        <ScrollArea className="h-dvh pr-4" ref={scrollAreaRef}>
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
                                        setActiveChapter={setActiveChapter}
                                        status={item.status}
                                        viewcourses={viewcourses}
                                        moduleID={moduleID}
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
                <Projects
                    moduleId={+moduleID}
                    projectId={projectId}
                    bootcampId={+viewcourses}
                    completeChapter={completeChapter}
                />
            )}
        </>
    )
}

export default Chapters
