'use client'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useLazyLoadedStudentData, getParamBatchId } from '@/store/store'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { api } from '@/utils/axios.config'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import StudentChapterItem from '../../../_components/StudentChapterItem'
import { useParams, usePathname } from 'next/navigation'
import { fetchCourseDetails, getAssessmentShortInfo } from '@/utils/students'
import {
    getStudentChapterContentState,
    getStudentChaptersState,
    getTopicId,
    getModuleName,
} from '@/store/store'

interface Chapter {
    id: number
    title: string
    topicId: number
    chapterTrackingDetails: { id: number }[]
    status: string
}

function Chapters({ params }: any) {
    // misc
    const pathname = usePathname()
    const { studentData } = useLazyLoadedStudentData()
    const { paramBatchId } = getParamBatchId()
    const { moduleName, setModuleName } = getModuleName()
    const userID = studentData?.id && studentData?.id
    const { viewcourses, moduleID, chapterID } = useParams()
    const chapter_id = Array.isArray(chapterID)
        ? Number(chapterID[0])
        : Number(chapterID)
    const { chapters, setChapters } = getStudentChaptersState()
    const [activeChapter, setActiveChapter] = useState(chapter_id)
    const { topicId } = getTopicId()
    const { chapterContent, setChapterContent } =
        getStudentChapterContentState()
    const [chapterId, setChapterId] = useState<number>(0)
    // const [projectId, setProjectId] = useState<number>(0)
    const [assessmentShortInfo, setAssessmentShortInfo] = useState<any>({})
    const [assessmentOutSourceId, setAssessmentOutSourceId] = useState<any>()
    const [submissionId, setSubmissionId] = useState<any>()
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const activeChapterRef = useRef<HTMLDivElement | null>(null)
    const isInstructor = pathname?.includes('/instructor')
    const [courseName, setCourseName] = useState('')

    const studentCrumbs = [
        {
            crumb: 'Courses',
            href: '/student/courses',
            isLast: false,
        },
        {
            crumb: `${courseName}-Curriculum`,
            href: `/student/courses/${viewcourses}/batch/${paramBatchId}`,
            isLast: false,
        },
        {
            crumb: moduleName,
            isLast: true,
        },
    ]

    const InstructorCrumbs = [
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

    // func [viewcourses]   [courseId]
    const fetchChapters = useCallback(async () => {
        try {
            const response = await api.get(
                `tracking/getAllChaptersWithStatus/${moduleID}`
            )
            setChapters(response.data.trackingData)
            // setProjectId(response?.data.moduleDetails[0]?.projectId)
        } catch (error) {
            console.error(error)
        }
    }, [])


    useEffect(() => {
        if (activeChapterRef.current && scrollAreaRef.current) {
            // Get the current scroll area
            const scrollArea = scrollAreaRef.current.querySelector(
                '[data-radix-scroll-area-viewport]'
            )

            if (scrollArea) {
                // Calculate the position of the active chapter
                const activeChapterElement = activeChapterRef.current

                // Get the offset of the active chapter within the scroll area
                const elementOffset = activeChapterElement.offsetTop

                // Set the scroll position to this offset
                scrollArea.scrollTop = elementOffset - 100 // Optional: slight offset from the top
            }
        }
    }, [activeChapter])

    useEffect(() => {
        fetchCourseDetails(Number(viewcourses), setCourseName)
    }, [viewcourses])

    // async
    useEffect(() => {
        if (userID) {
            fetchChapters()
        }
    }, [userID, fetchChapters])

    useEffect(() => {
        if (chapters.length > 0) {
            setChapterId(chapter_id)
            setActiveChapter(chapter_id)
        }
    }, [chapters, chapter_id])

    const getModule = useCallback(async () => {
        try {
            const response = await api.get(
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
        <div className="flex flex-col h-full">

            <div className="flex flex-col h-screen">
                <div className='mt-20 pb-2'><BreadcrumbComponent
                    crumbs={isInstructor ? InstructorCrumbs : studentCrumbs}
                /></div>
                <ScrollArea
                    className="h-full pr-4"
                    type="hover"
                    ref={scrollAreaRef}

                >
                    {/* <ScrollBar className='h-dvh'/> */}
                    {chapters?.map((item: any, index: any) => {
                        const isLastItem = index === chapters.length - 1

                        return (
                            <StudentChapterItem
                                key={item.id}
                                chapterId={item.id}
                                title={item.title}
                                topicId={item.topicId}
                                activeChapter={activeChapter}
                                setActiveChapter={setActiveChapter}
                                status={item.status}
                                viewcourses={viewcourses}
                                moduleID={moduleID}
                                activeChapterRef={activeChapterRef}
                            />
                        )
                    })}
                </ScrollArea>
            </div>
        </div>
    )
}

export default Chapters
