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
    fetchChapterContent: (chapterId: number) => Promise<void>
}) => {
    const [showVideo, setShowVideo] = useState(true)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [newContent, setNewContent] = useState<chapterDetails>({
        title: content?.contentDetails?.[0]?.title ?? '',
        description: content?.contentDetails?.[0]?.description ?? '',
        links: content?.contentDetails?.[0]?.links ?? [],
    })

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            videoTitle: '',
            description: '',
            links: '',
        },
        // values: {
        //     videoTitle: newContent?.title ?? '',
        //     description: newContent?.description ?? '',
        //     links: newContent?.links[0] ?? '',
        // },
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
                    fetchChapterContent(content.id)
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
    // useEffect(() => {
    //     setShowVideo(newContent.links.length > 0)
    // }, [newContent.links])

    const handleClose = () => {
        setShowVideo(false)
        form.setValue('videoTitle', '')
        form.setValue('description', '')
        form.setValue('links', '')
    }

    return (
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
                    <div className=" flex justify-between items-start relative">
                        {showVideo && (
                            <>
                                <div className="flex items-center justify-center ">
                                    <VideoEmbed
                                        title={newContent?.title || ''}
                                        src={newContent?.links[0] || ''}
                                    />
                                </div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-circle-x cursor-pointer absolute -right-3 -top-3  text-destructive"
                                    onClick={handleClose}
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="m15 9-6 6" />
                                    <path d="m9 9 6 6" />
                                </svg>
                                {/* <CircleX
                                    className="cursor-pointer text-destructive"
                                    size={20}
                                    onClick={handleClose}
                                /> */}
                            </>
                        )}
                    </div>
                    {/* 
                    {!showVideo && (
                        <>
                            <div className="rounded-lg p-5 w-[450px] py-20 border-dashed border-2 border-gray-500 flex flex-col items-center justify-center ">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                />
                                <FileUp className="text-secondary" />
                                <h1
                                    className="flex-start font-bold py-2 px-4 rounded text-secondary cursor-pointer"
                                    onClick={handleUploadClick}
                                >
                                    Upload Video
                                </h1>
                                <p className="text-left text-gray-500">
                                    Supported File Types : .mp4, .mpg, .mkv,
                                    .avi
                                </p>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <Separator className="my-4 w-1/5" />
                                or <Separator className="my-4 w-1/5" />
                            </div>
                        </>
                    )} */}
                    {/* <h1 >Title</h1> */}

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
    )
}
export default AddVideo
