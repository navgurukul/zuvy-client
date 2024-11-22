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
import VideoEmbed from './VideoEmbed'
import { X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import useResponsiveHeight from '@/hooks/useResponsiveHeight'

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
        moduleId: number
        topicId: number
        order: number
        contentDetails: ContentDetail[]
    }
    moduleId: string
    fetchChapterContent: (chapterId: number, topicId: number) => Promise<void>
}) => {
    const heightClass = useResponsiveHeight()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showVideoBox, setShowVideoBox] = useState<boolean>(true)
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

        console.log(convertedObj)

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
                    title: '',
                    description: '',
                    links: [''],
                }
            )
        } catch (error) {
            console.error('Error updating chapter:', error)
        }
    }

    return (
        <ScrollArea
            // className="h-[600px] lg:h-[600px] pr-4"
            className={`${heightClass} pr-4`}
            type="hover"
            style={{
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE and Edge
            }}
        >
            <div className="flex flex-col gap-y-8 mx-auto items-center justify-center w-full">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className=" w-full items-center justify-center flex flex-col space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="videoTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="Untitled Video"
                                            {...field}
                                            className="w-[450px] p-0 text-3xl text-left font-semibold outline-none border-none focus:ring-0"
                                        />
                                    </FormControl>

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
            </div>
        </ScrollArea>
    )
}
export default AddVideo
