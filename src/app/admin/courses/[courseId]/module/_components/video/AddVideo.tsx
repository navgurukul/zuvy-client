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
import VideoEmbed from '@/app/admin/courses/[courseId]/module/_components/video/VideoEmbed'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowUpRightSquare, X, Pencil } from 'lucide-react'
import PreviewVideo from '@/app/admin/courses/[courseId]/module/_components/video/PreviewVideo'
import { getChapterUpdateStatus } from '@/store/store'

// import useResponsiveHeight from '@/hooks/useResponsiveHeight'

// Helper function to convert links to embed-friendly format
const getEmbedLink = (url: string) => {
    if (!url) return ''
    try {
        const urlObj = new URL(url) // Parse the URL
        if (url.includes('embed')) {
            return url
        } else if (
            urlObj.hostname.includes('youtube.com') &&
            urlObj.searchParams.has('v')
        ) {
            // Convert long YouTube URL to embed format
            return `https://www.youtube.com/embed/${urlObj.searchParams.get(
                'v'
            )}`
        } else if (urlObj.hostname.includes('youtu.be')) {
            // Convert short YouTube URL to embed format
            const videoId = urlObj.pathname.slice(1)
            return `https://www.youtube.com/embed/${videoId}`
        }
    } catch (error) {
        console.error('Invalid URL:', url, error) // Log invalid URLs for debugging
    }
    return '' // Return empty string for invalid URLs
}

const isLinkValid = (link: string) => {
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)*([\w-]+)(:\d{2,5})?(\/\S*)*$/
    return urlRegex.test(link)
}

const formSchema = z.object({
    videoTitle: z.string().min(2, {
        message: 'Video Title must be at least 2 characters.',
    }),

    description: z.string().min(4, {
        message: 'Description must be at least 4 characters.',
    }),
    links: z.string().refine(
        (value) => {
            const links = value.split(',').map((link) => link.trim())
            return links.every((link) => isLinkValid(link))
        },
        {
            message: 'One or more links are invalid.',
        }
    ),
})
interface ContentDetail {
    title: string
    description: string
    links: string[]
    file: any
    content: any
}

interface chapterDetails {
    title: string
    description: string
    links: string[]
}
const AddVideo = ({
    moduleId,
    content,
    fetchChapterContent,
}: {
    content: {
        id: number
        title: string
        moduleId: number
        topicId: number
        order: number
        contentDetails: ContentDetail[]
    }
    moduleId: string
    fetchChapterContent: (chapterId: number, topicId: number) => Promise<void>
}) => {
    // const heightClass = useResponsiveHeight()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showPreview, setShowPreview] = useState<boolean>(false)
    const [showVideoBox, setShowVideoBox] = useState<boolean>(true)
    const [videoTitle, setVideoTitle] = useState('')
    const {isChapterUpdated, setIsChapterUpdated} = getChapterUpdateStatus()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
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

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const convertedObj = {
            title: values.videoTitle,
            description: values.description,
            links: [values.links],
        }

        try {
            await api
                .put(
                    `/Content/editChapterOfModule/${moduleId}?chapterId=${content.id}`,
                    convertedObj
                )
                .then((res) => {
                    toast({
                        title: res.data.status,
                        description: res.data.message,
                        className:
                            'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                    })
                    setShowVideoBox(true)
                    fetchChapterContent(content.id, content.topicId)
                    setIsChapterUpdated(!isChapterUpdated)
                })
        } catch (error) {
            toast({
                title: 'Error',
                description: "Couldn't Update the Chapter Module",
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    useEffect(() => {
        if (content?.contentDetails?.[0]?.links?.[0])
            form.reset({
                videoTitle: content?.contentDetails?.[0]?.title ?? '',
                description: content?.contentDetails?.[0]?.description ?? '',
                links: content?.contentDetails?.[0]?.links?.[0] ?? '',
            })
        else {
            setShowVideoBox(false)
        }
    }, [content?.contentDetails, form])

    const handleClose = async () => {
        setShowVideoBox(false)
        form.setValue('links', '')
        form.setValue('description', '')

        try {
            await api.put(
                `/Content/editChapterOfModule/${moduleId}?chapterId=${content.id}`,
                {
                    description: '',
                    links: [''],
                }
            )
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
            toast({
                title: 'No Title',
                description: 'Please provide a title for the video to preview.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-warning max-w-sm px-6 py-5 box-border z-50',
            })
            return
        }

        // Check if links are empty or invalid
        const links = form.watch('links').trim()
        if (!links || !isLinkValid(links)) {
            toast({
                title: 'Invalid Link',
                description: 'Please provide a valid video link to preview.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-warning max-w-sm px-6 py-5 box-border z-50',
            })
            return
        }

        setShowPreview(true)
    }

    return (
        <ScrollArea
            type="hover"
            style={{
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE and Edge
            }}
        >
            <div className="flex flex-col gap-y-8 mx-auto items-center justify-center w-full">
                {showPreview ? (
                    <PreviewVideo
                        content={content}
                        setShowPreview={setShowPreview}
                    />
                ) : (
                    <>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className=" w-full items-center justify-center flex flex-col space-y-8"
                            >
                                <FormField
                                    control={form.control}
                                    name="videoTitle"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormControl>
                                                <div className="w-[450px] flex justify-center items-center relative">
                                                    <Input
                                                        required
                                                        {...field} // Spread the field props (e.g., value, name, etc.)
                                                        onChange={(e) => {
                                                            setVideoTitle(
                                                                e.target.value
                                                            ) // Update the local state
                                                            field.onChange(e) // Update the react-hook-form state
                                                        }}
                                                        placeholder={
                                                            content?.title
                                                        }
                                                        className="pl-1 pr-8 text-xl text-left font-semibold capitalize text-gray-400 placeholder:text-gray-400 placeholder:font-bold border-x-0 border-t-0 border-b-2 border-gray-400 border-dashed focus:outline-none"
                                                        autoFocus
                                                    />
                                                    {!videoTitle && (
                                                        <Pencil
                                                            fill="true"
                                                            fillOpacity={0.4}
                                                            size={20}
                                                            className="absolute text-gray-100 pointer-events-none top-1/2 right-3 -translate-y-1/2"
                                                            // Adjusted right positioning
                                                        />
                                                    )}
                                                </div>
                                            </FormControl>

                                            <Button
                                                variant={'ghost'}
                                                type="button"
                                                className="text-secondary w-[100px] h-[30px] gap-x-1 "
                                                onClick={handlePreviewClick}
                                            >
                                                <ArrowUpRightSquare />
                                                <h1>Preview</h1>
                                            </Button>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className=" flex justify-between items-start relative text-red">
                                    {showVideoBox && (
                                        <div className="flex items-start justify-center ">
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
                                            <X
                                                className="text-destructive ml-2 cursor-pointer"
                                                size={17}
                                                onClick={handleClose}
                                            />
                                        </div>
                                    )}
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className=" flex text-left text-xl font-semibold">
                                                Description
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    className="w-[450px] px-3 py-2 border rounded-md "
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
                                            <FormLabel className=" flex text-left text-xl font-semibold">
                                                Embed Link
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className="w-[450px] px-3 py-2 border rounded-md "
                                                    placeholder="Paste your link here "
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className=" flex flex-start  w-[450px]  text-white font-bold py-2 px-4 rounded"
                                >
                                    Embed Video
                                </Button>
                            </form>
                        </Form>
                    </>
                )}
            </div>
        </ScrollArea>
    )
}
export default AddVideo
