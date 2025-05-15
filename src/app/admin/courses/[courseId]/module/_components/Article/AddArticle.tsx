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
import '@/app/_components/editor/Tiptap.css'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Pencil } from 'lucide-react'
import useResponsiveHeight from '@/hooks/useResponsiveHeight'
import { getChapterUpdateStatus, getArticlePreviewStore } from '@/store/store'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'

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
    courseId,
    articleUpdateOnPreview,
    setArticleUpdateOnPreview,
}: {
    content: any
    courseId: any
    articleUpdateOnPreview: any
    setArticleUpdateOnPreview: any
}) => {
    const heightClass = useResponsiveHeight()
    const router = useRouter()
    // state
    const [title, setTitle] = useState('')
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const { setArticlePreviewContent } = getArticlePreviewStore()
    const [initialContent, setInitialContent] = useState()

    // misc
    const formSchema = z.object({
        title: z.string(),
    })

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
            // setArticleUpdateOnPreview(!articleUpdateOnPreview)
            setTitle(response.data.title)
            const data = response.data.contentDetails[0].content
            setInitialContent(JSON.parse(data))
        } catch (error) {
            console.error('Error fetching article content:', error)
        }
    }

    const editArticleContent = async () => {
        try {
            const initialContentString = initialContent
                ? [JSON.stringify(initialContent)]
                : ''
            const data = {
                title,
                articleContent: initialContentString,
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

    useEffect(() => {
        getArticleContent()
    }, [content])

    function previewArticle() {
        if (content) {
            setArticlePreviewContent(content)
            router.push(
                `/admin/courses/${courseId}/module/${content.moduleId}/chapter/${content.id}/article/${content.topicId}/preview`
            )
        }
    }

    return (
        <div className="px-5">
            <div className="w-full ">
                <Form {...form}>
                    <form
                        id="myForm"
                        onSubmit={form.handleSubmit(editArticleContent)}
                        className=""
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormControl>
                                        <div className="flex justify-between items-center">
                                            <div className="w-2/6 flex justify-center align-middle items-center relative">
                                                <Input
                                                    {...field}
                                                    onChange={(e) => {
                                                        setTitle(e.target.value)
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

                                            <div className="flex justify-end mt-5">
                                                <div className="flex items-center justify-between mr-2">
                                                    <div
                                                        id="previewArticle"
                                                        onClick={previewArticle}
                                                        className="flex w-[80px] hover:bg-gray-300 rounded-md p-1 cursor-pointer"
                                                    >
                                                        <Eye size={18} />
                                                        <h6 className="ml-1 text-sm">
                                                            Preview
                                                        </h6>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="submit"
                                                    form="myForm"
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="h-5" />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                <div className="text-left mt-5">
                    <RemirrorTextEditor
                        initialContent={initialContent}
                        setInitialContent={setInitialContent}
                    />
                </div>
            </div>
        </div>
    )
}

export default AddArticle
