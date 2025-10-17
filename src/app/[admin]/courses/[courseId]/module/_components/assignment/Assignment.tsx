'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
    format,
    addDays,
    setHours,
    setMinutes,
    setSeconds,
    setMilliseconds,
    parseISO,
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
// import '@/app/_components/editor/Tiptap.css'
import { ArrowUpRightSquare, CalendarIcon, Pencil } from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
    getChapterUpdateStatus,
    getAssignmentPreviewStore,
} from '@/store/store'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import UploadArticle from '../Article/UploadPdf'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getUser } from '@/store/store'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    AssignmentProps,
    AssignmentContentEditorDoc,
    DocItem,
    TextContent,
    ChapterDetailsResponse,
    EditorContent,
} from '@/app/[admin]/courses/[courseId]/module/_components/assignment/moduleComponentAssignmentType'
import { PencilLine } from 'lucide-react'

const AddAssignent = ({
    content,
    courseId,
    assignmentUpdateOnPreview,
    setAssignmentUpdateOnPreview,
}: AssignmentProps) => {
    // misc

    const formSchema = z.object({
        title: z.string(),
        startDate: z.date({
            required_error: 'A start date is required.',
        }),
    })

    const router = useRouter()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const [title, setTitle] = useState('')
    const [deadline, setDeadline] = useState<any>()
    const [titles, setTitles] = useState('')
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const { setAssignmentPreviewContent } = getAssignmentPreviewStore()
    const [defaultValue, setDefaultValue] = useState('editor')
    const [file, setFile] = useState<any>(null)
    const [ispdfUploaded, setIsPdfUploaded] = useState(false)
    const [pdfLink, setpdfLink] = useState<any>()
    const [loading, setIsLoading] = useState(false)
    const [disabledUploadButton, setIsdisabledUploadButton] = useState(false)

    const [initialContent, setInitialContent] = useState<
        { doc: AssignmentContentEditorDoc } | undefined
    >()
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [hasEditorContent, setHasEditorContent] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [previousContentHash, setPreviousContentHash] = useState('')
    const hasLoaded = useRef(false)

    // NEW: Track user interactions and manual saves
    const [hasUserManuallySaved, setHasUserManuallySaved] = useState(false)
    const [isUserInteracting, setIsUserInteracting] = useState(false)
    const [initialLoadComplete, setInitialLoadComplete] = useState(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        values: {
            title: title,
            startDate:
                deadline ||
                setHours(
                    setMinutes(
                        setSeconds(setMilliseconds(new Date(), 0), 0),
                        0
                    ),
                    0
                ),
        },
        mode: 'onChange',
    })

    const isEditorContentEmpty = (content?: EditorContent) => {
        if (!content || !content.doc || !content.doc.content) return true

        const docContent = content.doc.content
        if (docContent.length === 0) return true

        // Check if only empty paragraphs
        if (
            docContent.length === 1 &&
            docContent[0].type === 'paragraph' &&
            (!docContent[0].content || docContent[0].content.length === 0)
        ) {
            return true
        }

        // Check if all content is empty
        const hasRealContent = docContent.some((item: DocItem) => {
            if (item.type === 'paragraph' && item.content) {
                return item.content.some(
                    (textItem: TextContent) =>
                        textItem.type === 'text' &&
                        textItem.text &&
                        textItem.text.trim().length > 0
                )
            }
            return item.type !== 'paragraph' // Non-paragraph content is considered real content
        })

        return !hasRealContent
    }

    // Function to generate content hash for comparison
    const generateContentHash = (content: any) => {
        return JSON.stringify(content)
    }

    // UPDATED: Auto-save function with better conditions
    const autoSave = async () => {
        if (isSaving) return // Prevent multiple simultaneous saves

        try {
            setIsSaving(true)
            const initialContentString = initialContent
                ? [JSON.stringify(initialContent)]
                : ''
            const requestBody = {
                title: titles,
                completionDate: deadline,
                articleContent: initialContentString,
            }

            await api.put(
                `/Content/editChapterOfModule/${content.moduleId}?chapterId=${content.id}`,
                requestBody
            )
            setAssignmentUpdateOnPreview(!assignmentUpdateOnPreview)
            setIsChapterUpdated(!isChapterUpdated)
            setIsEditorSaved(!isEditorContentEmpty(initialContent))

            // Update previous content hash
            setPreviousContentHash(generateContentHash(initialContent))

            // Only show toast if user has interacted and this is a real auto-save scenario
            if (isUserInteracting && hasUserManuallySaved) {
                toast.success({
                    title: 'Auto-saved',
                    description: 'Assignment content auto-saved successfully',
                })
            }
        } catch (error: any) {
            console.error('Auto-save failed:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const getAssignmentContent = async () => {
        setIsDataLoading(true)
        try {
            const response = await api.get<ChapterDetailsResponse>(
                `/Content/chapterDetailsById/${content.id}?bootcampId=${courseId}&moduleId=${content.moduleId}&topicId=${content.topicId}`
            )

            // Convert string to Date object
            if (response.data.completionDate) {
                setDeadline(parseISO(response.data.completionDate))
            } else {
                setDeadline(null)
            }

            const contentDetails = response.data.contentDetails[0]
            setTitle(contentDetails.title)
            setTitles(contentDetails.title)
            if (contentDetails.links && contentDetails.links[0]) {
                setpdfLink(contentDetails.links[0])
                setIsPdfUploaded(true)
                setDefaultValue('pdf')
                setIsEditorSaved(false) // PDF hai to editor saved false
            } else {
                setpdfLink(null)
                setIsPdfUploaded(false)
                setDefaultValue('editor')
                // --- Check if editor me content hai ---
                const data = contentDetails.content
                let hasEditorContent = false
                if (data && data.length > 0) {
                    // Agar content array me kuch hai, to editor saved true
                    hasEditorContent = true
                    // If content exists, mark as manually saved (existing content)
                    setHasUserManuallySaved(true)
                }
                setIsEditorSaved(hasEditorContent)
            }
            if (typeof contentDetails.content[0] === 'string') {
                const parsedContent = JSON.parse(contentDetails.content[0])
                setInitialContent(parsedContent)
                setPreviousContentHash(generateContentHash(parsedContent))
            } else {
                const jsonData = { doc: contentDetails.content[0] }
                setInitialContent(jsonData)
                setPreviousContentHash(generateContentHash(jsonData))
            }
        } catch (error) {
            console.error('Error fetching assignment content:', error)
        } finally {
            setIsDataLoading(false)
            // Mark initial load as complete after a short delay
            setTimeout(() => {
                setInitialLoadComplete(true)
            }, 1000)
        }
    }

    const [isEditorSaved, setIsEditorSaved] = useState(false)

    // Jab bhi initialContent change ho, editor empty hai ya nahi check karo
    useEffect(() => {
        if (defaultValue === 'editor') {
            if (
                !initialContent ||
                !initialContent.doc ||
                !initialContent.doc.content ||
                initialContent.doc.content.length === 0 ||
                (initialContent.doc.content.length === 1 &&
                    initialContent.doc.content[0].type === 'paragraph' &&
                    !initialContent.doc.content[0].content)
            ) {
                setIsEditorSaved(false)
            }
        }
    }, [initialContent, defaultValue])

    // async
    useEffect(() => {
        if (hasLoaded.current) return
        hasLoaded.current = true
        getAssignmentContent()
    }, [content])

    const convertToISO = (dateInput: any): string => {
        const date = new Date(dateInput)

        if (isNaN(date.getTime())) {
            throw new Error('Invalid date input')
        }

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    // UPDATED: Manual save function - sets the flag for manual save
    const editAssignmentContent = async (data: any) => {
        const deadlineDate = convertToISO(data.startDate)
        try {
            const initialContentString = initialContent
                ? [JSON.stringify(initialContent)]
                : ''
            const requestBody = {
                title: data.title,
                completionDate: deadlineDate,
                articleContent: initialContentString,
            }

            await api.put(
                `/Content/editChapterOfModule/${content.moduleId}?chapterId=${content.id}`,
                requestBody
            )
            setAssignmentUpdateOnPreview(!assignmentUpdateOnPreview)
            setIsChapterUpdated(!isChapterUpdated)
            setIsEditorSaved(true)

            // IMPORTANT: Mark that user has manually saved
            setHasUserManuallySaved(true)

            setPreviousContentHash(generateContentHash(initialContent))

            toast.success({
                title: 'Success',
                description: 'Assignment Chapter Edited Successfully',
            })
        } catch (error: any) {
            toast.error({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
            })
        }
    }

    // UPDATED: Auto-save effect with better conditions
    useEffect(() => {
        // Don't run auto-save during initial load
        if (!initialLoadComplete) return

        if (defaultValue === 'editor' && initialContent) {
            const isEmpty = isEditorContentEmpty(initialContent)
            const currentHash = generateContentHash(initialContent)

            setHasEditorContent(!isEmpty)
            if (
                isEmpty &&
                hasUserManuallySaved &&
                previousContentHash !== currentHash &&
                isUserInteracting &&
                previousContentHash !== '' // Ensure previous content existed
            ) {
                autoSave()
            }
        }
    }, [
        initialContent,
        defaultValue,
        hasUserManuallySaved,
        previousContentHash,
        isUserInteracting,
        initialLoadComplete,
    ])

    // UPDATED: Track user interaction with editor
    useEffect(() => {
        const handleUserInteraction = () => {
            if (initialLoadComplete) {
                setIsUserInteracting(true)
            }
        }

        // Add event listeners for user interaction
        document.addEventListener('keydown', handleUserInteraction)
        document.addEventListener('click', handleUserInteraction)
        document.addEventListener('input', handleUserInteraction)

        return () => {
            document.removeEventListener('keydown', handleUserInteraction)
            document.removeEventListener('click', handleUserInteraction)
            document.removeEventListener('input', handleUserInteraction)
        }
    }, [initialLoadComplete])

    const previewAssignment = () => {
        if (defaultValue === 'editor') {
            const isEmpty = isEditorContentEmpty(initialContent)

            if (isEmpty) {
                return toast.error({
                    title: 'Cannot Preview',
                    description:
                        'Editor content is empty. Please add some content.',
                })
            }

            if (!isEditorSaved) {
                return toast.error({
                    title: 'Unsaved Changes',
                    description: 'Please save your content before previewing.',
                })
            }
            setAssignmentPreviewContent(content)
            router.push(
                `/${userRole}/courses/${courseId}/module/${content.moduleId}/chapter/${content.id}/assignment/${content.topicId}/preview`
            )
        }
    }

    const onFileUpload = async () => {
        if (file) {
            if (file.type !== 'application/pdf') {
                return toast.error({
                    title: 'Invalid file type',
                    description: 'Only PDF files are allowed.',
                })
            }

            // build the FormData, with the *exact* field name your backend expects*
            const formData = new FormData()
            formData.append('pdf', file, file.name)

            try {
                await api.post(
                    `/Content/curriculum/upload-pdf?moduleId=${content.moduleId}&chapterId=${content.id}`,
                    formData, // ← pass FormData directly
                    {
                        // OPTIONAL: axios will set the correct Content-Type boundary for you
                        headers: { 'Content-Type': 'multipart/form-data' },
                    }
                )

                const deadlineDate = convertToISO(deadline)

                const requestBody = {
                    title: titles,
                    completionDate: deadlineDate,
                }

                await api.put(
                    `/Content/editChapterOfModule/${content.moduleId}?chapterId=${content.id}`,
                    requestBody
                )

                toast.success({
                    title: 'Success',
                    description: 'PDF uploaded successfully!',
                })
                setIsdisabledUploadButton(false)

                setTimeout(() => {
                    setIsPdfUploaded(true)
                    setpdfLink('')
                    getAssignmentContent()
                }, 1000) //
            } catch (err: any) {
                console.error(err)
                toast.success({
                    title: 'Upload failed',
                    description:
                        err.response?.data?.message ||
                        err.message ||
                        'An error occurred.',
                })
            }
        }
    }

    // Add previewPdf function for PDF preview navigation
    function previewPdf() {
        if (ispdfUploaded) {
            setAssignmentPreviewContent(content)
            router.push(
                `/${userRole}/courses/${courseId}/module/${content.moduleId}/chapter/${content.id}/assignment/${content.topicId}/preview?pdf=true`
            )
        } else {
            toast.error({
                title: 'Failed',
                description: 'No PDF uploaded. Please upload one to preview.',
            })
        }
    }

    const onDeletePdfhandler = async () => {
        setIsLoading(true)

        const deadlineDate = convertToISO(deadline)

        await api
            .put(
                `/Content/editChapterOfModule/${content.moduleId}?chapterId=${content.id}`,
                { title: titles, links: null, completionDate: deadlineDate }
            )
            .then((res) => {
                toast.success({
                    title: 'Success',
                    description: 'PDF Deleted Successfully',
                })
                setIsPdfUploaded(false)
                setpdfLink(null)
                setDefaultValue('editor')
                setIsEditorSaved(false)
                // Reset manual save flag when switching to editor
                setHasUserManuallySaved(false)
            })
            .catch((err: any) => {
                toast.error({
                    title: 'Delete PDF failed',
                    description:
                        err.response?.data?.message ||
                        err.message ||
                        'An error occurred.',
                })
            })
        setIsLoading(false)
    }

    if (isDataLoading) {
        return (
            <div className="px-5">
                <div className="w-full flex justify-center items-center py-8">
                    <div className="animate-pulse">
                        Loading assignment details...
                    </div>
                </div>
            </div>
        )
    }
    return (
        <ScrollArea className="h-screen max-h-[calc(100vh-120px)]">
        <div className="px-5">
            <>
                <div className="w-full ">
                    <Form {...form}>
                        <form
                            id="myForm"
                            onSubmit={form.handleSubmit(editAssignmentContent)}
                            className=" "
                        >
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-0">
                                        <FormControl>
                                            <>
                                                <Input
                                                    {...field}
                                                    onChange={(e) => {
                                                        const newValue =
                                                            e.target.value
                                                        if (newValue.length>50)
                                                        { 
                                                             toast.error({
                                                                title: 'Character Limit Reached',
                                                                description:
                                                                    'You can enter up to 50 characters only.',
                                                            })  
                                                        } else {
                                                             setTitles(newValue)
                                                            field.onChange(
                                                                newValue
                                                            )
                                                           
                                                        }
                                                        // setTitles(
                                                        //     e.target.value
                                                        // )
                                                        // field.onChange(e)
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                        }
                                                    }}
                                                    placeholder="Untitled Assignment"
                                                    className="text-md p-2 focus-visible:ring-0 placeholder:text-foreground"
                                                    // autoFocus
                                                />
                                            </>
                                        </FormControl>
                                        <FormMessage className="h-5" />
                                    </FormItem>
                                )}
                            />
                            {/* {!titles && ( // Show pencil icon only when the title is empty
                                <Pencil
                                    fill="true"
                                    fillOpacity={0.4}
                                    size={20}
                                    className="absolute text-gray-100 pointer-events-none mt-1 right-5"
                                />
                            )} */}
                            {/* <div className="flex items-center justify-between mr-2">
                                    {defaultValue === 'editor' ? (
                                        <div
                                            id="previewAssignment"
                                            onClick={previewAssignment}
                                            className="flex hover:bg-gray-300 rounded-md p-1 cursor-pointer"
                                        >
                                            <Eye size={18} />
                                            <h6 className="ml-1 text-sm text-gray-600">
                                                Preview Assignment
                                            </h6>
                                        </div>
                                    ) : (
                                        <div
                                            id="previewAssignment"
                                            onClick={previewPdf}
                                            className={`flex hover:bg-gray-300 rounded-md p-1 cursor-pointer ${!ispdfUploaded
                                                ? 'opacity-50 pointer-events-none'
                                                : ''
                                                }`}
                                        >
                                            <Eye size={18} />
                                            <h6 className="ml-1 text-sm text-gray-600">
                                                Preview PDF
                                            </h6>
                                        </div>
                                    )}
                            </div> */}
                            <div className="flex items-center gap-2">
                                <PencilLine
                                    size={15}
                                    className="transition-colors"
                                />
                                <p className="text-muted-foreground">
                                    Assignment
                                </p>
                            </div>
                            {/* <Form {...form}>
                                <form
                                    id="myForm"
                                    onSubmit={form.handleSubmit(editAssignmentContent)}
                                    className=" "
                                > */}
                            <div className="">
                                <RadioGroup
                                    className="flex items-center gap-x-6 mt-4"
                                    onValueChange={(value) =>
                                        setDefaultValue(value)
                                    }
                                    value={defaultValue}
                                >
                                    <TooltipProvider>
                                        <div className="flex gap-x-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <RadioGroupItem
                                                        value="editor"
                                                        disabled={!!pdfLink}
                                                        id="r1"
                                                        className="mt-1 text-black border-black"
                                                    />
                                                </TooltipTrigger>
                                                {pdfLink && (
                                                    <TooltipContent side="top">
                                                        You have uploaded a PDF,
                                                        so the editor is now
                                                        disabled
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                            <Label
                                                htmlFor="r1"
                                                className="font-light text-md text-black"
                                            >
                                                Editor
                                            </Label>
                                        </div>

                                        <div className="flex gap-x-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <RadioGroupItem
                                                        value="pdf"
                                                        id="r2"
                                                        className="mt-1 text-black border-black"
                                                        disabled={isEditorSaved}
                                                    />
                                                </TooltipTrigger>
                                                {isEditorSaved && (
                                                    <TooltipContent side="top">
                                                        You have already saved
                                                        the assignment, so PDF
                                                        upload is now disabled
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                            <Label
                                                htmlFor="r2"
                                                className="font-light text-md text-black"
                                            >
                                                Upload PDF
                                            </Label>
                                        </div>
                                    </TooltipProvider>
                                </RadioGroup>

                                <div className="bg-card rounded-lg shadow-sm border">
                                    <div className="p-6">
                                        <p className="text-xl text-start font-semibold">
                                            Assignment Details
                                        </p>
                                        <div className="flex gap-4">
                                            {/* <div className="w-[70%]">
                                                <FormField
                                                    control={form.control}
                                                    name="title"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col gap-0">
                                                            <FormControl>
                                                                <>
                                                                    <p className="flex text-left text-lg mt-4">
                                                                        Title
                                                                    </p>
                                                                    <Input
                                                                        {...field}
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            setTitles(
                                                                                e.target
                                                                                    .value
                                                                            )
                                                                            field.onChange(
                                                                                e
                                                                            )
                                                                        }}
                                                                        onKeyDown={(
                                                                            e
                                                                        ) => {
                                                                            if (
                                                                                e.key ===
                                                                                'Enter'
                                                                            ) {
                                                                                e.preventDefault()
                                                                            }
                                                                        }}
                                                                        placeholder="Untitled Assignment"
                                                                        className="text-md p-2 focus-visible:ring-0 placeholder:text-foreground"
                                                                        // autoFocus
                                                                    />
                                                                </>
                                                            </FormControl>
                                                            <FormMessage className="h-5" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div> */}
                                            <div className="w-[30%]">
                                                <FormField
                                                    control={form.control}
                                                    name="startDate"
                                                    render={({ field }) => {
                                                        const d = field.value
                                                            ? typeof field.value ===
                                                              'string'
                                                                ? field.value.split(
                                                                      ' '
                                                                  )[0]
                                                                : field.value
                                                            : null
                                                        let dateValue =
                                                            typeof field.value ===
                                                                'string' && d
                                                                ? parseISO(d)
                                                                : field.value
                                                        return (
                                                            <FormItem className="flex flex-col justify-start gap-x-2 gap-y-4 text-left">
                                                                <Popover>
                                                                    <PopoverTrigger
                                                                        asChild
                                                                    >
                                                                        <div className="w-full">
                                                                            <p className="flex text-left text-lg mt-4 mb-2">
                                                                                Choose
                                                                                Deadline
                                                                                Date*
                                                                            </p>
                                                                            <div
                                                                                className={`flex items-center justify-between w-full border border-input rounded-md bg-background px-3 py-2 text-sm text-gray-700 hover:border-[rgb(81,134,114)] ${
                                                                                    !field.value &&
                                                                                    'text-muted-foreground'
                                                                                }`}
                                                                                onClick={(
                                                                                    e
                                                                                ) => {
                                                                                    const target =
                                                                                        e.target as HTMLElement
                                                                                    const isText =
                                                                                        target.closest(
                                                                                            '.date-text'
                                                                                        )
                                                                                    const isIcon =
                                                                                        target.closest(
                                                                                            '.calendar-icon'
                                                                                        )
                                                                                    if (
                                                                                        !isText &&
                                                                                        !isIcon
                                                                                    )
                                                                                        e.stopPropagation()
                                                                                }}
                                                                            >
                                                                                <span className="date-text cursor-pointer truncate">
                                                                                    {dateValue
                                                                                        ? format(
                                                                                              dateValue,
                                                                                              'EEE, MMM d, yyyy'
                                                                                          )
                                                                                        : 'Pick a date'}
                                                                                </span>

                                                                                <CalendarIcon className="calendar-icon h-5 w-5 opacity-60 ml-2 cursor-pointer" />
                                                                            </div>
                                                                        </div>
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
                                                                            onSelect={(
                                                                                date
                                                                            ) => {
                                                                                if (
                                                                                    date
                                                                                ) {
                                                                                    field.onChange(
                                                                                        date
                                                                                    )
                                                                                    setDeadline(
                                                                                        date
                                                                                    ) // Keep both states in sync
                                                                                }
                                                                            }}
                                                                            disabled={(
                                                                                date: any
                                                                            ) =>
                                                                                date <=
                                                                                addDays(
                                                                                    new Date(),
                                                                                    -1
                                                                                )
                                                                            }
                                                                            initialFocus
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        {defaultValue === 'editor' &&
                                            !pdfLink && ( // <-- PDF link nahi hai tabhi editor dikhao
                                                <div className="mt-2 text-start">
                                                    <p className="flex text-left text-lg mt-6 mb-2">
                                                        Description
                                                    </p>
                                                    <RemirrorTextEditor
                                                        initialContent={
                                                            initialContent
                                                        }
                                                        setInitialContent={
                                                            setInitialContent
                                                        }
                                                    />
                                                </div>
                                            )}
                                        {defaultValue === 'pdf' && (
                                            <div className="mt-4">
                                                <UploadArticle
                                                    loading={loading}
                                                    file={file}
                                                    setFile={setFile}
                                                    className=""
                                                    isPdfUploaded={
                                                        ispdfUploaded
                                                    }
                                                    pdfLink={pdfLink}
                                                    setIsPdfUploaded={
                                                        setIsPdfUploaded
                                                    }
                                                    onDeletePdfhandler={
                                                        onDeletePdfhandler
                                                    }
                                                    setDisableButton={
                                                        setIsdisabledUploadButton
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* </form>
                            </Form> */}
                            <div className="flex justify-end mt-5">
                                {defaultValue === 'editor' ? (
                                    <Button
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        type="submit"
                                        form="myForm"
                                        disabled={!hasEditorContent || isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </Button>
                                ) : (
                                    <div>
                                        <Button
                                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                                            type="button"
                                            onClick={onFileUpload}
                                            disabled={!disabledUploadButton}
                                        >
                                            {/* Upload PDF */}
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </Form>
                </div>
            </>
        </div>
    </ScrollArea>
    )
}

export default AddAssignent
