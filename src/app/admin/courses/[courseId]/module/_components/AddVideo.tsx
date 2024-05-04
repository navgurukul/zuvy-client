import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Form,
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileUp } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

type Props = {
    moduleId: string
    content: {
        id: number
        moduleId: number
        topicId: number
        order: number
        contentDetails: ContentDetail[]
    }
}

interface ContentDetail {
    title: string
    description: string
    links: string[]
    file: any
    content: any
}

interface ChapterDetails {
    title: string
    description: string
    links: string[]
}

const formSchema = z.object({
    videoTitle: z
        .string()
        .min(2, { message: 'Video Title must be at least 2 characters.' }),
    description: z
        .string()
        .min(4, { message: 'Description must be at least 4 characters.' }),
    links: z.string(),
})

const AddVideo = ({ moduleId, content }: Props) => {
    const [chapterDetails, setChapterDetails] = useState<ChapterDetails>()

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const fetchChapterDetailsHandler = useCallback(async () => {
        try {
            const response = await api.get(
                `/Content/chapterDetailsById/${content.id}`
            )
            const contentDetails = response.data.contentDetails
            if (contentDetails && contentDetails.length > 0) {
                const {
                    title = '',
                    description = '',
                    links: [firstLink = ''] = [],
                } = contentDetails[0]
                setChapterDetails({
                    title,
                    description,
                    links: [firstLink],
                })
                form.setValue('videoTitle', title)
                form.setValue('description', description)
                form.setValue('links', firstLink)
            } else {
                console.error('Content details not found or empty.')
            }
        } catch (error) {
            console.error('Error fetching chapter details:', error)
        }
    }, [content.id, form])

    useEffect(() => {
        fetchChapterDetailsHandler()
    }, [content.id, fetchChapterDetailsHandler])

    console.log(chapterDetails)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const convertedObj = {
            title: values.videoTitle,
            description: values.description,
            links: [values.links],
        }
        try {
            await api.put(
                `/Content/editChapterOfModule/${moduleId}?chapterId=${content.id}`,
                convertedObj
            )
            toast({
                title: 'Success',
                description: 'Chapter details updated successfully.',
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: "Couldn't update the chapter details.",
            })
        }
    }

    return (
        <div className="flex flex-col gap-y-8 mx-auto items-center justify-center w-full">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full items-center justify-center flex flex-col space-y-8"
                >
                    <FormItem>
                        <FormControl>
                            <Input
                                {...form.register('videoTitle')}
                                placeholder="Untitled Video"
                                className="p-0 text-3xl text-left font-semibold outline-none border-none focus:ring-0 capitalize"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    <div className="rounded-lg p-5 w-[450px] py-20 border-dashed border-2 border-gray-500 flex flex-col items-center justify-center">
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
                            Supported File Types: .mp4, .mpg, .mkv, .avi
                        </p>
                    </div>
                    <FormItem>
                        <FormControl>
                            <Input
                                {...form.register('description')}
                                className="w-[450px] px-3 py-2 border rounded-md"
                                placeholder="Type your Description here."
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    <FormItem>
                        <FormControl>
                            <Input
                                {...form.register('links')}
                                className="w-[450px] px-3 py-2 border rounded-md"
                                placeholder="Paste your link here"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    <Button
                        type="submit"
                        className="flex flex-start w-[450px] text-white font-bold py-2 px-4 rounded bg-secondary"
                    >
                        Embed Video
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default AddVideo
