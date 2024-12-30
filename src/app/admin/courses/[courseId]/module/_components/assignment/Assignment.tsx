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
import { ArrowUpRightSquare, CalendarIcon, Pencil } from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import PreviewAssignment from './PreviewAssignment'
import { getChapterUpdateStatus } from '@/store/store'

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
    assignmentUpdateOnPreview: boolean
    setAssignmentUpdateOnPreview: React.Dispatch<React.SetStateAction<boolean>> // Correct type for setter
}

const AddAssignent = ({
    content,
    assignmentUpdateOnPreview,
    setAssignmentUpdateOnPreview,
}: AssignmentProps) => {
    // misc

    const [showPreview, setShowPreview] = useState<boolean>(false)
    const handlePreviewClick = () => {
        const editorContent = editor?.getText()
        if (!editorContent || editorContent.trim() === '') {
            toast({
                title: 'No Questions',
                description:
                    'Please add at least one question to preview the quiz.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-warning max-w-sm px-6 py-5 box-border z-50',
            })
        } else {
            setShowPreview(true)
        }
    }

    const formSchema = z.object({
        title: z.string(),
        startDate: z.date({
            required_error: 'A start date is required.',
        }),
    })

    const editor = useEditor({
        extensions,
        content,
    })

    const [title, setTitle] = useState('')
    const [titles, setTitles] = useState('')
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()

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
            setTitles(contentDetails.title)
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
            setAssignmentUpdateOnPreview(!assignmentUpdateOnPreview)
            setIsChapterUpdated(!isChapterUpdated)
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
        console.log('content', content)
    }, [content, editor])



    return (
        <div className="px-5">
            {showPreview ? (
                <PreviewAssignment
                    content={content}
                    setShowPreview={setShowPreview}
                />
            ) : (
                <>
                    <div className="w-full ">
                        <Form {...form}>
                            <form
                                id="myForm"
                                onSubmit={form.handleSubmit(
                                    editAssignmentContent
                                )}
                                className=" "
                            >
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col gap-0">
                                            <FormControl>
                                                <div className='flex justify-between items-center'>
                                                <div className="w-2/6 flex justify-center align-middle items-center relative">
                                                    <Input
                                                        {...field}
                                                        onChange={(e) => {
                                                            setTitles(
                                                                e.target.value
                                                            )
                                                            field.onChange(e)
                                                        }}
                                                        placeholder="Untitled Assignment"
                                                        className="pl-1 pr-8 text-xl text-left font-semibold capitalize placeholder:text-gray-400 placeholder:font-bold border-x-0 border-t-0 border-b-2 border-gray-400 border-dashed focus:outline-none"
                                                        autoFocus
                                                    />
                                                    {!titles && ( // Show pencil icon only when the title is empty
                                                        <Pencil
                                                            fill="true"
                                                            fillOpacity={0.4}
                                                            size={20}
                                                            className="absolute text-gray-100 pointer-events-none mt-1 right-5"
                                                        />
                                                    )}
                                                </div>
                                                <div className="mt-5">
                                                    <Button
                                                        type="submit"
                                                        form="myForm"
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                                </div>
                                            </FormControl>
                                            {/* Button aligned below the input */}
                                            <div className="flex items-center justify-between">
                                                <Button
                                                    variant={'ghost'}
                                                    type="button"
                                                    className="text-secondary w-[100px] h-[30px] gap-x-1"
                                                    onClick={handlePreviewClick}
                                                >
                                                    <ArrowUpRightSquare />
                                                    <h1>Preview</h1>
                                                </Button>
                                            
                                            </div>
                                            <FormMessage className="h-5" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col justify-start gap-x-2 gap-y-4 text-left">
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
                                                            className={`w-1/6  text-left font-normal ${
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

                        {/* )} */}
                    </div>
                    <div className="text-left mt-6">
                        <TiptapToolbar editor={editor} />
                        <TiptapEditor editor={editor} />
                    </div>
                </>
            )}
        </div>
    )
}

export default AddAssignent
