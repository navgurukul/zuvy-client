// 'use client'

// import { useEffect, useState } from 'react'
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from '@/components/ui/form'
// import {
//     format,
//     addDays,
//     setHours,
//     setMinutes,
//     setSeconds,
//     setMilliseconds,
// } from 'date-fns'
// import { Input } from '@/components/ui/input'
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from '@/components/ui/popover'
// import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
// import { Button } from '@/components/ui/button'
// import { api } from '@/utils/axios.config'
// import { ArrowUpRightSquare, CalendarIcon } from 'lucide-react'
// import { Calendar } from '@/components/ui/calendar'
// import { useForm } from 'react-hook-form'
// import { z } from 'zod'
// import { toast } from '@/components/ui/use-toast'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useParams } from 'next/navigation'
// // import ProjectPreview from '../_components/ProjectPreview'
// import { Eye } from 'lucide-react'
// import { useRouter } from 'next/navigation'
// import { getProjectPreviewStore } from '@/store/store'
// import { RemirrorJSON } from 'remirror'
// import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'
// import {ProjectDataProject,ProjectData} from "@/app/[admin]/courses/[courseId]/module/[moduleId]/project/projectProjectIdPageType"

// export default function Project() {
//     const router = useRouter()
//     const { setProjectPreviewContent } = getProjectPreviewStore()
//     // const [showPreview, setShowPreview] = useState<boolean>(false)
//     const { courseId, moduleId, projectID } = useParams()
//     const [initialContent, setInitialContent] = useState<RemirrorJSON | null>(
//         null
//     )
//     const [title, setTitle] = useState('')
//     const [projectData, setProjectData] = useState<ProjectData>()
//     const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
//     const [lastSavedContent, setLastSavedContent] = useState<string>('')
//     const [lastSavedTitle, setLastSavedTitle] = useState('')
//     const [hasUserSavedBefore, setHasUserSavedBefore] = useState(false)

//     const crumbs = [
//         {
//             crumb: 'Courses',
//             href: '/admin/courses',
//             isLast: false,
//         },
//         {
//             crumb: 'Curriculum',
//             href: `/admin/courses/${courseId}/curriculum`,
//             isLast: false,
//         },
//         {
//             crumb: title,
//             isLast: true,
//         },
//     ]

//     const formSchema = z.object({
//         title: z.string().min(2, {
//             message: 'Title must be at least 2 characters.',
//         }),
//         startDate: z.date({
//             required_error: 'A start date is required.',
//         }),
//     })

//     const form = useForm({
//         resolver: zodResolver(formSchema),
//         values: {
//             title: title,
//             startDate: setHours(
//                 setMinutes(setSeconds(setMilliseconds(new Date(), 0), 0), 0),
//                 0
//             ),
//         },
//         mode: 'onChange',
//     })

//     const fetchProjectDetails = async () => {
//         try {
//             const response = await api.get(
//                 `Content/project/${projectID}?bootcampId=${courseId}`
//             )
//             setProjectData(response.data)
//             const projectTitle = response.data.project[0].title
//             setTitle(projectTitle)
//             setLastSavedTitle(projectTitle)

//             const content = response.data.project[0].instruction.description
//             const parsedContent = JSON.parse(content)
//             setInitialContent(parsedContent)
//             setLastSavedContent(JSON.stringify(parsedContent))

//             // //             if (typeof projectDetail === 'string') {
//             // //     setInitialContent(JSON.parse(projectDetail))
//             // // } else {
//             // //     const jsonData = { doc: projectDetail }
//             // //     setInitialContent(jsonData)
//             // // }
//         } catch (error) {
//             console.error(error)
//         }
//     }

//     useEffect(() => {
//         if (projectID) {
//             fetchProjectDetails()
//         }
//     }, [projectID])

//     // Check for unsaved changes
//     useEffect(() => {
//         const currentContent = initialContent ? JSON.stringify(initialContent) : ''
//         const titleChanged = title !== lastSavedTitle
//         const contentChanged = currentContent !== lastSavedContent

