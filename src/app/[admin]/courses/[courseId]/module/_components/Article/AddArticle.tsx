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
import useResponsiveHeight from '@/hooks/useResponsiveHeight'
import { getChapterUpdateStatus, getArticlePreviewStore, getUser } from '@/store/store'
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
import useEditChapter from '@/hooks/useEditChapter'
import useUploadPdf from '@/hooks/useUploadPdf'
import useGetChapterDetails from '@/hooks/useGetChapterDetails'
import {ArticleSkeletons} from '@/app/[admin]/courses/[courseId]/_components/adminSkeleton'
import PermissionAlert from '@/app/_components/PermissionAlert'

const AddArticle: React.FC<AddArticleProps> = ({
    content,
    courseId,
    articleUpdateOnPreview,
    setArticleUpdateOnPreview,
    canEdit = true,
}) => {
    const heightClass = useResponsiveHeight()
    const router = useRouter()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const [disabledUploadButton, setIsdisabledUploadButton] = useState(false)
    // state - FIXED: Use single title state for both modes
    const [title, setTitle] = useState('')
    const [isDataLoading, setIsDataLoading] = useState(true) 
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const [defaultValue, setDefaultValue] = useState('editor')
    const [file, setFile] = useState<any>(null)
    const [ispdfUploaded, setIsPdfUploaded] = useState(false)
    const [pdfLink, setpdfLink] = useState<any>()
    const [hasNewPdfToSave, setHasNewPdfToSave] = useState(false)
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
    const [originalTitle, setOriginalTitle] = useState('')

    const [hasUserSaved, setHasUserSaved] = useState(false)
    const [wasContentNonEmptyWhenSaved, setWasContentNonEmptyWhenSaved] =
        useState(false)
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const { editChapter } = useEditChapter()
    const { uploadPdf, loading: uploadLoading } = useUploadPdf()
    const { getChapterDetails, loading: chapterLoading } = useGetChapterDetails()
    const [alertOpen, setAlertOpen] = useState(!canEdit)
    const [hasChangedAfterSave, setHasChangedAfterSave] = useState(false)

    const hasLoaded = useRef(false)

    // misc
    const formSchema = z.object({
        title: z
            .string()
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
    const isEditorContentEmpty = (content: any): boolean => {
        if (!content) return true
        
        // Handle content with or without doc wrapper
        const docContent = content.doc?.content || content.content
        
        if (!docContent || docContent.length === 0) return true

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

            await editChapter(content.moduleId, content.id, data)

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
            const response = await getChapterDetails({
                chapterId: content.id,
                bootcampId: courseId,
                moduleId: content.moduleId,
                topicId: content.topicId,
            })
            const contentDetails = response?.data?.contentDetails?.[0]

            const link = contentDetails?.links?.[0]
            // setIsDataLoading(false)
            if (link) {
                setpdfLink(link)
                setDefaultValue('pdf')
                setIsPdfUploaded(true)
                setIsEditorSaved(false) 
            } else {
                setpdfLink(null)
                setDefaultValue('editor')
                setIsPdfUploaded(false)
                // --- Check if editor me content hai ---
                const data = contentDetails?.content
                let hasEditorContent = false
                if (data && data.length > 0) {
                    hasEditorContent = true
                    setHasUserSaved(true)
                    setWasContentNonEmptyWhenSaved(true)
                }
                setIsEditorSaved(hasEditorContent)
            }
            const fetchedTitle = response.data.title || response.data.name || ''
            setTitle(fetchedTitle)
            setOriginalTitle(fetchedTitle)

            const data = contentDetails?.content
            let parsedContent
            if (data && data.length > 0) {
                if (typeof data[0] === 'string') {
                    parsedContent = JSON.parse(data[0])
                } else {
                    parsedContent = data[0]
                }
            } else {
                // Empty content - create default empty doc structure
                parsedContent = undefined
            }

            setInitialContent(parsedContent)

            // NEW: Set initial content states
            setHasEditorContent(!isEditorContentEmpty(parsedContent ? { doc: parsedContent } : undefined))
            setPreviousContentHash(generateContentHash(parsedContent))
            
        } catch (error) {
            console.error('Error fetching article content:', error)
        } finally {
            setIsDataLoading(false)
            setTimeout(() => setIsInitialLoad(false), 500)
        }
    }

    const editArticleContent = async () => {
        if (!canEdit) {
            return
        }
        try {
            setIsSaving(true)
            const initialContentString = initialContent
                ? [JSON.stringify(initialContent)]
                : ''
            const data = {
                title,
                articleContent: initialContentString,
            }

            await editChapter(content.moduleId, content.id, data)

            setArticleUpdateOnPreview(!articleUpdateOnPreview)
            setIsChapterUpdated(!isChapterUpdated)
            setIsEditorSaved(true)

            // IMPORTANT: Mark that user has manually saved and track if content was non-empty
            setHasUserSaved(true)
            setWasContentNonEmptyWhenSaved(
                !isEditorContentEmpty(initialContent)
            )

            // Update previous content hash
            setPreviousContentHash(generateContentHash(initialContent))
            setOriginalTitle(title)
            setHasChangedAfterSave(false)
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
    }, [content?.id]) 


    // Reset isEditorSaved if PDF is uploaded or deleted
    useEffect(() => {
        if (ispdfUploaded) setIsEditorSaved(false)
    }, [ispdfUploaded])

    // FIXED: Update hasEditorContent whenever initialContent changes
    useEffect(() => {
        if (!isInitialLoad && initialContent) {
            const currentHash = generateContentHash(initialContent)
            const hasContent = !isEditorContentEmpty(initialContent)
            console.log('Content check:', hasContent, initialContent)
            console.log('Previous hash:', previousContentHash)
            console.log('Current hash:', currentHash)
            console.log('Hashes equal?', previousContentHash === currentHash)
            setHasEditorContent(hasContent)

            // Check if content changed from last saved version
            // Only check if previousContentHash is set (not empty string)
            if (previousContentHash !== '' && currentHash !== previousContentHash) {
                console.log('Content changed - enabling save button')
                setHasChangedAfterSave(true) // Enable button
            }
        }
    }, [initialContent, isInitialLoad, previousContentHash])

    // NEW: Enable Save button when title is changed (unsaved)
    useEffect(() => {
        if (!isInitialLoad) {
            const titleChanged = title.trim() !== originalTitle.trim()
            if (titleChanged && form.formState.isValid) {
                setHasChangedAfterSave(true)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, originalTitle, isInitialLoad])

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
                `/${userRole}/courses/${courseId}/module/${content.moduleId}/chapter/${content.id}/article/${content.topicId}/preview`
            )
        }
    }

    function previewPdf() {
        if (ispdfUploaded) {
            setArticlePreviewContent(content)
            router.push(
                `/${userRole}/courses/${courseId}/module/${content.moduleId}/chapter/${content.id}/article/${content.topicId}/preview?pdf=true`
            )
        } else {
            return toast.error({
                title: 'Failed',
                description: 'No PDF uploaded. Please upload one to preview.',
            })
        }
    }

    const onFileUpload = async () => {
        if (!canEdit) {
            return
        }

        // Case 1: A new PDF is selected -> upload PDF + title
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

            try {
                setIsLoading(true)
                await uploadPdf(content.moduleId, content.id, formData)
                setIsChapterUpdated(!isChapterUpdated)

                setTimeout(() => {
                    setIsPdfUploaded(true)
                    setpdfLink('')
                    setFile(null)
                    setHasNewPdfToSave(false)
                    setOriginalTitle(title)
                    getArticleContent()
                    setIsLoading(false)
                    toast.success({
                        title: 'Success',
                        description: 'PDF uploaded successfully!',
                    })
                }, 1000)
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
            return
        }

        // Case 2: No new PDF, but title changed -> update title only
        const titleChanged = title.trim() !== originalTitle.trim()
        if (titleChanged) {
            try {
                setIsLoading(true)
                await editChapter(content.moduleId, content.id, { title })
                setOriginalTitle(title)
                setIsLoading(false)
                toast.success({
                    title: 'Success',
                    description: 'Title updated successfully',
                })
            } catch (err: any) {
                console.error(err)
                setIsLoading(false)
                toast.error({
                    title: 'Update failed',
                    description:
                        err.response?.data?.message ||
                        err.message ||
                        'An error occurred.',
                })
            }
            return
        }

        // Case 3: Nothing to save
        toast.info({
            title: 'No changes',
            description: 'There are no changes to save.',
        })
    }

    async function onDeletePdfhandler() {
        if (!canEdit) {
            return
        }
        setIsDeleteLoading(true)
        try {
            await editChapter(content.moduleId, content.id, {
                title: title,
                links: null,
            })
            toast.success({
                title: 'Success',
                description: 'PDF Deleted Successfully',
            })
            setIsPdfUploaded(false)
            setIsDeleteLoading(false)
            setpdfLink(null)
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

    // if (isDataLoading) {
    //     return <ArticleSkeletons/>
    // }

    return (
        <ScrollArea className="h-screen max-h-[calc(100vh-100px)]">
            <div className="px-5 flex-1 overflow-y-auto space-y-2 pr-2">
                {!canEdit && (
                    <PermissionAlert
                        alertOpen={alertOpen}
                        setAlertOpen={setAlertOpen}
                    />
                )}
                <div className={canEdit ? '' : 'pointer-events-none opacity-60'}>
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
                                                            defaultValue ===
                                                            'editor'
                                                                ? 'Untitled Article'
                                                                : 'Untitled PDF'
                                                        }
                                                        className="text-lg  font-semibold border px-2 focus-visible:ring-0 placeholder:text-foreground"
                                                        disabled={!canEdit}
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
                                onValueChange={(value) =>
                                    canEdit && setDefaultValue(value)
                                }
                                value={defaultValue}
                            >
                                <TooltipProvider>
                                    <div className="flex gap-x-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <RadioGroupItem
                                                    value="editor"
                                                    disabled={!!pdfLink || !canEdit}
                                                    id="r1"
                                                    className="mt-1 text-foreground border-foreground"
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
                                                    disabled={isEditorSaved || !canEdit}
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
                                            className="font-light text-md text-foreground"
                                        >
                                            Upload PDF
                                        </Label>
                                    </div>
                                </TooltipProvider>
                            </RadioGroup>

                            <div className="bg-card rounded-lg shadow-sm border">
                                <div className="p-6">
                                    <p className="text-xl text-start text-foreground font-semibold">
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
                                                setFile={(newFile:any) => {
                                                    setFile(newFile)
                                                    setHasNewPdfToSave(!!newFile)
                                                }}
                                                className=""
                                                isPdfUploaded={ispdfUploaded}
                                                pdfLink={pdfLink}
                                                setIsPdfUploaded={setIsPdfUploaded}
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

                        <div className="flex justify-end mt-5 mr-3">
                            {defaultValue === 'editor' ? (
                                <Button
                                    type="submit"
                                    form="myForm"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                    disabled={
                                        !canEdit ||
                                        isSaving || 
                                        !form.formState.isValid || 
                                        !hasEditorContent ||
                                        !hasChangedAfterSave
                                    }
                                >
                                    {isSaving ? 'Saving...' : 'Save'}
                                </Button>
                            ) : (
                                <div>
                                    <Button
                                        type="button"
                                        onClick={onFileUpload}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        disabled={
                                            !canEdit ||
                                            loading ||
                                            !form.formState.isValid ||
                                            (!hasNewPdfToSave && title.trim() === originalTitle.trim()) ||
                                            disabledUploadButton
                                        }
                                    >
                                        {loading ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ScrollArea>
    )
}

export default AddArticle
