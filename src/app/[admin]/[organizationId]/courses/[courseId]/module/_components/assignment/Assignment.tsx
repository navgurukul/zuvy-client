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
import { ArrowUpRightSquare, CalendarIcon, Pencil, PencilLine } from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
    getChapterUpdateStatus,
    getAssignmentPreviewStore,
    getUser,
} from '@/store/store'
import { useRouter, usePathname } from 'next/navigation'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import UploadArticle from '../Article/UploadPdf'
import { ScrollArea } from '@/components/ui/scroll-area'
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
} from '@/app/[admin]/[organizationId]/courses/[courseId]/module/_components/assignment/moduleComponentAssignmentType'
import useEditChapter from '@/hooks/useEditChapter'
import useUploadPdf from '@/hooks/useUploadPdf'
import useGetChapterDetails from '@/hooks/useGetChapterDetails'
import {AssignmentSkeletons} from '@/app/[admin]/[organizationId]/courses/[courseId]/_components/adminSkeleton'

import PermissionAlert from '@/app/_components/PermissionAlert'
 
const AddAssignent = ({
    content,
    courseId,
    assignmentUpdateOnPreview,
    setAssignmentUpdateOnPreview,
    canEdit = true,
}: AssignmentProps) => {
    // misc

    const formSchema = z.object({
        title: z
            .string()
            .max(50, { message: 'You can enter up to 50 characters only.' }),
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
    const [alertOpen, setAlertOpen] = useState(!canEdit)
    const [deleteLoading, setIsDeleteLoading] = useState(false)

    const [initialContent, setInitialContent] = useState<
        { doc: AssignmentContentEditorDoc } | undefined
    >()
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [hasEditorContent, setHasEditorContent] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [previousContentHash, setPreviousContentHash] = useState('')
    const [isEditorSaved, setIsEditorSaved] = useState(false)
    const [hasUserSaved, setHasUserSaved] = useState(false)
    const [wasContentNonEmptyWhenSaved, setWasContentNonEmptyWhenSaved] = useState(false)
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [hasChangedAfterSave, setHasChangedAfterSave] = useState(false)
    const [canSave, setCanSave] = useState(false)
    const hasLoaded = useRef(false)
    const lastLoadedContentId = useRef<string | number | null>(null)
    const pathname = usePathname()
    const orgName = pathname.split('/')[2]

    const { editChapter } = useEditChapter()
    const { uploadPdf, loading: uploadLoading } = useUploadPdf()
    const { getChapterDetails, loading: chapterLoading } = useGetChapterDetails()

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

    const { handleSubmit, control, formState } = form
    const { isValid } = formState

    // Check if editor content is empty
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
        const hasRealContent = docContent.some((item: any) => {
            // Images and other non-paragraph content count as real content
            if (item.type !== 'paragraph') {
                return true
            }
            
            // Check paragraph content
            if (item.type === 'paragraph' && item.content) {
                return item.content.some((textItem: any) => {
                    // Text with actual content
                    if (textItem.type === 'text' && textItem.text && textItem.text.trim().length > 0) {
                        return true
                    }
                    // Images or other inline content
                    if (textItem.type !== 'text') {
                        return true
                    }
                    return false
                })
            }
            return false
        })

        return !hasRealContent
    }

    // Generate content hash for comparison
    const generateContentHash = (content: any) => {
        return JSON.stringify(content)
    }

    // Auto-save function with better conditions
    const autoSave = async () => {
        if (isSaving) return

        try {
            setIsSaving(true)
            const initialContentString = initialContent
                ? [JSON.stringify(initialContent)]
                : ''
            const requestBody = {
                title,
                completionDate: deadline,
                articleContent: initialContentString,
            }

            await editChapter(content.moduleId, content.id, requestBody)

            setAssignmentUpdateOnPreview(!assignmentUpdateOnPreview)
            setIsChapterUpdated(!isChapterUpdated)
            setIsEditorSaved(!isEditorContentEmpty(initialContent))

            // Update previous content hash
            setPreviousContentHash(generateContentHash(initialContent))

            // Only show toast for actual auto-save (not initial load or manual save)
            if (!isInitialLoad && hasUserSaved && wasContentNonEmptyWhenSaved) {
                toast.success({
                    title: 'Auto-saved',
                    description: 'Content removed and auto-saved successfully',
                })
            }
        } catch (error: any) {
            console.error('Auto-save failed:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const getAssignmentContent = async () => {
        try {
            const response = await getChapterDetails({
                chapterId: content.id,
                bootcampId: courseId,
                moduleId: content.moduleId,
                topicId: content.topicId,
            })
      
            // Convert string to Date object
            if (response.data.completionDate) {
                setDeadline(parseISO(response.data.completionDate))
            } else {
                setDeadline(null)
            }
           
            const contentDetails = response.data.contentDetails[0]
            const fetchedTitle = response.data.title || response.data.name || ''
            // Only update title if content.id changed or initial load
            if (lastLoadedContentId.current !== content.id) {
                setTitle(fetchedTitle)
                lastLoadedContentId.current = content.id
            }
            
            setIsDataLoading(false)
            
            const link = contentDetails?.links?.[0]
            if (link) {
                setpdfLink(link)
                setDefaultValue('pdf')
                setIsPdfUploaded(true)
                setIsEditorSaved(false)
            } else {
                setpdfLink(null)
                setIsPdfUploaded(false)
                setDefaultValue('editor')
                // Check if editor has content
                const data = contentDetails?.content
                let hasEditorContent = false
                if (data && data.length > 0) {
                    hasEditorContent = true
                    setHasUserSaved(true)
                    setWasContentNonEmptyWhenSaved(true)
                }
                setIsEditorSaved(hasEditorContent)
            }
            
            const data = contentDetails?.content
            let parsedContent
            if (typeof data?.[0] === 'string') {
                parsedContent = JSON.parse(data[0])
            } else {
                parsedContent = { doc: data?.[0] }
            }

            setInitialContent(parsedContent)

            // Set initial content states
            setHasEditorContent(!isEditorContentEmpty(parsedContent))
            setPreviousContentHash(generateContentHash(parsedContent))
            
        } catch (error) {
            console.error('Error fetching assignment content:', error)
        } finally {
            setIsDataLoading(false)
            setTimeout(() => setIsInitialLoad(false), 1000)
        }
    }

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

    // Manual save function
    const editAssignmentContent = async (data: any) => {
        if (!canEdit) return
        const deadlineDate = convertToISO(data.startDate)
        try {
            setIsSaving(true)
            setCanSave(false)
            const initialContentString = initialContent
                ? [JSON.stringify(initialContent)]
                : ''
            const requestBody = {
                title: data.title, 
                completionDate: deadlineDate,
                articleContent: initialContentString,
            }
            await editChapter(content.moduleId, content.id, requestBody)
            setTitle(data.title) 
            setAssignmentUpdateOnPreview(!assignmentUpdateOnPreview)
            setIsChapterUpdated(!isChapterUpdated)
            setIsEditorSaved(true)
            setHasUserSaved(true)
            setWasContentNonEmptyWhenSaved(!isEditorContentEmpty(initialContent))
            setPreviousContentHash(generateContentHash(initialContent))
            setHasChangedAfterSave(false)
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
        } finally {
            setIsSaving(false)
        }
    }

    useEffect(() => {
        if (content?.id && !hasLoaded.current) {
            hasLoaded.current = true
            getAssignmentContent()
        }
    }, [content?.id])

    // Keep form title in sync with state
    useEffect(() => {
        form.setValue('title', title)
    }, [title])

    // Reset isEditorSaved if PDF is uploaded or deleted
    useEffect(() => {
        if (ispdfUploaded) setIsEditorSaved(false)
    }, [ispdfUploaded])

    // Save button logic: editor disables after save, enables only after edit; PDF disables after save, enables after file/title/deadline edit
    useEffect(() => {
        if (defaultValue === 'editor') {
            const hasContent = initialContent && !isEditorContentEmpty(initialContent)
            setHasEditorContent(!!hasContent)
            setCanSave(!!hasContent && !isSaving && hasChangedAfterSave)
        } else if (defaultValue === 'pdf') {
            // Only enable Save if a file is selected for upload or a PDF is already uploaded
            setCanSave(((!!file || !!pdfLink) && hasChangedAfterSave && !isSaving) || (!!file && !isSaving))
        } else {
            setCanSave(false)
        }
    }, [initialContent, file, defaultValue, isSaving, hasChangedAfterSave, pdfLink])

    // Track editor content changes to enable Save after edit
    useEffect(() => {
        if (defaultValue === 'editor') {
            const hasContent = initialContent && !isEditorContentEmpty(initialContent)
            if (hasContent) {
                setHasChangedAfterSave(true)
            }
        }
        // Do not set for PDF mode
        // eslint-disable-next-line
    }, [initialContent])

    // Auto-save effect for content deletion
    useEffect(() => {
        if (isInitialLoad || defaultValue !== 'editor' || !initialContent) return

        const isEmpty = isEditorContentEmpty(initialContent)
        const currentHash = generateContentHash(initialContent)

        if (
            hasUserSaved &&
            wasContentNonEmptyWhenSaved &&
            isEmpty &&
            isEditorSaved &&
            previousContentHash !== currentHash &&
            currentHash !== generateContentHash(undefined)
        ) {
            autoSave()
        }
    }, [
        initialContent,
        defaultValue,
        isEditorSaved,
        previousContentHash,
        hasUserSaved,
        wasContentNonEmptyWhenSaved,
        isInitialLoad,
    ])

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
                `/${userRole}/${orgName}/courses/${courseId}/module/${content.moduleId}/chapter/${content.id}/assignment/${content.topicId}/preview`
            )
        }
    }

    const onFileUpload = async () => {
        if (!canEdit) return
        if (file) {
            if (file.type !== 'application/pdf') {
                return toast.error({
                    title: 'Invalid file type',
                    description: 'Only PDF files are allowed.',
                })
            }
            const formData = new FormData()
            formData.append('pdf', file, file.name)
            formData.append('title', title) 

            if (deadline) {
               formData.append('completionDate', convertToISO(deadline))
            }

            try {
                setIsLoading(true)
                await uploadPdf(content.moduleId, content.id, formData)
                setTitle(title) 
                setIsChapterUpdated(!isChapterUpdated)
                setIsPdfUploaded(true)
                setFile(null)
                setpdfLink('')
                setIsLoading(false)
                toast.success({
                    title: 'Success',
                    description: 'PDF uploaded successfully!',
                })
                getAssignmentContent()
                setCanSave(false)
            } catch (err: any) {
                console.error(err)
                toast.error({
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
                `/${userRole}/${orgName}/courses/${courseId}/module/${content.moduleId}/chapter/${content.id}/assignment/${content.topicId}/preview?pdf=true`
            )
        } else {
            toast.error({
                title: 'Failed',
                description: 'No PDF uploaded. Please upload one to preview.',
            })
        }
    }

    const onDeletePdfhandler = async () => {
        if (!canEdit) return
        setIsDeleteLoading(true)

        const deadlineDate = convertToISO(deadline)

        try {
            await editChapter(content.moduleId, content.id, {
                title: title,
                links: null,
                completionDate: deadlineDate,
            })
            toast.success({
                title: 'Success',
                description: 'PDF Deleted Successfully',
            })
            setIsPdfUploaded(false)
            setpdfLink(null)
            setIsDeleteLoading(false)
        } catch (err: any) {
            toast.error({
                title: 'Delete PDF failed',
                description:
                    err.response?.data?.message ||
                    err.message ||
                    'An error occurred.',
            })
            setIsDeleteLoading(false)
        }
    }

    if (isDataLoading) {
        return<AssignmentSkeletons/>
    }
    return (
        <ScrollArea className="h-screen max-h-[calc(100vh-120px)]">
            <div className="px-5">
                <>
                    {!canEdit && ( 
                        <PermissionAlert
                            alertOpen={alertOpen}
                            setAlertOpen={setAlertOpen}
                        />
                    )}
                    <div className={canEdit ? '' : 'pointer-events-none opacity-60'}>
                    <div className="w-full ">
                        <Form {...form}>
                            <form
                                id="myForm"
                                onSubmit={form.handleSubmit(
                                    editAssignmentContent
                                )}
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
                                                            setTitles(e.target.value)
                                                            setTitle(e.target.value)
                                                            form.setValue('title', e.target.value) // keep form in sync
                                                            field.onChange(e)
                                                            setHasChangedAfterSave(true)
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                            }
                                                        }}
                                                        placeholder="Untitled Assignment"
                                                        className="text-2xl font-bold border px-2 focus-visible:ring-0 placeholder:text-foreground"
                                                        disabled={!canEdit}
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
                                        onValueChange={(value) => {
                                            if (!canEdit) return
                                            setDefaultValue(value)
                                        }}
                                        value={defaultValue}
                                    >
                                        <TooltipProvider>
                                            <div className="flex gap-x-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <RadioGroupItem
                                                            value="editor"
                                                            disabled={!canEdit || !!pdfLink}
                                                            id="r1"
                                                            className="mt-1 text-foreground border-foreground"
                                                        />
                                                    </TooltipTrigger>
                                                    {pdfLink && (
                                                        <TooltipContent side="top">
                                                            You have uploaded a
                                                            PDF, so the editor
                                                            is now disabled
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                                <Label
                                                    htmlFor="r1"
                                                    className="font-light text-md text-foreground"
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
                                                            className="mt-1 text-foreground border-foreground"
                                                            disabled={
                                                                !canEdit ||
                                                                isEditorSaved
                                                            }
                                                        />
                                                    </TooltipTrigger>
                                                    {isEditorSaved && (
                                                        <TooltipContent side="top">
                                                            You have already
                                                            saved the
                                                            assignment, so PDF
                                                            upload is now
                                                            disabled
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                                <Label
                                                    htmlFor="r2"
                                                    className="font-light text-md text-foreground"
                                                >
                                                    Upload PDF
                                                </Label>
                                            </div>
                                        </TooltipProvider>
                                    </RadioGroup>

                                    <div className="bg-card text-foreground rounded-lg shadow-sm border">
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
                                                            const d =
                                                                field.value
                                                                    ? typeof field.value ===
                                                                      'string'
                                                                        ? field.value.split(
                                                                              ' '
                                                                          )[0]
                                                                        : field.value
                                                                    : null
                                                            let dateValue =
                                                                typeof field.value ===
                                                                    'string' &&
                                                                d
                                                                    ? parseISO(
                                                                          d
                                                                      )
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
                                                                                    className={`flex items-center justify-between w-full border border-input rounded-md bg-background px-3 py-2 text-sm text-muted-dark hover:border-primary ${
                                                                                        !field.value &&
                                                                                        'text-muted-foreground'
                                                                                    } ${
                                                                                        !canEdit
                                                                                            ? 'opacity-60 cursor-not-allowed'
                                                                                            : ''
                                                                                    }`}
                                                                                    style={
                                                                                        !canEdit
                                                                                            ? {
                                                                                                  pointerEvents:
                                                                                                      'none',
                                                                                              }
                                                                                            : undefined
                                                                                    }
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
                                                                                        setDeadline(date)
                                                                                        setHasChangedAfterSave(true)
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
                                                        preview={!canEdit}
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
                                                        disabled={!canEdit}
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
                                            type="submit"
                                            form="myForm"
                                            disabled={
                                                !canEdit ||
                                                !canSave ||
                                                isSaving ||
                                                !isValid
                                            }
                                        >
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </Button>
                                    ) : (
                                        <div>                                          

                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    if (file) {
                                                        onFileUpload();
                                                    } else {
                                                        // If no file, but title/deadline changed, call editAssignmentContent
                                                        if (canSave) {
                                                            const currentDeadline = form.getValues('startDate')
                                                            editAssignmentContent({
                                                                title: titles || title,
                                                                startDate: deadline,
                                                            });
                                                        }
                                                    }
                                                }}
                                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                                disabled={
                                                    !canEdit ||
                                                    loading ||
                                                    !canSave ||
                                                    disabledUploadButton
                                                }
                                            >
                                                {loading ? 'Saving...' : 'Save'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </div>
                    </div>
                </>
            </div>
        </ScrollArea>
    )
}

export default AddAssignent
