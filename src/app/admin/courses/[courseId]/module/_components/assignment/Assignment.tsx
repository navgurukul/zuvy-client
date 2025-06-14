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
import '@/app/_components/editor/Tiptap.css'
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface ContentDetail {
    title: string
    description: string | null
    links: string | null
    file: string | null
    content: string | null
}

interface Content {
    id: number
    moduleId: number
    topicId: number
    order: number
    contentDetails: ContentDetail[]
}

type EditorDoc = {
    type: string
    content: any[]
}

interface AssignmentProps {
    content: Content
    courseId: any
    assignmentUpdateOnPreview: boolean
    setAssignmentUpdateOnPreview: React.Dispatch<React.SetStateAction<boolean>> // Correct type for setter
}

const AddAssignent = ({
    content,
    courseId,
    assignmentUpdateOnPreview,
    setAssignmentUpdateOnPreview,
}: any) => {
    // misc

    const formSchema = z.object({
        title: z.string(),
        startDate: z.date({
            required_error: 'A start date is required.',
        }),
    })

    const router = useRouter()
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
        { doc: EditorDoc } | undefined
    >()
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [hasEditorContent, setHasEditorContent] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [previousContentHash, setPreviousContentHash] = useState('')
    const hasLoaded = useRef(false)

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

    const isEditorContentEmpty = (content: any) => {
        if (!content || !content.doc || !content.doc.content) return true

        const docContent = content.doc.content
        if (docContent.length === 0) return true

        // Check if only empty paragraphs
        if (docContent.length === 1 &&
            docContent[0].type === 'paragraph' &&
            (!docContent[0].content || docContent[0].content.length === 0)) {
            return true
        }

        // Check if all content is empty
        const hasRealContent = docContent.some((item: any) => {
            if (item.type === 'paragraph' && item.content) {
                return item.content.some((textItem: any) =>
                    textItem.type === 'text' && textItem.text && textItem.text.trim().length > 0
                )
            }
            return item.type !== 'paragraph' // Non-paragraph content is considered real content
        })

        return !hasRealContent
    }

    // NEW: Function to generate content hash for comparison
    const generateContentHash = (content: any) => {
        return JSON.stringify(content)
    }

    // NEW: Auto-save function
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

            toast({
                title: 'Auto-saved',
                description: 'Assignment content auto-saved successfully',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
        } catch (error: any) {
            console.error('Auto-save failed:', error)
        } finally {
            setIsSaving(false)
        }
    }
    const getAssignmentContent = async () => {
        setIsDataLoading(true) 
        try {
            const response = await api.get(
                `/Content/chapterDetailsById/${content.id}`
            )

            setDeadline(response.data.completionDate)
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
                }
                setIsEditorSaved(hasEditorContent)
            }
            if (typeof contentDetails.content[0] === 'string') {
                setInitialContent(JSON.parse(contentDetails.content[0]))
            } else {
                const jsonData = { doc: contentDetails.content[0] }
                setInitialContent(jsonData)
            }
        } catch (error) {
            console.error('Error fetching assignment content:', error)
        } finally {
            setIsDataLoading(false)
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
                (
                    initialContent.doc.content.length === 1 &&
                    initialContent.doc.content[0].type === 'paragraph' &&
                    !initialContent.doc.content[0].content
                )
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

    // Jab assignment save ho, isEditorSaved true karo
    const editAssignmentContent = async (data: any) => {
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
            setIsEditorSaved(true) // <-- Add this line

            setPreviousContentHash(generateContentHash(initialContent))

            toast({
                title: 'Success',
                description: 'Assignment Chapter Edited Successfully',
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

    useEffect(() => {
        if (defaultValue === 'editor' && initialContent) {
            const isEmpty = isEditorContentEmpty(initialContent)
            const currentHash = generateContentHash(initialContent)

            setHasEditorContent(!isEmpty)

            // Auto-save logic: if content becomes empty and it was previously saved
            if (isEmpty && isEditorSaved && previousContentHash !== currentHash) {
                autoSave()
            }
        }
    }, [initialContent, defaultValue, isEditorSaved, previousContentHash])

    const previewAssignment = () => {
        if (content?.contentDetails[0]?.content?.length > 0) {
            setAssignmentPreviewContent(content)
            router.push(
                `/admin/courses/${courseId}/module/${content.moduleId}/chapter/${content.id}/assignment/${content.topicId}/preview`
            )
        } else {
            return toast({
                title: 'Cannot Preview',
                description: 'Nothing to Preview please save some content',
                className:
                    'border border-red-500 text-red-500 text-left w-[90%] capitalize',
            })
        }
    }

    const onFileUpload = async () => {
        if (file) {
            if (file.type !== 'application/pdf') {
                return toast({
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

                toast({
                    title: 'Success',
                    description: 'PDF uploaded successfully!',
                    className:
                        'fixed bottom-4 right-4 text-start text-black capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })
                setIsdisabledUploadButton(false)

                setTimeout(() => {
                    setIsPdfUploaded(true)
                    setpdfLink('')
                    getAssignmentContent()
                }, 1000) //
            } catch (err: any) {
                console.error(err)
                toast({
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
                `/admin/courses/${courseId}/module/${content.moduleId}/chapter/${content.id}/assignment/${content.topicId}/preview?pdf=true`
            )
        } else {
            toast({
                title: 'Failed',
                description: 'No PDF uploaded. Please upload one to preview.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                variant: 'destructive',
            })
        }
    }

    const onDeletePdfhandler = async () => {
        setIsLoading(true)
        await api
            .put(
                `/Content/editChapterOfModule/${content.moduleId}?chapterId=${content.id}`,
                { title: title, links: null }
            )
            .then((res) => {
                toast({
                    title: 'Success',
                    description: 'PDF Deleted Successfully',
                    className:
                        'fixed bottom-4 right-4 text-start text-black capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })
                setIsPdfUploaded(false)
                setpdfLink(null)
                setDefaultValue('editor')
                setIsEditorSaved(false) // <-- Add this line
            })
            .catch((err: any) => {
                toast({
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
                    <div className="animate-pulse">Loading assignment details...</div>
                </div>
            </div>
        )
    }
    return (
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
                                            <div className="flex justify-between items-center">
                                                <div className="w-2/6 flex justify-center align-middle items-center relative">
                                                    <Input
                                                        {...field}
                                                        onChange={(e) => {
                                                            setTitles(
                                                                e.target.value
                                                            )
                                                            field.onChange(e)
                                                        }}
                                                        placeholder="Untitled Assignment"
                                                        className="pl-1 pr-8 text-xl text-left font-semibold capitalize placeholder:text-gray-400 placeholder:font-bold border-x-0 border-t-0 border-b-2 border-gray-400 border-dashed focus:outline-none"
                                                        autoFocus
                                                    />
                                                    {!titles && ( // Show pencil icon only when the title is empty
                                                        <Pencil
                                                            fill="true"
                                                            fillOpacity={0.4}
                                                            size={20}
                                                            className="absolute text-gray-100 pointer-events-none mt-1 right-5"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex justify-end mt-5">
                                                    <div className="flex items-center justify-between mr-2">
                                                        {defaultValue === 'editor' ? (
                                                            <div
                                                                id="previewAssignment"
                                                                onClick={previewAssignment}
                                                                className="flex hover:bg-gray-300 rounded-md p-1 cursor-pointer"
                                                            >
                                                                <Eye size={18} />
                                                                <h6 className="ml-1 text-sm">
                                                                    Preview Assignment
                                                                </h6>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                id="previewAssignment"
                                                                onClick={previewPdf}
                                                                className={`flex hover:bg-gray-300 rounded-md p-1 cursor-pointer ${
                                                                    !ispdfUploaded
                                                                    ? 'opacity-50 pointer-events-none'
                                                                    : ''
                                                                    }`}
                                                            >
                                                                <Eye size={18} />
                                                                <h6 className="ml-1 text-sm">
                                                                    Preview PDF
                                                                </h6>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {defaultValue === 'editor' ? (
                                                        <Button
                                                            type="submit"
                                                            form="myForm"
                                                            disabled={!hasEditorContent || isSaving}
                                                        >
                                                            {isSaving ? 'Saving...' : 'Save'}
                                                        </Button>
                                                    ) : (
                                                        <div>
                                                            <Button
                                                                type="button"
                                                                onClick={
                                                                    onFileUpload
                                                                }
                                                                disabled={!disabledUploadButton}
                                                            >
                                                                Upload PDF
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="h-5" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => {
                                    const d = field.value
                                        ? typeof field.value === 'string'
                                            ? field.value.split(' ')[0]
                                            : field.value
                                        : null
                                    let dateValue =
                                        typeof field.value === 'string' && d
                                            ? parseISO(d)
                                            : field.value
                                    return (
                                        <FormItem className="flex flex-col justify-start gap-x-2 gap-y-4 text-left">
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
                                                            className={`w-1/6  text-left font-normal ${
                                                                !field.value &&
                                                                'text-muted-foreground'
                                                                }`}
                                                        >
                                                            {dateValue
                                                                ? format(
                                                                    dateValue,
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
                                    )
                                }}
                            />
                        </form>
                    </Form>
                </div>
                <div className="">
                    <RadioGroup
                        className="flex items-center gap-x-6 mt-4"
                        onValueChange={(value) => setDefaultValue(value)}
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
                                            className="mt-1"
                                        />
                                    </TooltipTrigger>
                                    {pdfLink && (
                                        <TooltipContent side="top">
                                            You’ve uploaded a PDF, so the editor is now disabled
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
                                            className="mt-1"
                                            disabled={isEditorSaved}
                                        />
                                    </TooltipTrigger>
                                    {isEditorSaved && (
                                        <TooltipContent side="top">
                                            You’ve already saved the assignment, so PDF upload is now disabled
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
                    {defaultValue === 'editor' && !pdfLink && ( // <-- PDF link nahi hai tabhi editor dikhao
                        <div className="mt-2 text-start">
                            <RemirrorTextEditor
                                initialContent={initialContent}
                                setInitialContent={setInitialContent}
                            />
                        </div>
                    )}
                    {defaultValue === 'pdf' && (
                        <UploadArticle
                            loading={loading}
                            file={file}
                            setFile={setFile}
                            className=""
                            isPdfUploaded={ispdfUploaded}
                            pdfLink={pdfLink}
                            setIsPdfUploaded={setIsPdfUploaded}
                            onDeletePdfhandler={onDeletePdfhandler}
                            setDisableButton={setIsdisabledUploadButton}
                        />
                    )}
                </div>
            </>
        </div>
    )
}

export default AddAssignent
