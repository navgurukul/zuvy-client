'use client'

import React, { useEffect, useState, useCallback } from 'react'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, RotateCcw } from 'lucide-react'
import FormSection from './FormSection'

type AddFormProps = {
    chapterData: any
    content: any
    fetchChapterContent: (chapterId: number) => void
    moduleId: any
}

interface chapterDetails {
    title: string
    description: string
}

const formSchema = z.object({
    title: z.string().min(2, {
        message: 'Video Title must be at least 2 characters.',
    }),

    description: z.string().min(4, {
        message: 'Description must be at least 4 characters.',
    }),
})

const AddForm: React.FC<AddFormProps> = ({
    chapterData,
    content,
    fetchChapterContent,
    moduleId,
}) => {
    const [newContent, setNewContent] = useState<chapterDetails>({
        title: 'title',
        description: 'description',
    })
    const [section, setSection] = useState([{ name: '', number: '' }])

    const form = useForm<z.infer<typeof formSchema>>({
        // const form = useForm({
        resolver: zodResolver(formSchema),
        // resolver: zodResolver(),
        defaultValues: {
            title: '',
            description: '',
        },
        values: {
            title: newContent?.title ?? '',
            description: newContent?.description ?? '',
        },
    })

    const addQuestion = () => {
        console.log('Clicked')
        const newSection = { name: '', number: '' }
        setSection([...section, newSection])
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log('values', values)
    }

    return (
        <div className="flex flex-col gap-y-8 mx-auto items-center justify-center w-full">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className=" w-full items-center justify-center flex flex-col space-y-8"
                >
                    <Input
                        placeholder="Untitled Form"
                        className="p-0 text-3xl w-1/5 text-left font-semibold outline-none border-none focus:ring-0 capitalize"
                    />
                    {/* <FormField
                        control={form.control}
                        name="untitledForm"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Untitled Form"
                                        className="p-0 text-3xl w-1/20 text-left font-semibold outline-none border-none focus:ring-0 capitalize mb-5"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    /> */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex text-left text-md font-semibold mb-1">
                                    Description
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="w-[450px] px-3 py-2 border rounded-md "
                                        placeholder="Placeholder"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    -----------------------------------------------------------------------
                    {/* <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className=" flex text-left text-xl font-semibold">
                                    Title
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="w-[450px] px-3 py-2 border rounded-md "
                                        placeholder="Placeholder"
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
                                    <Input
                                        {...field}
                                        className="w-[450px] px-3 py-2 border rounded-md "
                                        placeholder="Placeholder"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    /> */}
                    {section.map((item: any, index) => (
                        <FormSection
                            index={index + 1}
                            form={form}
                            addQuestion={addQuestion}
                            setSection={setSection}
                        />
                    ))}
                    {/* <FormSection title={'Hello title section'} /> */}
                    <div className="flex justify-end">
                        <Button
                            variant={'secondary'}
                            type="button"
                            onClick={addQuestion}
                            className="gap-x-2 border-none hover:text-secondary hover:bg-popover"
                        >
                            <Plus /> Add Question
                        </Button>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            variant={'secondary'}
                            type="submit"
                            className="border-none hover:text-secondary hover:bg-popover"
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default AddForm
