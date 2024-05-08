'use client'

import React, { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Heading from '@tiptap/extension-heading'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Text from '@tiptap/extension-text'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Document from '@tiptap/extension-document'
import Youtube from '@tiptap/extension-youtube'
import TextAlign from '@tiptap/extension-text-align'
import TiptapEditor from './TiptapEditor'
import TiptapToolbar from './TiptapToolbar'
import './Tiptap.css'

const extensions = [
    StarterKit,
    Underline,
    ListItem,
    Text,
    Image,
    Document,
    TextAlign.configure({
        types: ['heading', 'paragraph'],
    }),
    Youtube.configure({
        HTMLAttributes: {
            class: 'w-2/4 resize flex justify-center items-center bg-gray-200 rounded-md m-auto',
        },
        inline: false,
        width: 480,
        height: 320,
        nocookie: true,
        ccLanguage: 'es',
        ccLoadPolicy: true,
        enableIFrameApi: true,
        origin: 'app.zuvy.org',
    }),
    Paragraph.configure({
        HTMLAttributes: {
            class: 'resize',
        },
    }),
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
        levels: [1, 2, 3, 4, 5, 6],
    }),
    Image.configure({
        HTMLAttributes: {
            class: 'w-2/4 resize flex justify-center items-center bg-gray-200 rounded-md m-auto',
        },
        inline: true,
    }),
]

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

interface ArticleProps {
    content: Content
}

const AddArticle = ({ content }: ArticleProps) => {
    // misc

    const formSchema = z.object({
        title: z.string().min(2, {
            message: 'Title must be at least 2 characters.',
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
        },
        mode: 'onChange',
    })

    const getArticleContent = async () => {
        try {
            const response = await api.get(
                `/Content/chapterDetailsById/${content.id}`
            )
            const contentDetails = response.data.contentDetails[0]
            setTitle(contentDetails.title)
            editor?.commands.setContent(contentDetails.content)
        } catch (error) {
            console.error('Error fetching article content:', error)
        }
    }

    const editArticleContent = async () => {
        try {
            const articleContent = [editor?.getJSON()]
            const data = {
                title,
                articleContent,
            }

            await api.put(
                `/Content/editChapterOfModule/${content.moduleId}?chapterId=${content.id}`,
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

    // async
    useEffect(() => {
        getArticleContent()
    }, [content])

    return (
        <div>
            <div className="w-full ">
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
            <div className="text-left">
                <TiptapToolbar editor={editor} chapterContent={content} />
                <TiptapEditor editor={editor} chapterContent={content} />
            </div>
            <div className="flex justify-end mt-5">
                <Button type="submit" form="myForm">
                    Save
                </Button>
            </div>
        </div>
    )
}

export default AddArticle
