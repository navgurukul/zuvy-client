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
import { ScrollArea } from '@/components/ui/scroll-area'
import useResponsiveHeight from '@/hooks/useResponsiveHeight'
import { Pencil } from 'lucide-react'

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

const AddArticle = ({ content }: { content: any }) => {
    const heightClass = useResponsiveHeight()
    // state
    const [title, setTitle] = useState('')
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
        try {
            const response = await api.get(
                `/Content/chapterDetailsById/${content.id}`
            )
            setTitle(response.data.title)
            editor?.commands.setContent(response.data.contentDetails[0].content)
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
        getArticleContent()
    }, [content, editor])

    return (
        <ScrollArea
            className={`${heightClass} pr-4`}
            type="hover"
            style={{
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE and Edge
            }}
        >
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
                                            <div className="w-2/6 flex justify-center align-middle items-center relative">
                                                <Input
                                                    required
                                                    onChange={(e) => {
                                                        setTitle(e.target.value)
                                                    }}
                                                    placeholder={content?.title}
                                                    className="pl-1 pr-8 text-xl text-left font-semibold capitalize placeholder:text-gray-400 placeholder:font-bold border-x-0 border-t-0 border-b-2 border-gray-400 border-dashed focus:outline-none"
                                                    autoFocus
                                                />
                                                {!title && (
                                                    <Pencil
                                                        fill="true"
                                                        fillOpacity={0.4}
                                                        size={20}
                                                        className="absolute text-gray-100 pointer-events-none mt-1 right-5"
                                                    />
                                                )}
                                            </div>
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
        </ScrollArea>
    )
}

export default AddArticle
