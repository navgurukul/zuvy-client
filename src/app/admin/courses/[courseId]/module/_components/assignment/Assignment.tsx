'use client'

import React, { useEffect, useState } from 'react'
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
import { useEditor } from '@tiptap/react'
import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import TiptapToolbar from '@/app/_components/editor/TiptapToolbar'
import extensions from '@/app/_components/editor/TiptapExtensions'
import '@/app/_components/editor/Tiptap.css'
import { ArrowUpRightSquare, CalendarIcon } from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import PreviewAssignment from './PreviewAssignment'

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

interface AssignmentProps {
    content: Content
}

const AddAssignent = ({ content }: AssignmentProps) => {
    // misc
    const [showPreview, setShowPreview] = useState<boolean>(false)

    const formSchema = z.object({
        title: z.string().min(2, {
            message: 'Title must be at least 2 characters.',
        }),
        startDate: z.date({
            required_error: 'A start date is required.',
        }),
    })

    const editor = useEditor({
        extensions,
        content,
    })

    const [title, setTitle] = useState('')

    const form = useForm({
        resolver: zodResolver(formSchema),
        values: {
            title: title,
            startDate: setHours(
                setMinutes(setSeconds(setMilliseconds(new Date(), 0), 0), 0),
                0
            ),
        },
        mode: 'onChange',
    })

    const getAssignmentContent = async () => {
        try {
            const response = await api.get(
                `/Content/chapterDetailsById/${content.id}`
            )
            const contentDetails = response.data.contentDetails[0]
            setTitle(contentDetails.title)
            contentDetails &&
                editor?.commands.setContent(contentDetails.content)
        } catch (error) {
            console.error('Error fetching assignment content:', error)
        }
    }

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
            const articleContent = [editor?.getJSON()]
            const requestBody = {
                title: data.title,
                completionDate: deadlineDate,
                articleContent,
            }

            await api.put(
                `/Content/editChapterOfModule/${content.moduleId}?chapterId=${content.id}`,
                requestBody
            )
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

    // async
    useEffect(() => {
        getAssignmentContent()
    }, [content, editor])

    return (
        <div>
            <div className="w-full ">
                {showPreview ? (
                    <PreviewAssignment
                        content={content}
                        setShowPreview={setShowPreview}
                    />
                ) : (
                    <>
                        <Form {...form}>
                            <form
                                id="myForm"
                                onSubmit={form.handleSubmit(
                                    editAssignmentContent
                                )}
                                className="space-y-8 mb-10"
                            >
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormControl>
                                                <Input
                                                    placeholder="Untitled Article"
                                                    className="p-0 text-3xl w-2/5 text-left font-semibold outline-none border-none focus:ring-0 capitalize"
                                                    {...field}
                                                    {...form.register('title')}
                                                    onChange={(e) =>
                                                        setTitle(e.target.value)
                                                    }
                                                />
                                            </FormControl>
                                            <Button
                                                variant={'ghost'}
                                                type="button"
                                                className=" text-secondary w-[100px] h-[30px] gap-x-1 "
                                                onClick={() =>
                                                    setShowPreview(true)
                                                }
                                            >
                                                <ArrowUpRightSquare />
                                                <h1>Preview</h1>
                                            </Button>
                                            <FormMessage className="h-5" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col justify-start gap-x-2 text-left">
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
                                                            className={`w-[230px]  text-left font-normal ${
                                                                !field.value &&
                                                                'text-muted-foreground'
                                                            }`}
                                                        >
                                                            {field.value
                                                                ? format(
                                                                      field.value,
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
                                    )}
                                />
                            </form>
                        </Form>
                        <div className="text-left">
                            <TiptapToolbar editor={editor} />
                            <TiptapEditor editor={editor} />
                        </div>
                        <div className="flex justify-end mt-5">
                            <Button type="submit" form="myForm">
                                Save
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default AddAssignent
