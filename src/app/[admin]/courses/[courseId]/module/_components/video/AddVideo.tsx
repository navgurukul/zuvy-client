'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import VideoEmbed from '@/app/[admin]/courses/[courseId]/module/_components/video/VideoEmbed'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ArrowUpRightSquare, X, Pencil, Eye, Video } from 'lucide-react'
import PreviewVideo from '@/app/[admin]/courses/[courseId]/module/_components/video/PreviewVideo'
import { getChapterUpdateStatus, getVideoPreviewStore, getUser } from '@/store/store'
import { useRouter } from 'next/navigation'
import {
    AddVideoProps,
    EditChapterResponse,
} from '@/app/[admin]/courses/[courseId]/module/_components/video/ModuleVideoType'
import { getEmbedLink, isLinkValid } from '@/utils/admin'
import useEditChapter from '@/hooks/useEditChapter'

// import useResponsiveHeight from '@/hooks/useResponsiveHeight'

// Helper function to convert links to embed-friendly format

const formSchema = z.object({
    videoTitle: z
        .string()
        .min(2, {
            message: 'Video Title must be at least 2 characters.',
        })
        .max(50, { message: 'You can enter up to 50 characters only.' }),

    description: z.string().min(4, {
        message: 'Description must be at least 4 characters.',
    }),
    links: z.string().refine(
        (value) => {
            const links = value.split(',').map((link) => link.trim())
            return links.every((link) => isLinkValid(link))
        },
        {
            message: 'Only YouTube and Google Drive links are allowed.',
        }
    ),
})
const AddVideo: React.FC<AddVideoProps> = ({
    moduleId,
    courseId,
    content,
    fetchChapterContent,
}) => {
    // const heightClass = useResponsiveHeight()
    const router = useRouter()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showPreview, setShowPreview] = useState<boolean>(false)
    const [showVideoBox, setShowVideoBox] = useState<boolean>(true)
    const [videoTitle, setVideoTitle] = useState('')
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const { setVideoPreviewContent } = getVideoPreviewStore()
    const [isDataLoading, setIsDataLoading] = useState(true)
    const hasLoaded = useRef(false)
    const { editChapter, loading: editChapterLoading } = useEditChapter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            videoTitle: '',
            description: '',
            links: '',
        },
        values: {
            videoTitle: content?.contentDetails?.[0]?.title ?? '',
            description: content?.contentDetails?.[0]?.description ?? '',
            links: content?.contentDetails?.[0]?.links?.[0] ?? '',
        },
    })

    const {
        formState: { isDirty, isValid, isSubmitting },
    } = form

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const modifiedLink = getEmbedLink(values.links)

        const convertedObj = {
            title: values.videoTitle,
            description: values.description,
            links: [modifiedLink],
        }

        try {
            const res = await editChapter(moduleId, content.id, convertedObj)
            toast.success({
                title: res.data.status,
                description: res.data.message,
            })
            form.reset(values) // to reset the dirty state
            setShowVideoBox(true)
            fetchChapterContent(content.id, content.topicId)
            setIsChapterUpdated(!isChapterUpdated)
        } catch (error) {
            toast.error({
                title: 'Error',
                description: "Couldn't Update the Chapter Module",
            })
        }
    }

    useEffect(() => {
        if (hasLoaded.current) return
        hasLoaded.current = true
        setIsDataLoading(true)

        if (content?.contentDetails?.[0]?.links?.[0]) {
            form.reset({
                videoTitle: content?.contentDetails?.[0]?.title ?? '',
                description: content?.contentDetails?.[0]?.description ?? '',
                links: content?.contentDetails?.[0]?.links?.[0] ?? '',
            })
        } else {
            setShowVideoBox(false)
        }
        setVideoTitle(content?.contentDetails?.[0]?.title ?? '')
        setIsDataLoading(false)
    }, [content?.contentDetails, form])

    const handleClose = async () => {
        setShowVideoBox(false)
        form.setValue('links', '')
        form.setValue('description', '')

        try {
            await editChapter(moduleId, content.id, {
                description: '',
                links: [''],
            })
        } catch (error) {
            console.error('Error updating chapter:', error)
        }
    }
    const handlePreviewClick = () => {
        // Check if title is empty or invalid
        if (
            !form.watch('videoTitle') ||
            form.watch('videoTitle').trim().length === 0
        ) {
            toast.info({
                title: 'No Title',
                description: 'Please provide a title for the video to preview.',
            })
            return
        }

        // Check if links are empty or invalid
        const links = form.watch('links').trim()
        if (!links || !isLinkValid(links)) {
            toast.info({
                title: 'Invalid Link',
                description: 'Please provide a valid video link to preview.',
            })
            return
        }

        setShowPreview(true)
    }

    function previewVideo() {
        if (isDirty) {
            toast.info({
                title: 'Unsaved Changes',
                description: 'Please Save the chapter to preview.',
            })
            return
        }

        if (content?.contentDetails[0]?.links) {
            setVideoPreviewContent(content)
            router.push(
                `/${userRole}/courses/${courseId}/module/${moduleId}/chapter/${content.id}/video/${content.topicId}/preview`
            )
        } else {
            toast.info({
                title: 'No Video Uploaded',
                description: 'Please Save the chapter to preview.',
            })
        }
    }

    if (isDataLoading) {
        return (
            <div className="px-5">
                <div className="w-full flex justify-center items-center py-8">
                    <div className="animate-pulse">Loading Quiz details...</div>
                </div>
            </div>
        )
    }

    return (
        <ScrollArea className="h-dvh pr-4 pb-24" type="hover">
            <ScrollBar className="h-dvh" orientation="vertical" />
            <div className="mx-auto w-full max-w-[52rem]">
                {/* {showPreview ? (
                    <PreviewVideo
                        content={content}
                        setShowPreview={setShowPreview}
                    />
                ) : ( */}
                <>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="videoTitle"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormControl>
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    required
                                                    {...field}
                                                    onChange={(e) => {
                                                        setVideoTitle(
                                                            e.target.value
                                                        ) // Update the local state
                                                        field.onChange(e)
                                                    }}
                                                    placeholder={
                                                        'Untitled Video'
                                                    }
                                                    className="text-2xl font-bold border px-2 focus-visible:ring-0 placeholder:text-foreground"
                                                />
                                                {/* {!videoTitle && (
                                                    <Pencil
                                                        fill="true"
                                                        fillOpacity={0.4}
                                                        size={20}
                                                        className="absolute text-gray-100 pointer-events-none top-1/2 right-3 -translate-y-1/2"
                                                    />
                                                )} */}
                                            </div>
                                        </FormControl>

                                        {/* Preview section */}
                                        {/* <div
                                            id="previewVideo"
                                            onClick={previewVideo}
                                            className="flex w-[80px] hover:bg-gray-300 rounded-md p-1 cursor-pointer text-gray-600"
                                        >
                                            <Eye size={18} />
                                            <h6 className="ml-1 text-sm">
                                                Preview
                                            </h6>
                                        </div> */}
                                        <div className="flex items-center gap-2">
                                            <Video
                                                size={20}
                                                className="transition-colors"
                                            />
                                            <p className="text-muted-foreground">
                                                Video
                                            </p>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Video Content Section */}
                            <div className="bg-card rounded-lg shadow-sm border">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 text-start text-foreground">
                                        Video Content
                                    </h3>

                                    <div className="relative">
                                        {showVideoBox && (
                                            <VideoEmbed
                                                title={
                                                    content?.contentDetails?.[0]
                                                        ?.title || ''
                                                }
                                                src={getEmbedLink(
                                                    content?.contentDetails?.[0]
                                                        ?.links?.[0] || ''
                                                )}
                                            />
                                        )}
                                    </div>

                                    {/* <div className="mt-6">
                                        <p className="font-medium text-start text-2xl mb-2">
                                            Recording available for the live
                                            class
                                        </p>
                                    </div> */}
                                </div>
                            </div>

                            {/* <div className="flex justify-start items-start">
                                {showVideoBox && (
                                    <div className="flex items-start justify-start w-full">
                                        <VideoEmbed
                                            title={
                                                content?.contentDetails?.[0]
                                                    ?.title || ''
                                            }
                                            src={getEmbedLink(
                                                content?.contentDetails?.[0]
                                                    ?.links?.[0] || ''
                                            )}
                                        />
                                    </div>
                                )}
                            </div> */}

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex text-left text-xl font-semibold">
                                            Description
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                className="px-3 py-2 border rounded-md "
                                                placeholder="Type your Description here."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="links"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className=" flex items-center gap-1 text-left text-xl font-semibold w-full">
                                            Embed Link
                                            <span className="text-sm font-normal text-muted-foreground ml-2">
                                                (Accepted: YouTube and Google
                                                Drive links only.)
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="px-3 py-2 border rounded-md "
                                                placeholder="Paste your link here "
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end items-center gap-4 pt-6">
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-3/3"
                                >
                                    Cancel
                                </Button>
                                {/* <Button
                                    type="submit"
                                    className="w-3/3 bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Save Changes
                                </Button> */}

                                <Button
                                    type="submit"
                                    disabled={
                                        !isDirty || !isValid || isSubmitting
                                    }
                                    className={`w-3/3 text-primary-foreground hover:bg-primary/90 ${
                                        !isDirty || !isValid || isSubmitting
                                            ? 'bg-muted/20 cursor-not-allowed opacity-70'
                                            : 'bg-primary'
                                    }`}
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </>
                {/* )} */}
            </div>
        </ScrollArea>
    )
}
export default AddVideo
