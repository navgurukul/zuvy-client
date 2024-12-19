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
import { Pencil } from 'lucide-react'
// import useResponsiveHeight from '@/hooks/useResponsiveHeight'
import useResponsiveHeight from '@/hooks/useResponsiveHeight'
import PreviewArticle from './PreviewArticle'
import { ArrowUpRightSquare } from 'lucide-react'
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

const AddArticle = ({
    content,
    articleUpdateOnPreview,
    setArticleUpdateOnPreview,
}: {
    content: any
    articleUpdateOnPreview: any
    setArticleUpdateOnPreview: any
}) => {
    const heightClass = useResponsiveHeight()
    // state
    const [title, setTitle] = useState('')
    const [showPreview, setShowPreview] = useState<boolean>(false)
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    // misc
    const formSchema = z.object({
        title: z.string(),
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
    const getArticleContent = async () => {
        try {
            const response = await api.get(
                `/Content/chapterDetailsById/${content.id}`
            )
            // setArticleUpdateOnPreview(!articleUpdateOnPreview)
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
            setArticleUpdateOnPreview(!articleUpdateOnPreview)
            setIsChapterUpdated(!isChapterUpdated)
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
        <div className="px-5">
            <div className="w-full ">
                {showPreview ? (
                    <PreviewArticle
                        content={content}
                        setShowPreview={setShowPreview}
                    />
                ) : (
                    <>
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
                                        <FormItem className="flex flex-col">
                                            <FormLabel></FormLabel>
                                            <FormControl>
                                                <div className="w-2/6 flex justify-center align-middle items-center relative">
                                                    <Input
                                                        {...field}
                                                        onChange={(e) => {
                                                            setTitle(
                                                                e.target.value
                                                            )
                                                            field.onChange(e)
                                                        }}
                                                        placeholder="Untitled Article"
                                                        className="pl-1 pr-8 text-xl text-left font-semibold capitalize placeholder:text-gray-400 placeholder:font-bold border-x-0 border-t-0 border-b-2 border-gray-400 border-dashed focus:outline-none"
                                                        autoFocus
                                                    />
                                                    {!title && ( // Show pencil icon only when the title is empty
                                                        <Pencil
                                                            fill="true"
                                                            fillOpacity={0.4}
                                                            size={20}
                                                            className="absolute text-gray-100 pointer-events-none mt-1 right-5"
                                                        />
                                                    )}
                                                </div>
                                            </FormControl>
                                            <div className="flex items-center justify-between ">
                                                <Button
                                                    variant={'ghost'}
                                                    type="button"
                                                    className="text-secondary w-[100px] h-[30px] gap-x-1"
                                                    onClick={handlePreviewClick}
                                                >
                                                    <ArrowUpRightSquare />
                                                    <h1>Preview</h1>
                                                </Button>
                                                <div className="flex justify-end mt-5  ">
                                                    <Button
                                                        type="submit"
                                                        form="myForm"
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>

                                            <FormMessage className="h-5" />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>

                        <div className="text-left">
                            <TiptapToolbar editor={editor} />
                            <TiptapEditor editor={editor} />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default AddArticle
