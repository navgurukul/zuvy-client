'use client'

import { useCallback, useEffect, useState } from 'react'

import ChapterItem from '../../_components/ChapterItem'
import CodeChallenge from '../_components/CodeChallenge'
import Quiz from '../_components/quiz/Quiz'
import Assignment from '../_components/Assignment'
import { useParams } from 'next/navigation'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import AddVideo from '../_components/AddVideo'
import ChapterModal from '../_components/ChapterModal'
import { ScrollArea } from '@/components/ui/scroll-area'
import AddQuiz from '../_components/AddQuiz'
import Article from '../_components/Article'

// Interfaces:-
type Chapter = {
    chapterId: number
    chapterTitle: string
    order: number
    topicId: number
    topicName: string
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
    const [chapterContent, setChapterContent] = useState({})
    const [topicId, setTopicId] = useState(0)
    const { courseId } = useParams()

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
    // functions:-
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

                if (currentModule?.topicName === 'Quiz') {
                    setChapterContent(
                        response.data
                            .quizQuestionDetails as QuizQuestionDetails[]
                    )
                } else if (currentModule?.topicName === 'Coding Question') {
                    setChapterContent(
                        response.data
                            .codingQuestionDetails as CodingQuestionDetails[]
                    )
                }

                setTopicId(response.data.topicId)
                setActiveChapter(chapterId)
            } catch (error) {
                console.error('Error fetching chapter content:', error)
            }
        },
        [moduleData]
    )

    const AddVideoChapTerHandler = () => {}

    const renderChapterContent = () => {
        switch (topicId) {
            case 1:
                return (
                    <AddVideo
                        moduleId={params.moduleId}
                        content={chapterContent}
                    />
                )
            case 2:
                return <Article content={chapterContent} />
            case 3:
                return <CodeChallenge content={[chapterContent]} />
            case 4:
                return <Quiz content={chapterContent} />
            case 5:
                return <Assignment content={chapterContent} />
            default:
                return <h1>StickyNote</h1>
        }
    }

    const handleAddChapter = () => {
        setOpen(true)
    }

    // async
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

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            <div className="grid  grid-cols-4 mt-5">
                <div className=" col-span-1">
                    <div className="mb-5 flex">
                        <Button
                            variant="secondary"
                            className="py-2 px-2 h-full w-full"
                            onClick={handleAddChapter}
                        >
                            Add Chapter
                        </Button>
                    </div>
                    <ScrollArea className="h-dvh pr-4">
                        {chapterData &&
                            chapterData?.map(
                                ({
                                    chapterId,
                                    chapterTitle,
                                    topicId,
                                    topicName,
                                }) => {
                                    return (
                                        <ChapterItem
                                            key={chapterId}
                                            chapterId={chapterId}
                                            title={chapterTitle}
                                            topicId={topicId}
                                            topicName={topicName}
                                            fetchChapterContent={
                                                fetchChapterContent
                                            }
                                            activeChapter={activeChapter}
                                        />
                                    )
                                }
                            )}
                    </ScrollArea>
                </div>
                <div className="col-span-3 mx-4">{renderChapterContent()}</div>

                <ChapterModal open={open} setOpen={setOpen} params={params} />
            </div>
        </>
    )
}

export default Page
