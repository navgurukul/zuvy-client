'use client'
import React, { useRef } from 'react'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { FileUp } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
type Props = {}

const formSchema = z.object({
    videoTitle: z.string().min(2, {
        message: 'Video Title must be at least 2 characters.',
    }),
    title: z.string().min(2, {
        message: 'Title must be at least 2 characters.',
    }),
    description: z.string().min(4, {
        message: 'Description must be at least 4 characters.',
    }),
    links: z.string(),
})

const AddVideo = ({
    moduleId,
    content,
}: {
    content: Object
    moduleId: string
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            videoTitle: '',
            title: '',
            description: '',
            links: '',
        },
    })
    async function onSubmit(values: z.infer<typeof formSchema>) {
        const convertedObj = {
            title: values.title,
            description: values.description,
            links: [values.links],
        }
        console.log(convertedObj)
        try {
            await api
                .post(`/Content/chapter/${moduleId}?topicId=1`, convertedObj)
                .then((res) => {
                    toast({
                        title: res.data.status,
                        description: res.data.message,
                    })
                })
        } catch (error) {
            toast({
                title: 'Error',
                description: "Couldn't Create the Chapter Module",
            })
        }
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
                                        className="w-[450px] text-3xl text-left font-semibold outline-none border-none focus:ring-0"
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />

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
                            Supported File Types : .mp4, .mpg, .mkv, .avi
                        </p>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <Separator className="my-4 w-1/5" />
                        or <Separator className="my-4 w-1/5" />
                    </div>
                    {/* <h1 >Title</h1> */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className=" flex text-left text-xl font-semibold">
                                    Title
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Title"
                                        {...field}
                                        className="w-[450px] text-3xl text-left font-semibold"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
