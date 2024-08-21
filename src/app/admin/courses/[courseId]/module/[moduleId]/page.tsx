'use client'

import { useCallback, useEffect, useState } from 'react'
import ChapterItem from '@/app/admin/courses/[courseId]/module/_components/ChapterItem'
import Quiz from '@/app/admin/courses/[courseId]/module/_components/quiz/Quiz'
import Assignment from '@/app/admin/courses/[courseId]/module/_components/assignment/Assignment'
import { useParams } from 'next/navigation'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import AddVideo from '@/app/admin/courses/[courseId]/module/_components/video/AddVideo'
import ChapterModal from '@/app/admin/courses/[courseId]/module/_components/ChapterModal'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import AddArticle from '@/app/admin/courses/[courseId]/module/_components/Article/AddArticle'
import CodingChallenge from '@/app/admin/courses/[courseId]/module/_components/codingChallenge/CodingChallenge'
import { Reorder } from 'framer-motion'
import { useEditor } from '@tiptap/react'
import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import TiptapToolbar from '@/app/_components/editor/TiptapToolbar'
import extensions from '@/app/_components/editor/TiptapExtensions'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '@/components/ui/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    format,
    addDays,
    setHours,
    setMinutes,
    setSeconds,
    setMilliseconds,
} from 'date-fns'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import AddAssessment from '@/app/admin/courses/[courseId]/module/_components/Assessment/AddAssessment'
import AddForm from '../_components/form/AddForm'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'

// Interfaces:-
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
interface Module {
    chapterId: number
    topicName: string
    chapterTitle: string
    topicId: number
    // include other properties as needed
}
interface Project {
    id: number
    title: string | null
    instruction: string | null
    isLock: boolean
    deadline: string | null
}
interface ProjectData {
    status: string
    code: number
    project: Project[]
    bootcampId: number
    moduleId: number
}

