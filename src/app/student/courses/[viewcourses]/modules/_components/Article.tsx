import { Editor, useEditor } from '@tiptap/react'
import React, { useEffect, useState } from 'react'
import extensions from '@/app/_components/editor/TiptapExtensions'
import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import '@/app/_components/editor/Tiptap.css'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

function Article({
    content,
    completeChapter,
    status,
}: {
    content: any
    completeChapter: () => void
    status: string
}) {
    let editorContent
    const [isCompleted, setIsCompleted] = useState<boolean>(false)

    if (
        content?.articleContent &&
        Array.isArray(content.articleContent) &&
        content.articleContent.length > 0
    ) {
        editorContent = content.articleContent[0]
    } else {
        editorContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    attrs: {
                        textAlign: 'left',
                    },
                    content: [
                        {
                            text: 'No article has been added yet. Please come back later for an interesting article to learn from...',
                            type: 'text',
                        },
                    ],
                },
            ],
        }
    }

    const editor = useEditor({
        extensions,
        content: editorContent,
        editable: false,
    })

    useEffect(() => {
        setIsCompleted(status === 'Completed')
    }, [status])

    return (
        <ScrollArea className='h-[calc(100vh-110px)] md:h-screen lg:h-screen'>   
        <div className='mt-6 md:mt-24 lg:mt-24 text-left mr-4 md:mr-0 lg:mr-0'>
            <h1 className='font-bold text-lg my-5'>{content?.title}</h1>
            <TiptapEditor editor={editor} />
            {!isCompleted && (
                <div className="my-10 text-end mb-20 md:mb-0 lg:mb-0">  
                    <Button
                            disabled={
                                !content?.articleContent ||
                                !content.articleContent.some((doc: any) =>
                                    doc.content.some(
                                        (paragraph: any) =>
                                            paragraph.content &&
                                            paragraph.content.some(
                                                (item: any) =>
                                                    item.type === 'text'
                                            )
                                    )
                                )
                            }
                            onClick={completeChapter}
                        >
                            Mark as Done
                        </Button>
                </div>
            )}
        </div>
        </ScrollArea>
    )
}

export default Article
