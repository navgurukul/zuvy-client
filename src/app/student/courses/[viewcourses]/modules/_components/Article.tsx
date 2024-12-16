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
                            text: 'No article added yet. Please come back later for some interesting article to learn from...',
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
        console.log('content', content)
    }, [status])

    return (
        <ScrollArea className='h-full'>   
        <div className='mt-24 text-left'>
            <h1 className='font-bold text-lg my-5'>{content?.title}</h1>
            <TiptapEditor editor={editor} />
            {!isCompleted && (
                <div className="my-10 text-end">
                    <Button onClick={completeChapter}>Mark as Done</Button>
                </div>
            )}
        </div>
        </ScrollArea>
    )
}

export default Article
