'use client'

import React, { useEffect, useState } from 'react'
import {
    Calculator,
    Calendar,
    Code,
    CreditCard,
    FileQuestion,
    PencilLine,
    ScrollText,
    Video,
    User,
    BookOpenCheck,
    Newspaper,
} from 'lucide-react'

import ChapterItem from '../../_components/ChapterItem'
import VideoComponent from '../_components/Video'
import Article from '../_components/Article'
import CodeChallenge from '../_components/CodeChallenge'
import Quiz from '../_components/Quiz'
import Assignment from '../_components/Assignment'
import { useParams } from 'next/navigation'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command'
import { api } from '@/utils/axios.config'
import Link from 'next/link'
import AddVideo from '../_components/AddVideo'

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
    const [videoState, setVideoState] = useState<boolean>(false)
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
    const fetchChapters = async () => {
        const response = await api.get(
            `/Content/allChaptersOfModule/${params.moduleId}`
        )

        setChapterData(response.data.chapterWithTopic)
        setAssessmentData(response.data.assessment)
        setModuleName(response.data.moduleName)
        setModuleData(response.data.chapterWithTopic)
    }

    const fetchChapterContent = async (chapterId: number) => {
        const response = await api.get(
            `/Content/chapterDetailsById/${chapterId}`
        )
        const currentModule = moduleData.find(
            (module: any) => module.chapterId == chapterId
        )

        if (currentModule?.topicName == 'Quiz') {
            setChapterContent(
                response.data.quizQuestionDetails as QuizQuestionDetails[]
            )
        } else if (currentModule?.topicName == 'Coding Question') {
            setChapterContent(
                response.data.codingQuestionDetails as CodingQuestionDetails[]
            )
        }

        setTopicId(response.data.topicId)
        setActiveChapter(chapterId)
    }

    const renderChapterContent = () => {
        if (videoState) {
            return <AddVideo moduleId={params.moduleId} />
        }
        switch (topicId) {
            case 1:
                return <VideoComponent content={chapterContent} />
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
    }, [params])

    useEffect(() => {
        if (chapterData.length > 0) {
            const firstChapterId = chapterData[0].chapterId
            fetchChapterContent(firstChapterId)
        }
    }, [chapterData])

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            <div className="grid  grid-cols-7 mt-5">
                <div className="col-span-2 overflow-y-auto">
                    <div>
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
                                            setVideoState={setVideoState}
                                            activeChapter={activeChapter}
                                        />
                                    )
                                }
                            )}
                    </div>
                    <div className="mt-5 flex">
                        <Button
                            variant="secondary"
                            className="py-2 px-2 h-full w-full"
                            onClick={handleAddChapter}
                        >
                            Add Chapter
                        </Button>
                    </div>
                </div>
                <div className="col-span-5 mx-4">{renderChapterContent()}</div>

                <CommandDialog open={open} onOpenChange={setOpen}>
                    <CommandInput placeholder="Type a command or search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Chapters">
                            <CommandItem>
                                <ScrollText className="mr-2 h-4 w-4" />
                                <span>Article</span>
                            </CommandItem>
                            <CommandItem>
                                <Video className="mr-2 h-4 w-4" />
                                <span onClick={() => setVideoState(true)}>
                                    Video
                                </span>
                            </CommandItem>
                            <CommandItem>
                                <FileQuestion className="mr-2 h-4 w-4" />
                                <span>Quiz</span>
                            </CommandItem>
                            <CommandItem>
                                <PencilLine className="mr-2 h-4 w-4" />
                                <span>Assignment</span>
                            </CommandItem>
                            <CommandItem>
                                <Code className="mr-2 h-4 w-4" />
                                <span>Coding Problem</span>
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                            <CommandItem>
                                <BookOpenCheck className="mr-2 h-4 w-4" />
                                <span>Assessment</span>
                                {/* <CommandShortcut>⌘P</CommandShortcut> */}
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                            <CommandItem>
                                <Newspaper className="mr-2 h-4 w-4" />
                                <span>Form</span>
                                {/* <CommandShortcut>⌘B</CommandShortcut> */}
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </CommandDialog>
            </div>
        </>
    )
}

export default Page