//         setHasUnsavedChanges(titleChanged || contentChanged)
//     }, [title, initialContent, lastSavedTitle, lastSavedContent])

//     async function editProject(data: any) {
//         function convertToISO(dateString: string): string {
//             const date = new Date(dateString)

//             if (isNaN(date.getTime())) {
//                 throw new Error('Invalid date string')
//             }

//             date.setDate(date.getDate() + 1)

//             const isoString = date.toISOString()

//             return isoString
//         }
//         const deadlineDate = convertToISO(data.startDate)

//         try {
//             const initialContentString = initialContent
//                 ? JSON.stringify(initialContent)
//                 : ''
//             await api.patch(`/Content/updateProjects/${projectID}`, {
//                 title,
//                 instruction: { description: initialContentString },
//                 isLock: projectData?.project[0].isLock,
//                 deadline: deadlineDate,
//             })

//             // Update last saved states
//             setLastSavedTitle(title)
//             setLastSavedContent(initialContentString)
//             setHasUnsavedChanges(false)
//             setHasUserSavedBefore(true)
//             toast.success({
//                 title: 'Success',
//                 description: 'Project Edited Successfully',
//             })
//         } catch (error: any) {
//             toast.error({
//                 title: 'Failed',
//                 description:
//                     error.response?.data?.message || 'An error occurred.',
//             })
//         }
//     }

//     // Function to check if content is empty
//     const isContentEmpty = () => {
//         if (!initialContent) return true

//         // Check if content has any actual content
//         // Type assertion to access the doc property safely
//         const content = initialContent as any
//         if (content.doc && content.doc.content) {
//             // If content array is empty or contains only empty paragraphs
//             const hasContent = content.doc.content.some((node: any) => {
//                 if (node.type === 'paragraph' && node.content) {
//                     return node.content.some((textNode: any) =>
//                         textNode.text && textNode.text.trim().length > 0
//                     )
//                 }
//                 return node.type !== 'paragraph' // Non-paragraph content is considered as content
//             })
//             return !hasContent
//         }

//         return true
//     }

//     function previewProject() {
//         // Check if content is empty
//         if (isContentEmpty()) {
//             toast.error({
//                 title: 'Content Required',
//                 description: 'Please add some content before previewing the project.',
//             })
//             return
//         }

//         // Check if there are unsaved changes
//         if (hasUnsavedChanges) {
//             toast.error({
//                 title: 'Save Required',
//                 description: 'Please save your changes before previewing the project.',
//             })
//             return
//         }

//         if (projectData) {
//             setProjectPreviewContent(projectData)
//             router.push(
//                 `/admin/courses/${courseId}/module/${moduleId}/project/${projectID}/preview`
//             )
//         }
//     }
//     useEffect(() => {
//         const contentIsEmpty = isContentEmpty()
//         const currentContentString = initialContent
//             ? JSON.stringify(initialContent)
//             : ''

//         // Only run auto-save logic if user has saved before
//         if (
//             hasUserSavedBefore &&
//             lastSavedContent !== '' &&
//             contentIsEmpty &&
//             hasUnsavedChanges
//         ) {
//             const autoSave = async () => {
//                 try {
//                     await api.patch(`/Content/updateProjects/${projectID}`, {
//                         title: lastSavedTitle,
//                         instruction: { description: currentContentString },
//                         isLock: projectData?.project[0].isLock,
//                         deadline: projectData?.project[0].deadline,
//                     })

//                     setLastSavedContent(currentContentString)
//                     setHasUnsavedChanges(false)

//                     toast.success({
//                         title: 'Auto-saved',
//                         description:
//                             'Content was cleared and auto-saved successfully.',
//                     })
//                 } catch (err) {
//                     console.error('Auto-save failed:', err)
//                 }
//             }

//             autoSave()
//         }
//     }, [initialContent])

