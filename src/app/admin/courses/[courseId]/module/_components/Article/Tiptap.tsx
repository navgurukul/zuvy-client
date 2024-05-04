'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { zodResolver } from '@hookform/resolvers/zod'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import * as z from 'zod'
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
import Underline from '@tiptap/extension-underline'
import Heading from '@tiptap/extension-heading'
import Link from '@tiptap/extension-link'
import { api } from '@/utils/axios.config'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'

import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Text from '@tiptap/extension-text'
import TextEditorBtns from './TextEditorBtns'

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
const content = `
<h1>This is a heading</h1>
<p>Press # and enter to create a heading:</p>
<p>Press backspace to remove the heading:</p>
<p>Press Enter/Space after a link and it will be converted to a link:</p>
www.google.com
`
interface TiptapProps {
    chapterContent: {
        id: number
        moduleId: number
    }
}

const Tiptap = ({ chapterContent }: TiptapProps) => {
    const [title, setTitle] = useState('')
    const { register } = useForm()

    const editor = useEditor({
        extensions,
        content,
    })

    const editArticleContent = async () => {
        try {
            const articleContent = [editor?.getJSON()]
            const data = {
                title,
                articleContent,
            }

            await api.put(
                `/Content/editChapterOfModule/${chapterContent.moduleId}?chapterId=${chapterContent.id}`,
                data
            )
            toast({
                title: 'Success',
                description: 'Article Chapter Edited Successfully',
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

    const getArticleContent = async () => {
        try {
            const response = await api.get(
                `/Content/chapterDetailsById/${chapterContent.id}`
            )
            console.log(response)
            // setTitle(response.data.title)
            editor?.commands.setContent(response.data.contentDetails[0].content)
        } catch (error) {
            console.error('Error fetching article content:', error)
        }
    }

    useEffect(() => {
        getArticleContent()
    }, [chapterContent])

    // Define your form schema
    const formSchema = z.object({
        title: z.string().min(2, {
            message: 'Title must be at least 2 characters.',
        }),
        // Add more fields here
    })

    // Initialize your form
    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
    })

    return (
        <div>
            <div className="toolbar-btns flex justify-center">
                <TextEditorBtns />
            </div>

            <div className="flex justify-center my-5">
                <Form {...form}>
                    <form
                        id="myForm"
                        onSubmit={form.handleSubmit(editArticleContent)}
                        className="space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel></FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Title"
                                            className="w-full"
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

            <div className="bg-muted/80 p-2 rounded-sm mt-4">
                <EditorContent editor={editor} />
            </div>
            <div className="flex justify-end">
                <Button type="submit" form="myForm">
                    Save
                </Button>
            </div>
        </div>
    )
}

export default Tiptap
