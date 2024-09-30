'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { api } from '@/utils/axios.config'
import { useParams } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Reorder } from 'framer-motion'
import ChapterItem from '@/app/admin/courses/[courseId]/module/_components/ChapterItem'
import { toast } from '@/components/ui/use-toast'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ChapterModal from '@/app/admin/courses/[courseId]/module/_components/ChapterModal'
import AddVideo from '@/app/admin/courses/[courseId]/module/_components/video/AddVideo'
import AddArticle from '@/app/admin/courses/[courseId]/module/_components/Article/AddArticle'
import CodingChallenge from '@/app/admin/courses/[courseId]/module/_components/codingChallenge/CodingChallenge'
import Quiz from '@/app/admin/courses/[courseId]/module/_components/quiz/Quiz'
import Assignment from '@/app/admin/courses/[courseId]/module/_components/assignment/Assignment'
import AddAssessment from '@/app/admin/courses/[courseId]/module/_components/Assessment/AddAssessment'
import AddForm from '@/app/admin/courses/[courseId]/module/_components/form/AddForm'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import {
    getChapterContentState,
    getChapterDataState,
    getCurrentChapterState,
    getTopicId,
    getCurrentModuleName,
    getScrollPosition,
} from '@/store/store'

// import { getChapterDataState } from '@/store/store'

interface Module {
    chapterId: number
    topicName: string
    chapterTitle: string
    topicId: number
    // include other properties as needed
}

