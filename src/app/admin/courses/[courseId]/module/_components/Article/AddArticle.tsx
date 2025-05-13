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
import { getChapterUpdateStatus, getArticlePreviewStore } from '@/store/store'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
    content: Content
    courseId: any
    articleUpdateOnPreview: any
    setArticleUpdateOnPreview: any
}) => {
    const heightClass = useResponsiveHeight()
    const router = useRouter()
    // state
    const [title, setTitle] = useState('')
    const [isSaved, setIsSaved] = useState(false)
    const [lastSavedContent, setLastSavedContent] = useState<string>('')

    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const { setArticlePreviewContent } = getArticlePreviewStore()

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

    const getArticleContent = async () => {
        try {
            const response = await api.get(
                `/Content/chapterDetailsById/${content.id}`
            )
            // setArticleUpdateOnPreview(!articleUpdateOnPreview)
            setTitle(response.data.title)
            // editor?.commands.setContent(response.data.contentDetails[0].content)
            const contentHTML = response.data.contentDetails[0].content
            editor?.commands.setContent(contentHTML)
            setLastSavedContent(contentHTML)
            setIsSaved(true)
        } catch (error) {
            console.error('Error fetching article content:', error)
        }
    }

    const editArticleContent = async () => {
        try {
            const contentHTML = editor?.getHTML() || ''
            const articleContent = [editor?.getJSON()]
            const data = {
                title,
                articleContent,
            }

            await api.put(
                `/Content/editChapterOfModule/${content.moduleId}?chapterId=${content.id}`,
                data
            )
            setLastSavedContent(contentHTML)
            setIsSaved(true)
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

    // Reset saved state if user edits content
    useEffect(() => {
        if (!editor) return
    
        const handleUpdate = () => {
            const currentContent = editor.getHTML()
            if (currentContent !== lastSavedContent) {
                setIsSaved(false)
            }
        }
    
        editor.on('update', handleUpdate)
    
        return () => {
            //this prevents TypeScript error on cleanup
            editor?.off('update', handleUpdate)
        }
    }, [editor, lastSavedContent])
    

    function previewArticle() {
        const currentText = editor?.getText().trim()

        if (!currentText || currentText.length === 0) {
            return toast({
                title: 'Cannot Preview',
                description: 'Nothing to preview. Please add content and save.',
                className:
                    'border border-red-500 text-red-500 text-left w-[90%] capitalize',
            })
        }

        if (!isSaved) {
            return toast({
                title: 'Unsaved Changes',
                description: 'Please save your changes before previewing.',
                className:
                    'border border-yellow-500 text-yellow-600 text-left w-[90%] capitalize',
            })
        }

        setArticlePreviewContent(content)
        router.push(
            `/admin/courses/${courseId}/module/${content.moduleId}/chapter/${content.id}/article/${content.topicId}/preview`
        )
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
                    <TiptapToolbar editor={editor} />
                    <TiptapEditor editor={editor} />
                </div>
            </div>
        </div>
    )
}

export default AddArticle
