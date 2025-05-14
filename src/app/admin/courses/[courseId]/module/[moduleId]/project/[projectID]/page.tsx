'use client'

import { useEffect, useState } from 'react'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    format,
    addDays,
    setHours,
    setMinutes,
    setSeconds,
    setMilliseconds,
} from 'date-fns'
import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import { ArrowUpRightSquare, CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import TiptapToolbar from '@/app/_components/editor/TiptapToolbar'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '@/components/ui/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEditor } from '@tiptap/react'
import extensions from '@/app/_components/editor/TiptapExtensions'
import { useParams } from 'next/navigation'
import ProjectPreview from '../_components/ProjectPreview'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getProjectPreviewStore } from '@/store/store'
// import { RemirrorTextEditor } from '@/components/RichTextEditor'
import { RemirrorJSON } from 'remirror'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'
// import { RemirrorTextEditor } from '@/components/WysiwygEditor'
// import { RichTextEditor } from '@/components/RichTextEditor'
// import RichTextEditor from '@/components/RichTextEditor'

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

export default function Project() {
    const router = useRouter()
    const { setProjectPreviewContent } = getProjectPreviewStore()
    const [showPreview, setShowPreview] = useState<boolean>(false)
    const { courseId, moduleId, projectID } = useParams()
    const [initialContent, setInitialContent] = useState<RemirrorJSON | null>(
        null
    )
    const editor = useEditor({
        extensions,
    })
    const [title, setTitle] = useState('')
    const [projectData, setProjectData] = useState<ProjectData>()

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
            crumb: title,
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

    useEffect(() => {
        console.log('editor', editor)
    }, [editor])

    const fetchProjectDetails = async () => {
        try {
            const response = await api.get(
                `Content/project/${projectID}?bootcampId=${courseId}`
            )
            setProjectData(response.data)
            setTitle(response.data.project[0].title)
            const projectDescription =
                response.data.project[0].instruction.description
            editor?.commands.setContent(projectDescription)
            const content = response.data.project[0].instruction.description
            setInitialContent(JSON.parse(content))
            console.log('response.data', response.data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (projectID) {
            fetchProjectDetails()
        }
    }, [projectID])

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
            console.log('projectContent', projectContent)
            console.log('typeof initialContent', initialContent)
            const initialContentString = initialContent
                ? JSON.stringify(initialContent)
                : ''
            console.log('initialContentString', initialContentString)
            await api.patch(`/Content/updateProjects/${projectID}`, {
                title,
                // instruction: { description: projectContent },
                instruction: { description: initialContentString },
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

    function previewProject() {
        if (projectData) {
            setProjectPreviewContent(projectData)
            router.push(
                `/admin/courses/${courseId}/module/${moduleId}/project/${projectID}/preview`
            )
        }
    }

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            <div className="flex flex-col mt-5">
                <div className="w-full ">
                    {showPreview ? (
                        <ProjectPreview
                            content={projectData}
                            setShowPreview={setShowPreview}
                        />
                    ) : (
                        <>
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
                                                {/* <FormLabel></FormLabel> */}
                                                <FormControl>
                                                    <div className="flex justify-between items-center">
                                                        <Input
                                                            placeholder="Untitled Article"
                                                            className="p-0 text-3xl w-2/5 text-left font-semibold outline-none border-none focus:ring-0 capitalize"
                                                            {...field}
                                                            {...form.register(
                                                                'title'
                                                            )}
                                                            onChange={(e) =>
                                                                setTitle(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                        <div
                                                            id="previewProject"
                                                            onClick={
                                                                previewProject
                                                            }
                                                            className="flex w-[80px] hover:bg-gray-300 rounded-md p-1 cursor-pointer"
                                                        >
                                                            <Eye size={18} />
                                                            <h6 className="ml-1 text-sm">
                                                                Preview
                                                            </h6>
                                                        </div>
                                                    </div>
                                                </FormControl>

                                                {/* <Button
                                                    variant={'ghost'}
                                                    type="button"
                                                    className=" text-secondary w-[100px] h-[30px] gap-x-1 "
                                                    onClick={() =>
                                                        setShowPreview(true)
                                                    }
                                                >
                                                    <ArrowUpRightSquare />
                                                    <h1>Preview</h1>
                                                </Button> */}
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
                                                                variant={
                                                                    'outline'
                                                                }
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
                                                            selected={
                                                                field.value
                                                            }
                                                            onSelect={
                                                                field.onChange
                                                            }
                                                            disabled={(
                                                                date: any
                                                            ) =>
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
                        </>
                    )}
                </div>
                <div className="text-left">
                    {/* <TiptapToolbar editor={editor} />
                    <TiptapEditor editor={editor} /> */}
                    <RemirrorTextEditor
                        initialContent={initialContent}
                        setInitialContent={setInitialContent}
                    />
                </div>
                <div className="flex justify-end mt-5">
                    <Button type="submit" form="myForm">
                        Save
                    </Button>
                </div>
            </div>
        </>
    )
}