type Chapter = {
    chapterId: number
    chapterTitle: string
    topicId: number
    topicName: string
    order: number
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

function Chapter() {
    const { courseId, moduleId, chapterID } = useParams()
    const chapter_id = Array.isArray(chapterID)
        ? Number(chapterID[0])
        : Number(chapterID)
    const moduleID = Array.isArray(moduleId) ? moduleId[0] : moduleId
    const { chapterData, setChapterData } = getChapterDataState()
    // const [chapterData, setChapterData] = useState([
    //     {
    //         chapterId: 276,
    //         chapterTitle: 'Assessment for module number 115',
    //         topicId: 6,
    //         topicName: 'Assessment',
    //         order: 1,
    //     },
    //     {
    //         chapterId: 578,
    //         chapterTitle: 'Chapter 2',
    //         topicId: 1,
    //         topicName: 'Video',
    //         order: 2,
    //     },
    //     {
    //         chapterId: 579,
    //         chapterTitle: 'Chapter 3',
    //         topicId: 1,
    //         topicName: 'Video',
    //         order: 3,
    //     },
    //     {
    //         chapterId: 580,
    //         chapterTitle: 'Chapter 4',
    //         topicId: 1,
    //         topicName: 'Video',
    //         order: 4,
    //     },
    //     {
    //         chapterId: 581,
    //         chapterTitle: 'Chapter 5',
    //         topicId: 2,
    //         topicName: 'Article',
    //         order: 5,
    //     },
    //     {
    //         chapterId: 582,
    //         chapterTitle: 'Chapter 6',
    //         topicId: 3,
    //         topicName: 'Coding Question',
    //         order: 6,
    //     },
    //     {
    //         chapterId: 583,
    //         chapterTitle: 'Chapter 7',
    //         topicId: 5,
    //         topicName: 'Assignment',
    //         order: 7,
    //     },
    //     {
    //         chapterId: 584,
    //         chapterTitle: 'Chapter 8',
    //         topicId: 6,
    //         topicName: 'Assessment',
    //         order: 8,
    //     },
    //     {
    //         chapterId: 585,
    //         chapterTitle: 'Chapter 9',
    //         topicId: 7,
    //         topicName: 'Form',
    //         order: 9,
    //     },
    //     {
    //         chapterId: 586,
    //         chapterTitle: 'Chapter 10',
    //         topicId: 5,
    //         topicName: 'Assignment',
    //         order: 10,
    //     },
    //     {
    //         chapterId: 587,
    //         chapterTitle: 'Chapter 11',
    //         topicId: 4,
    //         topicName: 'Quiz',
    //         order: 11,
    //     },
    //     {
    //         chapterId: 588,
    //         chapterTitle: 'Chapter 12',
    //         topicId: 1,
    //         topicName: 'Video',
    //         order: 12,
    //     },
    //     {
    //         chapterId: 589,
    //         chapterTitle: 'Chapter 13',
    //         topicId: 7,
    //         topicName: 'Form',
    //         order: 13,
    //     },
    //     {
    //         chapterId: 590,
    //         chapterTitle: 'Chapter 14',
    //         topicId: 5,
    //         topicName: 'Assignment',
    //         order: 14,
    //     },
    //     {
    //         chapterId: 591,
    //         chapterTitle: 'Chapter 15',
    //         topicId: 1,
    //         topicName: 'Video',
    //         order: 15,
    //     },
    //     {
    //         chapterId: 592,
    //         chapterTitle: 'Chapter 16',
    //         topicId: 7,
    //         topicName: 'Form',
    //         order: 16,
    //     },
    //     {
    //         chapterId: 593,
    //         chapterTitle: 'Chapter 17',
    //         topicId: 7,
    //         topicName: 'Form',
    //         order: 17,
    //     },
    //     {
    //         chapterId: 594,
    //         chapterTitle: 'Chapter 18',
    //         topicId: 4,
    //         topicName: 'Quiz',
    //         order: 18,
    //     },
    //     {
    //         chapterId: 595,
    //         chapterTitle: 'Chapter 19',
    //         topicId: 2,
    //         topicName: 'Article',
    //         order: 19,
    //     },
    //     {
    //         chapterId: 596,
    //         chapterTitle: 'Chapter 20',
    //         topicId: 5,
    //         topicName: 'Assignment',
    //         order: 20,
    //     },
    // ])
    // const [chapterData, setChapterData] = useState([])
    const [chapterContent, setChapterContent] = useState<any>([])
    const [chapterId, setChapterId] = useState<number>(0)
    const [activeChapterTitle, setActiveChapterTitle] = useState('')
    const [currentChapter, setCurrentChapter] = useState<Chapter[]>([])
    const [moduleData, setModuleData] = useState<Module[]>([])
    // const [moduleName, setModuleName] = useState('')
    const [activeChapter, setActiveChapter] = useState(chapter_id)
    // const [topicId, setTopicId] = useState(1)
    const { topicId, setTopicId } = getTopicId()
    const moduleName = getCurrentModuleName((state) => state.moduleName)
    const setModuleName = getCurrentModuleName((state) => state.setModuleName)
    const [key, setKey] = useState(0)
    const [open, setOpen] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement | null>(null)
    const activeChapterRef = useRef<HTMLDivElement | null>(null)
    const [isNewChapterCreated, setIsNewChapterCreated] = useState(false)
    const [isChapterClicked, setIsChapterClicked] = useState(false)
    const isChapterClickedRef = useRef(false)
    const [initialLoad, setInitialLoad] = useState(true)

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

    console.log('chapterData', chapterData)
    const fetchChapters = useCallback(async () => {
        try {
            const response = await api.get(
                `/Content/allChaptersOfModule/${moduleId}`
            )
            // console.log('response', response)
            const currentChapter = response.data.chapterWithTopic.find(
                (item: any) => item.chapterId === chapter_id
            )
            // console.log('currentChapter', currentChapter)
            // setCurrentChapter(currentChapter)
            setChapterData(response.data.chapterWithTopic)
            setModuleName(response.data.moduleName)
            setModuleData(response.data.chapterWithTopic)
        } catch (error) {
            console.error('Error fetching chapters:', error)
            // Handle error as needed
        }
    }, [moduleId, chapter_id])

    const fetchChapterContent = useCallback(
        async (chapterId: number, topicId: number) => {
            // let topicId = moduleData.find(
            //     (myModule: any) => myModule.chapterId === chapterId
            // )?.topicId
            try {
                const response = await api.get(
                    `Content/chapterDetailsById/${chapterId}?bootcampId=${courseId}&moduleId=${moduleId}&topicId=${topicId}`
                )
                setChapterId(chapterId)
                const currentModule: any = moduleData.find(
                    (myModule: any) => myModule.chapterId === chapterId
                )

                if (currentModule) {
                    setActiveChapterTitle(currentModule?.chapterTitle)
                    setCurrentChapter(currentModule)
                }

                if (currentModule?.topicName === 'Quiz') {
                    setChapterContent(
                        response.data
                            .quizQuestionDetails as QuizQuestionDetails[]
                    )
                } else if (currentModule?.topicName === 'Coding Question') {
                    setChapterContent(response.data)
                } else if (currentModule?.topicName === 'Form') {
                    setChapterContent(response.data)
                } else {
                    setChapterContent(response.data)
                }

                setTopicId(currentModule?.topicId)
                // setTopicId(topicId)
                // setTopicId(response.data.topicId)

                setActiveChapter(chapterId)
                setKey((prevKey: any) => prevKey + 1)
            } catch (error) {
                console.error('Error fetching chapter content:', error)
            }
        },
        [moduleData, courseId, moduleId]
    )

    useEffect(() => {
        // fetchCourseModules()
        if (moduleId) {
            fetchChapters()
        }
    }, [courseId, moduleId, fetchChapters])

    useEffect(() => {
        if (chapterData.length > 0) {
            // const firstChapterId = chapterData[0].chapterId
            fetchChapterContent(chapter_id, topicId)
        } else {
            setActiveChapter(0)
            setChapterContent([])
            setActiveChapterTitle('')
            setTopicId(0)
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
        if (!movedItem) return
        try {
            const response = await api.put(
                `/Content/editChapterOfModule/${moduleId}?chapterId=${movedItem.chapterId}`,
                { newOrder: movedItem.order }
            )
            toast({
                title: 'Success',
                description: 'Content Edited Successfully',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
            if (response.data) {
                setChapterData(newOrderChapters)
            }
        } catch (error: any) {
            toast({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    const handleAddChapter = () => {
        setOpen(true)
    }

    const scrollToBottom = () => {
        const lastChapterElement = document.getElementById('last-chapter')
        if (lastChapterElement) {
            lastChapterElement.scrollIntoView({ behavior: 'smooth' })
        }
    }

    useEffect(() => {
        console.log('isChapterClickedRef.current', isChapterClickedRef.current)
        console.log('activeChapterRef.current', activeChapterRef.current)
        console.log('scrollAreaRef.current', scrollAreaRef.current)
        if (
            !isChapterClickedRef.current &&
            activeChapterRef.current &&
            scrollAreaRef.current
        ) {
            console.log('went inside', isChapterClickedRef.current)
            // Only scroll if it's not triggered by a chapter click
            activeChapterRef.current.scrollIntoView({
                behavior: 'smooth',
                // block: 'center'
                // behavior: 'auto',
                // block: 'center',
            })
        }
        setInitialLoad(false)
    }, [activeChapter, initialLoad]) // Adding 'isChapterClicked' to dependencies

    // Reset the isChapterClicked state after some delay
    useEffect(() => {
        if (isChapterClicked) {
            const timer = setTimeout(() => {
                isChapterClickedRef.current = false
            }, 300)
            return () => clearTimeout(timer) // Clean up the timer
        }
    }, [activeChapter])

    useEffect(() => {
        if (isNewChapterCreated && scrollAreaRef.current) {
            const scrollableElement = scrollAreaRef.current
            scrollableElement.scrollTop = scrollableElement.scrollHeight // Scroll to the bottom
            setIsNewChapterCreated(false) // Reset the new chapter flag
        }
    }, [chapterData, isNewChapterCreated])

    // const handleChapterClick = (chapterId: any) => {
    //     // Append the hash to the URL when clicking on a chapter
    //     if (typeof window !== 'undefined') {
    //         window.location.hash = `#chapter-${chapterId}`
    //     }
    // }

    // const renderChapterContent = () => {
    //     console.log('topicId', topicId)
    //     switch (topicId) {
    //         case 1:
    //             return (
    //                 <AddVideo
    //                     key={chapterId}
    //                     moduleId={moduleID}
    //                     content={chapterContent}
    //                     fetchChapterContent={fetchChapterContent}
    //                 />
    //             )
    //         case 2:
    //             return <AddArticle key={chapterId} content={chapterContent} />
    //         case 3:
    //             return (
    //                 <CodingChallenge
    //                     key={chapterId}
    //                     moduleId={moduleID}
    //                     content={chapterContent}
    //                     activeChapterTitle={activeChapterTitle}
    //                 />
    //             )
    //         case 4:
    //             return (
    //                 <Quiz
    //                     key={chapterId}
    //                     chapterId={chapterId}
    //                     moduleId={moduleID}
    //                     content={chapterContent}
    //                 />
    //             )
    //         case 5:
    //             return <Assignment key={chapterId} content={chapterContent} />
    //         case 6:
    //             return (
    //                 <AddAssessment
    //                     key={chapterId}
    //                     chapterData={currentChapter}
    //                     content={chapterContent}
    //                     fetchChapterContent={fetchChapterContent}
    //                     topicId={topicId}
    //                     moduleId={moduleID}
    //                 />
    //             )
    //         case 7:
    //             return (
    //                 <AddForm
    //                     key={chapterId}
    //                     chapterData={currentChapter}
    //                     content={chapterContent}
    //                     // fetchChapterContent={fetchChapterContent}
    //                     moduleId={moduleID}
    //                 />
    //             )
    //         default:
    //             return <h1>Create New Chapter</h1>
    //     }
    // }

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            {/* <div className="grid grid-cols-4 mt-5">
                <div className="col-span-1"> */}
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
                        // params={params}
                        courseId={courseId}
                        moduleId={moduleId}
                        fetchChapters={fetchChapters}
                        newChapterOrder={chapterData.length}
                        scrollToBottom={scrollToBottom}
                    />
                </Dialog>
            </div>
            {/* <ScrollArea className="h-dvh pr-4" type="hover"> */}
            <ScrollArea
                className="h-[500px] lg:h-[670px] pr-4"
                type="hover"
                ref={scrollAreaRef}
            >
                <Reorder.Group
                    values={chapterData}
                    onReorder={async (newOrderChapters: any) => {
                        handleReorder(newOrderChapters)
                    }}
                >
                    {chapterData &&
                        chapterData?.map((item: any, index: any) => {
                            const isLastItem = index === chapterData.length - 1
                            return (
                                <Reorder.Item
                                    value={item}
                                    key={item.chapterId}
                                    id={
                                        isLastItem
                                            ? 'last-chapter'
                                            : `chapter-${item.chapterId}`
                                    }
                                    // onClick={() =>
                                    //     handleChapterClick(item.chapterId)
                                    // }
                                >
                                    <div
                                        ref={
                                            item.chapterId === activeChapter
                                                ? activeChapterRef
                                                : null
                                        } // Set ref to active chapter
                                    >
                                        <ChapterItem
                                            key={item.chapterId}
                                            chapterId={item.chapterId}
                                            title={item.chapterTitle}
                                            topicId={item.topicId}
                                            topicName={item.topicName}
                                            // fetchChapterContent={
                                            //     fetchChapterContent
                                            // }
                                            // fetchChapters={fetchChapters}
                                            setActiveChapter={setActiveChapter}
                                            activeChapter={activeChapter}
                                            moduleId={moduleID}
                                            isChapterClickedRef={
                                                isChapterClickedRef
                                            }
                                            // handleChapterClick={handleChapterClick}
                                        />
                                    </div>
                                </Reorder.Item>
                            )
                        })}
                </Reorder.Group>
            </ScrollArea>
            {/* </div>
                <div className="col-span-3 mx-4">{renderChapterContent()}</div>
            </div> */}
        </>
    )
}

export default Chapter
