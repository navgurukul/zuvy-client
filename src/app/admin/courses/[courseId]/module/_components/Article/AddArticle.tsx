import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { useEditor } from '@tiptap/react'
import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import TiptapToolbar from '@/app/_components/editor/TiptapToolbar'
import extensions from '@/app/_components/editor/TiptapExtensions'
import '@/app/_components/editor/Tiptap.css'

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

const AddArticle = ({ content }: any) => {
    // state
    const [title, setTitle] = useState('')
    const [contentDetails, setContentDetails] = useState(
        content.contentDetails[0].content
    )
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

    const form = useForm({
        resolver: zodResolver(formSchema),
        values: {
            title: title,
        },
        mode: 'onChange',
    })

    // functions
    const getArticleContent = async () => {
        console.log('asdfl')
        try {
            const response = await api.get(
                `/Content/chapterDetailsById/${content.id}`
            )
            setContentDetails(response.data.contentDetails[0].content)
            setTitle(content.title)
            editor?.commands.setContent(contentDetails)
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
            console.error('Error Editing Article:', error)
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
                        className="space-y-8 mb-10"
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
                <TiptapToolbar editor={editor} />
                <TiptapEditor editor={editor} />
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
