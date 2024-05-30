'use client'

import ChapterItem from '@/app/admin/courses/[courseId]/module/_components/ChapterItem'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLazyLoadedStudentData } from '@/store/store'
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

function Page({ params }: { params: { moduleID: string } }) {
    // misc
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const { viewcourses } = useParams()

    // state and variables
    const [chapters, setChapters] = useState([])
    const [activeChapter, setActiveChapter] = useState(0)
    const [topicId, setTopicId] = useState(0)
    const [moduleName, setModuleName] = useState('')

    const crumbs = [
        {
            crumb: 'Courses',
            href: '/student/courses',
            isLast: false,
        },
        {
            crumb: 'Curriculum',
            href: `/student/courses/${viewcourses}`,
            isLast: false,
        },
        {
            crumb: moduleName,
            isLast: true,
        },
    ]

    // func
    const fetchChapters = async () => {
        try {
            const response = await api.get(
                `tracking/getAllChaptersWithStatus/${params.moduleID}?userId=${userID}`
            )
            setChapters(response.data.trackingData)
            setModuleName(response.data.moduleDetails[0].name)
        } catch (error) {
            console.log(error)
        }
    }

    const fetchChapterContent = useCallback(
        async (chapterId: number) => {
            try {
                const response = await api.get(
                    `/Content/chapterDetailsById/${chapterId}`
                )
                setActiveChapter(chapterId)
                setTopicId(response.data.topicId)
            } catch (error) {
                console.error('Error fetching chapter content:', error)
            }
        },
        [chapters]
    )

    const renderChapterContent = () => {
        switch (topicId) {
            case 1:
                return <Video />
            case 2:
                return <Article />
            case 3:
                return <CodingChallenge />
            case 4:
                return <Quiz />
            case 5:
                return <Assignment />
            // default:
            //     return <h1>Create New Chapter</h1>
        }
    }

    // async
    useEffect(() => {
        if (userID) {
            fetchChapters()
        }
    }, [userID])

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
