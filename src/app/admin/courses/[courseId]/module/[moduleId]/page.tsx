'use client'

import { useCallback, useEffect, useState } from 'react'
import ChapterItem from '../_components/ChapterItem'
import Quiz from '../_components/quiz/Quiz'
import Assignment from '../_components/assignment/Assignment'
import { useParams } from 'next/navigation'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import AddVideo from '../_components/video/AddVideo'
import ChapterModal from '../_components/ChapterModal'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import AddArticle from '../_components/Article/AddArticle'
import CodingChallenge from '../_components/codingChallenge/CodingChallenge'
import AssessmentItem from '../_components/AssessmentItem'
import { Reorder } from 'framer-motion'

// Interfaces:-
type Chapter = {
    chapterId: number
    chapterTitle: string
    topicId: number
    topicName: string
    order: number
}

interface ExampleTestCase {
    input: number[]
    output: number[]
}

interface CodingQuestionDetails {
    id: number
    title: string
    description: string
    difficulty: string
    tags: number
    constraints: string
    authorId: number
    inputBase64: null | string
    examples: ExampleTestCase[]
    testCases: ExampleTestCase[]
    expectedOutput: number[]
    solution: string
    createdAt: string
    updatedAt: string
}

interface QuizOptions {
    option1: string
    option2: string
    option3: string
    option4: string
}

interface QuizQuestionDetails {
    id: number
    question: string
    options: QuizOptions
    correctOption: string
    marks: null | number
    difficulty: string
    tagId: number
}

interface Module {
    chapterId: number
    topicName: string
    chapterTitle: string
    // include other properties as needed
}

function Page({
    params,
}: {
    params: { viewcourses: string; moduleId: string; courseId: string }
}) {
    // states and variables
    const [open, setOpen] = useState(false)
    const [chapterData, setChapterData] = useState<Chapter[]>([])
    const [assessmentData, setAssessmentData] = useState<Chapter[]>([])
    const [moduleName, setModuleName] = useState('')
    const [activeChapter, setActiveChapter] = useState(0)
    const [chapterContent, setChapterContent] = useState<any>([])
    const [topicId, setTopicId] = useState(0)
    const [key, setKey] = useState(0)
    const { courseId } = useParams()
    const [activeChapterTitle, setActiveChapterTitle] = useState('')

    const [moduleData, setModuleData] = useState<Module[]>([])
    const crumbs = [
        {
            crumb: 'Courses',
            href: '/admin/courses',
            isLast: false,
        },
        {
            crumb: 'Curriculum',
            href: `/admin/courses/${courseId}/curriculum`,
            isLast: false,
        },
        {
            crumb: moduleName,
            // href: `/admin/courses/${courseId}/curriculum`,
            isLast: true,
        },
    ]

    // func
    const fetchChapters = useCallback(async () => {
        try {
            const response = await api.get(
                `/Content/allChaptersOfModule/${params.moduleId}`
            )
            setChapterData(response.data.chapterWithTopic)
            setAssessmentData(response.data.assessment)
            setModuleName(response.data.moduleName)
            setModuleData(response.data.chapterWithTopic)
        } catch (error) {
            console.error('Error fetching chapters:', error)
            // Handle error as needed
        }
    }, [params.moduleId])

    const fetchChapterContent = useCallback(
        async (chapterId: number) => {
            try {
                const response = await api.get(
                    `/Content/chapterDetailsById/${chapterId}`
                )
                const currentModule = moduleData.find(
                    (module: any) => module.chapterId === chapterId
                )
                if (currentModule) {
                    setActiveChapterTitle(currentModule?.chapterTitle)
                }

                if (currentModule?.topicName === 'Quiz') {
                    setChapterContent(
                        response.data
                            .quizQuestionDetails as QuizQuestionDetails[]
                    )
                } else if (currentModule?.topicName === 'Coding Question') {
                    setChapterContent(response.data)
                } else {
                    setChapterContent(response.data)
                }

                setTopicId(response.data.topicId)
                setActiveChapter(chapterId)
                setKey((prevKey) => prevKey + 1)
            } catch (error) {
                console.error('Error fetching chapter content:', error)
            }
        },
        [moduleData]
    )

    const renderChapterContent = () => {
        switch (topicId) {
            case 1:
                return (
                    <AddVideo
                        moduleId={params.moduleId}
                        content={chapterContent}
                        fetchChapterContent={fetchChapterContent}
                        key={key}
                    />
                )
            case 2:
                return <AddArticle content={chapterContent} />
            case 3:
                return (
                    <CodingChallenge
                        moduleId={params.moduleId}
                        content={chapterContent}
                        activeChapterTitle={activeChapterTitle}
                    />
                )
            case 4:
                return <Quiz content={chapterContent} />
            case 5:
                return <Assignment content={chapterContent} />
            default:
                return <h1>Create New Chapter</h1>
        }
    }

    const handleAddChapter = () => {
        setOpen(true)
    }

    useEffect(() => {
        if (params.moduleId) {
            fetchChapters()
        }
    }, [params, fetchChapters])

    useEffect(() => {
        if (chapterData.length > 0) {
            const firstChapterId = chapterData[0].chapterId
            fetchChapterContent(firstChapterId)
        }
    }, [chapterData, fetchChapterContent])

    async function handleReorder(newOrderChapters: any) {
        newOrderChapters = newOrderChapters.map((item: any, index: any) => ({
            ...item,
            order: index + 1,
        }))

        const oldOrder = chapterData.map((item: any) => item?.chapterId)
        const movedItem = newOrderChapters.find(
            (item: any, index: any) => item?.chapterId !== oldOrder[index]
        )

        if (!movedItem) {
            return
        }

        try {
            const response = await api.put(
                `/Content/editChapterOfModule/${params.moduleId}?chapterId=${movedItem.chapterId}`,
                {
                    newOrder: movedItem.order,
                }
            )
            if (response.data) {
                setChapterData(newOrderChapters)
            }
        } catch (error) {
            console.error('Error updating module order:', error)
        }
    }

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            <div className="grid  grid-cols-4 mt-5">
                <div className=" col-span-1">
                    <div className="mb-5 flex">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="secondary"
                                    className="py-2 px-2 h-full w-full mr-4"
                                    onClick={handleAddChapter}
                                >
                                    Add Chapter
                                </Button>
                            </DialogTrigger>
                            <DialogOverlay />
                            <ChapterModal
                                params={params}
                                fetchChapters={fetchChapters}
                            />
                        </Dialog>
                    </div>
                    <ScrollArea className="h-dvh pr-4">
                        <Reorder.Group
                            values={chapterData}
                            onReorder={async (newOrderChapters: any) => {
                                handleReorder(newOrderChapters)
                            }}
                        >
                            {chapterData &&
                                chapterData?.map((item: any, index: any) => {
                                    return (
                                        <Reorder.Item
                                            value={item}
                                            key={item.chapterId}
                                        >
                                            <ChapterItem
                                                key={item.chapterId}
                                                chapterId={item.chapterId}
                                                title={item.chapterTitle}
                                                topicId={item.topicId}
                                                topicName={item.topicName}
                                                fetchChapterContent={
                                                    fetchChapterContent
                                                }
                                                fetchChapters={fetchChapters}
                                                activeChapter={activeChapter}
                                                moduleId={params.moduleId}
                                            />
                                        </Reorder.Item>
                                    )
                                })}
                        </Reorder.Group>
                    </ScrollArea>
                </div>
                <div className="col-span-3 mx-4">{renderChapterContent()}</div>
            </div>
        </>
    )
}

export default Page