function Page({ params }: { params: { moduleId: any; courseId: any } }) {
    // states and variables
    const [open, setOpen] = useState(false)
    const [chapterData, setChapterData] = useState<Chapter[]>([])
    const [currentChapter, setCurrentChapter] = useState<Chapter[]>([])
    const [moduleName, setModuleName] = useState('')
    const [activeChapter, setActiveChapter] = useState(0)
    const [chapterContent, setChapterContent] = useState<any>([])
    const [topicId, setTopicId] = useState(1)
    const [chapterId, setChapterId] = useState<number>(0)
    const [key, setKey] = useState(0)
    const { courseId, moduleId } = useParams()
    const [activeChapterTitle, setActiveChapterTitle] = useState('')
    const [curriculum, setCurriculum] = useState([])
    const editor = useEditor({
        extensions,
    })
    const [projectId, setProjectId] = useState(null)
    const [projectData, setProjectData] = useState<ProjectData>()
    const [moduleData, setModuleData] = useState<Module[]>([])
    const [title, setTitle] = useState('')

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

    const formSchema = z.object({
        title: z.string().min(2, {
            message: 'Title must be at least 2 characters.',
        }),
        startDate: z.date({
            required_error: 'A start date is required.',
        }),
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        values: {
            title: title,
            startDate: setHours(
                setMinutes(setSeconds(setMilliseconds(new Date(), 0), 0), 0),
                0
            ),
        },
        mode: 'onChange',
    })

    // func

    const fetchCourseModules = async () => {
        try {
            const response = await api.get(`/content/allModules/${courseId}`)
            setCurriculum(response.data)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchProjectDetails = async () => {
        try {
            const response = await api.get(
                `Content/project/${projectId}?bootcampId=${courseId}`
            )
            setProjectData(response.data)
            setTitle(response.data.project[0].title)
            const projectDescription =
                response.data.project[0].instruction.description
            editor?.commands.setContent(projectDescription)
        } catch (error) {
            console.error(error)
        }
    }

    async function editProject(data: any) {
        function convertToISO(dateString: string): string {
            const date = new Date(dateString)

            if (isNaN(date.getTime())) {
                throw new Error('Invalid date string')
            }

            date.setDate(date.getDate() + 1)

            const isoString = date.toISOString()

            return isoString
        }
        const deadlineDate = convertToISO(data.startDate)

        try {
            const projectContent = [editor?.getJSON()]
            await api.patch(`/Content/updateProjects/${projectId}`, {
                title,
                instruction: { description: projectContent },
                isLock: projectData?.project[0].isLock,
                deadline: deadlineDate,
            })
            toast({
                title: 'Success',
                description: 'Project Edited Successfully',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
        } catch (error: any) {
            toast({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                variant: 'destructive',
            })
        }
    }

    const fetchChapters = useCallback(async () => {
        try {
            const response = await api.get(
                `/Content/allChaptersOfModule/${moduleId}`
            )

            setChapterData(response.data.chapterWithTopic)
            setModuleName(response.data.moduleName)
            setModuleData(response.data.chapterWithTopic)
        } catch (error) {
            console.error('Error fetching chapters:', error)
            // Handle error as needed
        }
    }, [moduleId])

    const fetchChapterContent = useCallback(
        async (chapterId: number) => {
            let topicId = moduleData.find(
                (myModule: any) => myModule.chapterId === chapterId
            )?.topicId
            try {
                const response = await api.get(
                    `Content/chapterDetailsById/${chapterId}?bootcampId=${params.courseId}&moduleId=${params.moduleId}&topicId=${topicId}`
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

                // setTopicId(response.data.topicId)

                setActiveChapter(chapterId)
                setKey((prevKey) => prevKey + 1)
            } catch (error) {
                console.error('Error fetching chapter content:', error)
            }
        },
        [moduleData, params.courseId, params.moduleId]
    )

    const renderChapterContent = () => {

        switch (topicId) {
            case 1:
                return (
                    <AddVideo
                        key={chapterId}
                        moduleId={params.moduleId}
                        content={chapterContent}
                        fetchChapterContent={fetchChapterContent}
                    />
                )
            case 2:
                return <AddArticle key={chapterId} content={chapterContent} />
            case 3:
                return (
                    <CodingChallenge
                        key={chapterId}
                        moduleId={params.moduleId}
                        content={chapterContent}
                        activeChapterTitle={activeChapterTitle}
                    />
                )
            case 4:
                return (
                    <Quiz
                        key={chapterId}
                        chapterId={chapterId}
                        moduleId={params.moduleId}
                        content={chapterContent}
                    />
                )
            case 5:
                return <Assignment key={chapterId} content={chapterContent} />
            case 6:
                return (
                    <AddAssessment
                        key={chapterId}
                        chapterData={currentChapter}
                        content={chapterContent}
                        fetchChapterContent={fetchChapterContent}
                        moduleId={params.moduleId}
                    />
                )
            case 7:
                return (
                    <AddForm
                        key={chapterId}
                        chapterData={currentChapter}
                        content={chapterContent}
                        fetchChapterContent={fetchChapterContent}
                        moduleId={params.moduleId}
                    />
                )
            default:
                return <h1>Create New Chapter</h1>
        }
    }

    const handleAddChapter = () => {
        setOpen(true)
    }

    useEffect(() => {
        fetchCourseModules()
        if (params.moduleId) {
            fetchChapters()
        }
    }, [params, fetchChapters])

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails()
        }
    }, [projectId])

    useEffect(() => {
        const myModule: any = curriculum.find(
            (item: any) => item?.id == moduleId
        )
        const id = myModule?.projectId
        setProjectId(id)
    }, [curriculum, moduleId])

    useEffect(() => {
        if (chapterData.length > 0) {
            const firstChapterId = chapterData[0].chapterId
            fetchChapterContent(firstChapterId)
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
                `/Content/editChapterOfModule/${params.moduleId}?chapterId=${movedItem.chapterId}`,
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

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            {!projectId ? (
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
                                    newChapterOrder={chapterData.length}
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
                                    chapterData?.map(
                                        (item: any, index: any) => {
                                            return (
                                                <Reorder.Item
                                                    value={item}
                                                    key={item.chapterId}
                                                >
                                                    <ChapterItem
                                                        key={item.chapterId}
                                                        chapterId={
                                                            item.chapterId
                                                        }
                                                        title={
                                                            item.chapterTitle
                                                        }
                                                        topicId={item.topicId}
                                                        topicName={
                                                            item.topicName
                                                        }
                                                        fetchChapterContent={
                                                            fetchChapterContent
                                                        }
                                                        fetchChapters={
                                                            fetchChapters
                                                        }
                                                        activeChapter={
                                                            activeChapter
                                                        }
                                                        moduleId={
                                                            params.moduleId
                                                        }
                                                    />
                                                </Reorder.Item>
                                            )
                                        }
                                    )}
                            </Reorder.Group>
                        </ScrollArea>
                    </div>
                    <div className="col-span-3 mx-4">
                        {renderChapterContent()}
                        {/* <AddForm
                            chapterData={currentChapter}
                            content={chapterContent}
                            fetchChapterContent={fetchChapterContent}
                            moduleId={params.moduleId}
                        /> */}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col mt-5">
                    <div className="w-full ">
                        <Form {...form}>
                            <form
                                id="myForm"
                                onSubmit={form.handleSubmit(editProject)}
                                className="space-y-8 mb-10"
                            >
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel></FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Untitled Article"
                                                    className="p-0 text-3xl w-2/5 text-left font-semibold outline-none border-none focus:ring-0 capitalize"
                                                    {...field}
                                                    {...form.register('title')}
                                                    onChange={(e) =>
                                                        setTitle(e.target.value)
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage className="h-5" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col justify-start gap-x-2 text-left">
                                            <FormLabel className="m-0">
                                                <span className="text-xl">
                                                    Choose Deadline Date
                                                </span>
                                                <span className="text-red-500">
                                                    *
                                                </span>{' '}
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={'outline'}
                                                            className={`w-[230px]  text-left font-normal ${
                                                                !field.value &&
                                                                'text-muted-foreground'
                                                            }`}
                                                        >
                                                            {field.value
                                                                ? format(
                                                                      field.value,
                                                                      'EEEE, MMMM d, yyyy'
                                                                  )
                                                                : 'Pick a date'}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={
                                                            field.onChange
                                                        }
                                                        disabled={(date: any) =>
                                                            date <=
                                                            addDays(
                                                                new Date(),
                                                                -1
                                                            )
                                                        } // Disable past dates
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </div>
                    <div className="text-left">
                        <TiptapToolbar editor={editor} />
                        <TiptapEditor editor={editor} />
                    </div>
                    <div className="flex justify-end mt-5">
                        <Button type="submit" form="myForm">
                            Save
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}

export default Page
