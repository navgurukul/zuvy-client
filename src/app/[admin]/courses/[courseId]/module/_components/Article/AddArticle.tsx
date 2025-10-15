import React, { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
// import '@\app\_components\editor\Tiptap.css'
import { Pencil } from 'lucide-react'
import useResponsiveHeight from '@/hooks/useResponsiveHeight'
import { getChapterUpdateStatus, getArticlePreviewStore } from '@/store/store'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'
import UploadArticle from './UploadPdf'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    EditorDocArcticle,
    AddArticleProps,
    ContentArticle,
} from '@/app/[admin]/courses/[courseId]/module/_components/Article/courseModuleArticleType'
import { BookOpenText } from 'lucide-react'

const AddArticle: React.FC<AddArticleProps> = ({
    content,
    courseId,
    articleUpdateOnPreview,
    setArticleUpdateOnPreview,
}) => {
    const heightClass = useResponsiveHeight()
    const router = useRouter()
    const [disabledUploadButton, setIsdisabledUploadButton] = useState(false)
    // state - FIXED: Use single title state for both modes
    const [title, setTitle] = useState('')
    const [isDataLoading, setIsDataLoading] = useState(true) // Add loading state
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const [defaultValue, setDefaultValue] = useState('editor')
    const [file, setFile] = useState<any>(null)
    const [ispdfUploaded, setIsPdfUploaded] = useState(false)
    const [pdfLink, setpdfLink] = useState<any>()
    const [loading, setIsLoading] = useState(false)
    const [deleteLoading, setIsDeleteLoading] = useState(false)
    const { setArticlePreviewContent } = getArticlePreviewStore()
    const [initialContent, setInitialContent] = useState<
        { doc: EditorDocArcticle } | undefined
    >()
    const [isEditorSaved, setIsEditorSaved] = useState(false)
    const hasFetched = useRef(false)
    const [hasEditorContent, setHasEditorContent] = useState(false)
    const [previousContentHash, setPreviousContentHash] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const [hasUserSaved, setHasUserSaved] = useState(false)
    const [wasContentNonEmptyWhenSaved, setWasContentNonEmptyWhenSaved] =
        useState(false)
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    // misc
    const formSchema = z.object({
        title: z.string()
        .min(2, { message: 'Title must be at least 2 characters long.' })
        .max(50, { message: 'You can enter up to 50 characters only.' }),
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        values: {
            title: title,
        },
        mode: 'onChange',
    })
    // NEW: Function to check if editor content is empty
    const isEditorContentEmpty = (content: any) => {
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
            if (item.type === 'paragraph' && item.content) {
                return item.content.some(
                    (textItem: any) =>
                        textItem.type === 'text' &&
                        textItem.text &&
                        textItem.text.trim().length > 0
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

    // IMPROVED: Auto-save function with better conditions
    const autoSave = async () => {
        if (isSaving) return // Prevent multiple simultaneous saves

        try {
            setIsSaving(true)
            const initialContentString = initialContent
                ? [JSON.stringify(initialContent)]
                : ''
            const data = {
                title,
                articleContent: initialContentString,
            }

            await api.put(
                `/Content/editChapterOfModule/${content.moduleId}?chapterId=${content.id}`,
                data
            )
            setArticleUpdateOnPreview(!articleUpdateOnPreview)
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

    const getArticleContent = async () => {
        try {
            setIsDataLoading(true)
            const response = await api.get(
                `/Content/chapterDetailsById/${content.id}?bootcampId=${courseId}&moduleId=${content.moduleId}&topicId=${content.topicId}`
            )
            const contentDetails = response?.data?.contentDetails?.[0]

            const link = contentDetails?.links?.[0]
            if (link) {
                setpdfLink(link)
                setDefaultValue('pdf')
                setIsPdfUploaded(true)
                setIsEditorSaved(false) // <-- PDF hai to editor saved false
            } else {
                setpdfLink(null)
                setDefaultValue('editor')
                setIsPdfUploaded(false)
                // --- Check if editor me content hai ---
                const data = contentDetails?.content
                let hasEditorContent = false
                if (data && data.length > 0) {
                    hasEditorContent = true
                    // If content exists on load, consider it as previously saved
                    setHasUserSaved(true)
                    setWasContentNonEmptyWhenSaved(true)
                }
                setIsEditorSaved(hasEditorContent)
            }

            // FIXED: Set title with fallback and ensure it's not empty
            const fetchedTitle = response.data.title || response.data.name || ''
            setTitle(fetchedTitle)

            const data = contentDetails?.content
            let parsedContent
            if (typeof data?.[0] === 'string') {
                parsedContent = JSON.parse(data)
            } else {
                parsedContent = { doc: data?.[0] }
            }

            setInitialContent(parsedContent)

            // NEW: Set initial content states
            setHasEditorContent(!isEditorContentEmpty(parsedContent))
            setPreviousContentHash(generateContentHash(parsedContent))
        } catch (error) {
            console.error('Error fetching article content:', error)
        } finally {
            setIsDataLoading(false)
            // Mark initial load as complete after a short delay
            setTimeout(() => setIsInitialLoad(false), 1000)
        }
    }

    const editArticleContent = async () => {
        try {
            setIsSaving(true)
            const initialContentString = initialContent
                ? [JSON.stringify(initialContent)]
                : ''
            const data = {
                title,
                articleContent: initialContentString,
            }

            await api.put(
                `/Content/editChapterOfModule/${content.moduleId}?chapterId=${content.id}`,
                data
            )
            setArticleUpdateOnPreview(!articleUpdateOnPreview)
            setIsChapterUpdated(!isChapterUpdated)
            setIsEditorSaved(!isEditorContentEmpty(initialContent))
            setIsEditorSaved(true)

            // IMPORTANT: Mark that user has manually saved and track if content was non-empty
            setHasUserSaved(true)
            setWasContentNonEmptyWhenSaved(
                !isEditorContentEmpty(initialContent)
            )

            // Update previous content hash
            setPreviousContentHash(generateContentHash(initialContent))

            toast.success({
                title: 'Success',
                description: 'Article Chapter Edited Successfully',
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
        if (content?.id && !hasFetched.current) {
            hasFetched.current = true
            getArticleContent()
        }
    }, [content?.id]) // More specific dependency

    // Reset isEditorSaved if PDF is uploaded or deleted
    useEffect(() => {
        if (ispdfUploaded) setIsEditorSaved(false)
    }, [ispdfUploaded])

    // Add this useEffect after your other useEffects
    useEffect(() => {
        // Skip if it's initial load or editor is not visible
        if (isInitialLoad || defaultValue !== 'editor' || !initialContent)
            return

        const isEmpty = isEditorContentEmpty(initialContent)
        const currentHash = generateContentHash(initialContent)

        setHasEditorContent(!isEmpty)
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

    function previewArticle() {
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
            setArticlePreviewContent(content)
            router.push(
                `/admin/courses/${courseId}/module/${content.moduleId}/chapter/${content.id}/article/${content.topicId}/preview`
            )
        }
    }

    function previewPdf() {
        if (ispdfUploaded) {
            setArticlePreviewContent(content)
            router.push(
                `/admin/courses/${courseId}/module/${content.moduleId}/chapter/${content.id}/article/${content.topicId}/preview?pdf=true`
            )
        } else {
            return toast.error({
                title: 'Failed',
                description: 'No PDF uploaded. Please upload one to preview.',
            })
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
            // FIXED: Use the same title state
            formData.append('title', title)

            try {
                setIsLoading(true)
                await api.post(
                    `/Content/curriculum/upload-pdf?moduleId=${content.moduleId}&chapterId=${content.id}`,
                    formData, // ← pass FormData directly
                    {
                        // OPTIONAL: axios will set the correct Content-Type boundary for you
                        headers: { 'Content-Type': 'multipart/form-data' },
                    }
                )
                setIsChapterUpdated(!isChapterUpdated)
                setIsdisabledUploadButton(false)

                // toast.success({
                //     title: 'Success',
                //     description: 'PDF uploaded successfully!',
                // })
                setTimeout(() => {
                    setIsPdfUploaded(true)
                    setpdfLink('')
                    getArticleContent()
                    setIsLoading(false)
                    toast.success({
                        title: 'Success',
                        description: 'PDF uploaded successfully!',
                    })
                }, 1000) //
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

    async function onDeletePdfhandler() {
        setIsDeleteLoading(true)
        await api
            .put(
                `/Content/editChapterOfModule/${content.moduleId}?chapterId=${content.id}`,
                { title: title, links: null }
            )
            .then((res) => {
                toast.success({
                    title: 'Success',
                    description: 'PDF Deleted Successfully',
                })
                setIsPdfUploaded(false)
                setIsDeleteLoading(false)
                setpdfLink(null)
            })
            .catch((err: any) => {
                toast.error({
                    title: 'Delete PDF failed',
                    description:
                        err.response?.data?.message ||
                        err.message ||
                        'An error occurred.',
                })
                setIsDeleteLoading(false)
            })
    }

    if (isDataLoading) {
        return (
            <div className="px-5">
                <div className="w-full flex justify-center items-center py-8">
                    <div className="animate-pulse">
                        Loading Chapter details...
                    </div>
                </div>
            </div>
        )
    }

    return (
        <ScrollArea className="h-screen max-h-[calc(100vh-100px)]">
        <div className="px-5 flex-1 overflow-y-auto space-y-2 pr-2">
            <div className="w-full ">
                {/* <div className="flex justify-between items-center"> */}
                {/* <div className="w-full flex justify-start align-middle items-center relative"> */}
                {/* <p className="text-2xl font-bold">{title}</p> */}
                <Form {...form}>
                    <form
                        id="myForm"
                        onSubmit={form.handleSubmit(editArticleContent)}
                        className="mr-4 mb-1"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormControl>
                                        <>
                                            <Input
                                                {...field}
                                                value={title} // Explicitly set value
                                                onChange={(e) => {
                                                      setTitle(e.target.value)
                                                       field.onChange(e)
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                    }
                                                }}
                                                placeholder={
                                                    defaultValue === 'editor'
                                                        ? 'Untitled Article'
                                                        : 'Untitled PDF'
                                                }
                                                className="text-2xl font-bold border px-2 focus-visible:ring-0 placeholder:text-foreground"
                                            />
                                        </>
                                    </FormControl>
                                    <FormMessage className="h-5" />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                {/* {!title && (
                            <Pencil
                                fill="true"
                                fillOpacity={0.4}
                                size={20}
                                className="absolute text-gray-100 pointer-events-none mt-1 right-5"
                            />
                        )} */}
                {/* </div> */}

                {/* <div className="flex justify-end mt-5">
                        <div className="flex items-center justify-between mr-2">
                            {defaultValue ===
                                'editor' ? (
                                <div
                                    id="previewArticle"
                                    onClick={
                                        previewArticle
                                    }
                                    className="flex  hover:bg-gray-300 rounded-md p-1 cursor-pointer"
                                >
                                    <Eye size={18} />
                                    <h6 className="ml-1 text-sm">
                                        Preview Article
                                    </h6>
                                </div>
                            ) : (
                                <div
                                    id="previewArticle"
                                    onClick={previewPdf}
                                    className="flex  hover:bg-gray-300 rounded-md p-1 cursor-pointer"
                                >
                                    <Eye size={18} />
                                    <h6 className="ml-1 text-sm">
                                        Preview PDF
                                    </h6>
                                </div>
                            )}
                        </div>
                    </div> */}
                {/* </div> */}
                <div className="flex items-center gap-2 ml-1 pb-4">
                    <BookOpenText size={20} className="transition-colors" />
                    <p className="text-muted-foreground">Article</p>
                </div>

                <div className="ml-1 mr-4">
                    <RadioGroup
                        className="flex items-center gap-x-6"
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
                                            className="mt-1 text-black border-black"
                                        />
                                    </TooltipTrigger>
                                    {pdfLink && (
                                        <TooltipContent side="top">
                                            You have uploaded a PDF, so the
                                            editor is now disabled
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
                                            You have already saved the
                                            assignment, so PDF upload is now
                                            disabled
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
                                Article Details
                            </p>
                            {/* <Form {...form}>
                                <form
                                    id="myForm"
                                    onSubmit={form.handleSubmit(
                                        editArticleContent
                                    )}
                                    className=""
                                >
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormControl>
                                                    <>
                                                        <p className="flex text-left text-lg mt-4">
                                                            Title
                                                        </p>
                                                        <Input
                                                            {...field}
                                                            value={title} // Explicitly set value
                                                            onChange={(e) => {
                                                                // FIXED: Always update the same title state
                                                                setTitle(
                                                                    e.target
                                                                        .value
                                                                )
                                                                field.onChange(
                                                                    e
                                                                )
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    e.key ===
                                                                    'Enter'
                                                                ) {
                                                                    e.preventDefault()
                                                                }
                                                            }}
                                                            placeholder={
                                                                defaultValue ===
                                                                'editor'
                                                                    ? 'Untitled Article'
                                                                    : 'Untitled PDF'
                                                            }
                                                            className="text-2xl font-bold border px-2 focus-visible:ring-0 placeholder:text-foreground"
                                                            // className="text-md p-2 focus-visible:ring-0 placeholder:text-foreground"
                                                            // className="pl-1 pr-8 text-xl text-gray-600 text-left font-semibold capitalize placeholder:text-gray-400 placeholder:font-bold border-x-0 border-t-0 border-b-2 border-gray-400 border-dashed focus:outline-none"
                                                        />
                                                    </>
                                                </FormControl>
                                                <FormMessage className="h-5" />
                                            </FormItem>
                                        )}
                                    />
                                </form>
                            </Form> */}
                            {defaultValue === 'editor' && (
                                <div className="mt-2 text-start">
                                    {/* <p className="flex text-left text-lg mt-6 mb-2">
                                        Description
                                    </p> */}
                                    <RemirrorTextEditor
                                        initialContent={initialContent}
                                        setInitialContent={setInitialContent}
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
                                        isPdfUploaded={ispdfUploaded}
                                        pdfLink={pdfLink}
                                        setIsPdfUploaded={setIsPdfUploaded}
                                        onDeletePdfhandler={onDeletePdfhandler}
                                        setDisableButton={
                                            setIsdisabledUploadButton
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-5 mr-3">
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
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </ScrollArea>
    )
}

export default AddArticle