//     return (
//         <>
//             <BreadcrumbComponent crumbs={crumbs} />
//             <div className="flex flex-col mt-5">
//                 <div className="w-full ">
//                     {/* {showPreview ? (
//                         <ProjectPreview
//                             content={projectData}
//                             setShowPreview={setShowPreview}
//                         />
//                     ) : (
//                         <> */}
//                     <Form {...form}>
//                         <form
//                             id="myForm"
//                             onSubmit={form.handleSubmit(editProject)}
//                             className="space-y-8 mb-10"
//                         >
//                             <FormField
//                                 control={form.control}
//                                 name="title"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         {/* <FormLabel></FormLabel> */}
//                                         <FormControl>
//                                             <div className="flex justify-between items-center">
//                                                 <Input
//                                                     placeholder="Untitled Article"
//                                                     className="p-0 text-3xl w-2/5 text-left font-semibold outline-none border-none focus:ring-0 capitalize"
//                                                     {...field}
//                                                     {...form.register('title')}
//                                                     onChange={(e) =>
//                                                         setTitle(e.target.value)
//                                                     }
//                                                 />
//                                                 <div
//                                                     id="previewProject"
//                                                     onClick={previewProject}
//                                                     className="flex w-[80px] hover:bg-gray-300 rounded-md p-1 cursor-pointer"
//                                                 >
//                                                     <Eye size={18} />
//                                                     <h6 className="ml-1 text-sm">
//                                                         Preview
//                                                     </h6>
//                                                 </div>
//                                             </div>
//                                         </FormControl>
//                                         <FormMessage className="h-5" />
//                                     </FormItem>
//                                 )}
//                             />
//                             <FormField
//                                 control={form.control}
//                                 name="startDate"
//                                 render={({ field }) => (
//                                     <FormItem className="flex flex-col justify-start gap-x-2 text-left">
//                                         <FormLabel className="m-0">
//                                             <span className="text-xl">
//                                                 Choose Deadline Date
//                                             </span>
//                                             <span className="text-red-500">
//                                                 *
//                                             </span>{' '}
//                                         </FormLabel>
//                                         <Popover>
//                                             <PopoverTrigger asChild>
//                                                 <FormControl>
//                                                     <Button
//                                                         variant={'outline'}
//                                                         className={`w-[230px]  text-left font-normal ${
//                                                             !field.value &&
//                                                             'text-muted-foreground'
//                                                         }`}
//                                                     >
//                                                         {field.value
//                                                             ? format(
//                                                                   field.value,
//                                                                   'EEEE, MMMM d, yyyy'
//                                                               )
//                                                             : 'Pick a date'}
//                                                         <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                                                     </Button>
//                                                 </FormControl>
//                                             </PopoverTrigger>
//                                             <PopoverContent
//                                                 className="w-auto p-0"
//                                                 align="start"
//                                             >
//                                                 <Calendar
//                                                     mode="single"
//                                                     selected={field.value}
//                                                     onSelect={field.onChange}
//                                                     disabled={(date: any) =>
//                                                         date <=
//                                                         addDays(new Date(), -1)
//                                                     } // Disable past dates
//                                                     initialFocus
//                                                 />
//                                             </PopoverContent>
//                                         </Popover>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                         </form>
//                     </Form>
//                     {/* </>
//                     )} */}
//                 </div>
//                 <div className="text-left">
//                     <RemirrorTextEditor
//                         initialContent={initialContent}
//                         setInitialContent={setInitialContent}
//                     />
//                 </div>
//                 <div className="flex justify-end mt-5">
//                     <Button type="submit" form="myForm"
//                     disabled={isContentEmpty()}
//                     className={isContentEmpty() ? 'opacity-50 cursor-not-allowed' : ''}
//                     >
//                         Save
//                     </Button>
//                 </div>
//             </div>
//         </>
//     )
// }

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
import { ArrowUpRightSquare, CalendarIcon, Eye, ArrowLeft } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '@/components/ui/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'next/navigation'
// import ProjectPreview from '../_components/ProjectPreview'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getProjectPreviewStore } from '@/store/store'
import { RemirrorJSON } from 'remirror'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'
import {
    ProjectDataProject,
    ProjectData,
} from '@/app/[admin]/courses/[courseId]/module/[moduleId]/project/projectProjectIdPageType'

