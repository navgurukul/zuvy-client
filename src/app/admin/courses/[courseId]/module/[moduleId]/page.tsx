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

type Chapter = {
    chapterId: number
    chapterTitle: string
    order: number
    topicId: number
    topicName: string
}

function Page({
    params,
}: {
    params: { viewcourses: string; moduleId: string }
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
    const fetchChapters = async () => {
        const response = await api.get(
            `/Content/allChaptersOfModule/${params.moduleId}`
        )

        setChapterData(response.data.chapterWithTopic)
        setAssessmentData(response.data.assessment)
        setModuleName(response.data.moduleName)
    }

    const fetchChapterContent = async (chapterId: number) => {
        const response = await api.get(
            `/Content/chapterDetailsById/${chapterId}`
        )
        setChapterContent(response.data.quizQuestionDetails)
        setTopicId(response.data.topicId)
        setActiveChapter(chapterId)
    }

    const renderChapterContent = () => {
        switch (topicId) {
            case 1:
                return <VideoComponent content={chapterContent} />
            case 2:
                return <Article content={chapterContent} />
            case 3:
                return <CodeChallenge content={chapterContent} />
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
            <div className="grid  grid-cols-4 mt-5">
                <div className="col-span-1 overflow-y-auto">
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
                                            activeChapter={activeChapter}
                                        />
                                    )
                                }
                            )}
                    </div>
                    <div className="mt-5">
                        <Button
                            variant="secondary"
                            className="py-2 px-2 h-full w-full"
                            onClick={handleAddChapter}
                        >
                            Add Chapter
                        </Button>
                    </div>
                </div>
                <Separator
                    orientation="vertical"
                    className="mx-4 w-1 rounded"
                />
                <div className="">{renderChapterContent()}</div>

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
                                <span>Video</span>
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
