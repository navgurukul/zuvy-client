import Underline from '@tiptap/extension-underline'
import Heading from '@tiptap/extension-heading'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Text from '@tiptap/extension-text'
import StarterKit from '@tiptap/starter-kit'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import React, { useEffect, useState } from 'react'
import Tiptap from './Article/Tiptap'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import { useEditor } from '@tiptap/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from '@/components/ui/use-toast'

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

const extensions = [
    StarterKit,
    Underline,
    ListItem,
    Text,
    BulletList.configure({
        itemTypeName: 'listItem',
        HTMLAttributes: {
            class: 'list-disc inline-block text-left',
        },
    }),
    OrderedList.configure({
        HTMLAttributes: {
            class: 'list-decimal inline-block text-left',
        },
    }),
    Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
            class: 'font-bold text-secondary',
        },
    }),
    Heading.configure({
        levels: [1],
        HTMLAttributes: {
            class: 'font-bold text-2xl',
        },
    }),
]

function Assignment({ content }: AssignmentProps) {
    const formSchema = z.object({
        title: z.string().min(2, {
            message: 'Title must be at least 2 characters.',
        }),
    })

    const editor = useEditor({
        extensions,
        content,
    })

    // variables and states
    const [title, setTitle] = useState('')
    // const [isAlertOpen, setIsAlertOpen] = useState(false)

    // func

    // Initialize your form
    const form = useForm({
        resolver: zodResolver(formSchema),
        // defaultValues: {
        //     title: title || '',
        // },
        values: {
            title: title,
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
            editor?.commands.setContent(contentDetails.content)
        } catch (error) {
            console.error('Error fetching assignment content:', error)
        }
    }

    const editAssignmentContent = async () => {
        try {
            const assignmentContent = [editor?.getJSON()]
            const data = {
                title,
                assignmentContent,
            }

            await api.put(
                `/Content/editChapterOfModule/${content.moduleId}?chapterId=${content.id}`,
                data
            )
            toast({
                title: 'Success',
                description: 'Assignment Edited Successfully',
            })
        } catch (error: any) {
            toast({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
                className: 'text-start capitalize',
                variant: 'destructive',
            })
            console.error('Error creating batch:', error)
        }
    }

    // async
    useEffect(() => {
        getAssignmentContent()
    }, [content])

    return (
        <div>
            <div className="w-full my-5">
                <Form {...form}>
                    <form
                        id="myForm"
                        onSubmit={form.handleSubmit(editAssignmentContent)}
                        className="space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    {/* <FormLabel></FormLabel> */}
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
                                    <FormMessage className="h-5" />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </div>

            <Tiptap editor={editor} />
            <div className="flex justify-end">
                <Button type="submit" form="myForm">
                    Save
                </Button>
            </div>
        </div>
    )
}

export default Assignment