export default function Project() {
    const router = useRouter()
    const { setProjectPreviewContent } = getProjectPreviewStore()
    // const [showPreview, setShowPreview] = useState<boolean>(false)
    const { courseId, moduleId, projectID } = useParams()
    const [initialContent, setInitialContent] = useState<RemirrorJSON | null>(
        null
    )
    const [title, setTitle] = useState('')
    const [projectData, setProjectData] = useState<ProjectData>()
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [lastSavedContent, setLastSavedContent] = useState<string>('')
    const [lastSavedTitle, setLastSavedTitle] = useState('')
    const [hasUserSavedBefore, setHasUserSavedBefore] = useState(false)

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

    const fetchProjectDetails = async () => {
        try {
            const response = await api.get(
                `Content/project/${projectID}?bootcampId=${courseId}`
            )
            const project = response.data.project[0]

            setProjectData(response.data)
            setTitle(project.title)
            setLastSavedTitle(project.title)

            const parsedContent = JSON.parse(project.instruction.description)
            setInitialContent(parsedContent)
            setLastSavedContent(JSON.stringify(parsedContent))
            let selectedDate: Date | undefined = undefined
            if (project.deadline) {
                const deadlineDate = new Date(project.deadline)
                selectedDate = new Date(
                    Date.UTC(
                        deadlineDate.getFullYear(),
                        deadlineDate.getMonth(),
                        deadlineDate.getDate()
                    )
                )
            }
            // Reset form with API data
            form.reset({
                title: project.title,
                startDate: selectedDate,
            })

            // Ensure Calendar sees the updated date
            if (selectedDate) form.setValue('startDate', selectedDate)
        } catch (err) {
            console.error(err)
        }
    }
    useEffect(() => {
        if (projectID) {
            fetchProjectDetails()
        }
    }, [projectID])

    // Check for unsaved changes
    useEffect(() => {
        const currentContent = initialContent
            ? JSON.stringify(initialContent)
            : ''
        const titleChanged = title !== lastSavedTitle
        const contentChanged = currentContent !== lastSavedContent

        setHasUnsavedChanges(titleChanged || contentChanged)
    }, [title, initialContent, lastSavedTitle, lastSavedContent])

    async function editProject(data: any) {
        function convertToISO(date: Date): string {
            if (!date || isNaN(date.getTime())) {
                throw new Error('Invalid date')
            }
            // directly convert to ISO string (UTC)
            return date.toISOString()
        }

        const deadlineDate = convertToISO(data.startDate)

        try {
            const initialContentString = initialContent
                ? JSON.stringify(initialContent)
                : ''
            await api.patch(`/Content/updateProjects/${projectID}`, {
                title,
                instruction: { description: initialContentString },
                isLock: projectData?.project[0].isLock,
                deadline: deadlineDate,
            })

            // Update last saved states
            setLastSavedTitle(title)
            setLastSavedContent(initialContentString)
            setHasUnsavedChanges(false)
            setHasUserSavedBefore(true)
            toast.success({
                title: 'Success',
                description: 'Project Edited Successfully',
            })
        } catch (error: any) {
            toast.error({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
            })
        }
    }

    // Function to check if content is empty
    const isContentEmpty = () => {
        if (!initialContent) return true

        // Check if content has any actual content
        // Type assertion to access the doc property safely
        const content = initialContent as any
        if (content.doc && content.doc.content) {
            // If content array is empty or contains only empty paragraphs
            const hasContent = content.doc.content.some((node: any) => {
                if (node.type === 'paragraph' && node.content) {
                    return node.content.some(
                        (textNode: any) =>
                            textNode.text && textNode.text.trim().length > 0
                    )
                }
                return node.type !== 'paragraph' // Non-paragraph content is considered as content
            })
            return !hasContent
        }

        return true
    }

    function previewProject() {
        // Check if content is empty
        if (isContentEmpty()) {
            toast.error({
                title: 'Content Required',
                description:
                    'Please add some content before previewing the project.',
            })
            return
        }

        // Check if there are unsaved changes
        if (hasUnsavedChanges) {
            toast.error({
                title: 'Save Required',
                description:
                    'Please save your changes before previewing the project.',
            })
            return
        }

        if (projectData) {
            setProjectPreviewContent(projectData)
            router.push(
                `/admin/courses/${courseId}/module/${moduleId}/project/${projectID}/preview`
            )
        }
    }
    useEffect(() => {
        const contentIsEmpty = isContentEmpty()
        const currentContentString = initialContent
            ? JSON.stringify(initialContent)
            : ''

        // Only run auto-save logic if user has saved before
        if (
            hasUserSavedBefore &&
            lastSavedContent !== '' &&
            contentIsEmpty &&
            hasUnsavedChanges
        ) {
            const autoSave = async () => {
                try {
                    await api.patch(`/Content/updateProjects/${projectID}`, {
                        title: lastSavedTitle,
                        instruction: { description: currentContentString },
                        isLock: projectData?.project[0].isLock,
                        deadline: projectData?.project[0].deadline,
                    })

                    setLastSavedContent(currentContentString)
                    setHasUnsavedChanges(false)

                    toast.success({
                        title: 'Auto-saved',
                        description:
                            'Content was cleared and auto-saved successfully.',
                    })
                } catch (err) {
                    console.error('Auto-save failed:', err)
                }
            }

            autoSave()
        }
    }, [initialContent])

    return (
        <>
            {/* <BreadcrumbComponent crumbs={crumbs} /> */}
            <div className="flex flex-col mt-10 lg:mx-44 mx-10">
                <Link
                    href={`/admin/courses/${courseId}/curriculum`}
                    className="flex space-x-2 w-[180px] text-foreground mt-3 mb-6 hover:text-primary"
                >
                    <ArrowLeft size={20} />
                    <p className="ml-1 inline-flex text-sm font-medium md:ml-2">
                        Back to Curriculum
                    </p>
                </Link>
                <div className="w-full ">
                    {/* {showPreview ? (
                        <ProjectPreview
                            content={projectData}
                            setShowPreview={setShowPreview}
                        />
                    ) : (
                        <> */}
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
                                            <div className="flex justify-between items-center text-foreground">
                                                <Input
                                                    placeholder="Untitled Article"
                                                    className="p-0 text-2xl w-2/5 text-left font-semibold outline-none border-none focus-visible:ring-0 capitalize"
                                                    {...field}
                                                    {...form.register('title')}
                                                    onChange={(e) =>
                                                        setTitle(e.target.value)
                                                    }
                                                />
                                                <div
                                                    id="previewProject"
                                                    onClick={previewProject}
                                                    className="flex w-[90px] hover:bg-primary hover:text-primary-foreground rounded-md p-1 cursor-pointer mr-4"
                                                >
                                                    <Eye size={18} />
                                                    <h6 className="ml-1 text-sm">
                                                        Preview
                                                    </h6>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="h-5" />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                    {/* </>
                    )} */}
                </div>

                <div className="bg-card border rounded-lg p-6 space-y-6">
                    {/* Deadline Date */}
                    <Form {...form}>
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col justify-start gap-x-2 text-left">
                                    <FormLabel className="m-0">
                                        <span className="text-lg">
                                            Choose Deadline Date
                                        </span>
                                        <span className="text-foreground">
                                            *
                                        </span>{' '}
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={'outline'}
                                                    className={`w-[230px] text-left font-normal ${!field.value &&
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
                                                onSelect={field.onChange}
                                                disabled={(date: any) =>
                                                    date <=
                                                    addDays(new Date(), -1)
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </Form>

                    {/* Remirror Editor */}
                    <div className="text-left">
                        <RemirrorTextEditor
                            initialContent={initialContent}
                            setInitialContent={setInitialContent}
                        />
                    </div>
                </div>
                <div className="flex justify-end my-5">
                    <Button type="submit" form="myForm"
                        disabled={isContentEmpty()}
                        className={isContentEmpty() ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </>
    )
}
