import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'

type EditorDoc = {
    type: string
    content: any[]
}

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
    const [initialContent, setInitialContent] = useState<
        { doc: EditorDoc } | undefined
    >(
        content?.articleContent === null
            ? undefined
            : typeof content?.articleContent[0] === 'string'
            ? JSON.parse(content?.articleContent[0])
            : { doc: content?.articleContent[0] }
    )

    useEffect(() => {
        if (
            content?.articleContent &&
            Array.isArray(content.articleContent) &&
            content.articleContent.length > 0
        ) {
            if (typeof content.articleContent[0] === 'string') {
                setInitialContent(JSON.parse(content.articleContent[0]))
            } else {
                const jsonData = { doc: content.articleContent[0] }
                setInitialContent(jsonData)
            }
        }
        // else if (editor) {
        //     // const noContent = {
        //     //     type: 'doc',
        //     //     content: [
        //     //         {
        //     //             type: 'paragraph',
        //     //             content: [
        //     //                  { type: 'text', text: 'No article has been added yet. Please come back later for an interesting article to learn from...' },
        //     //             ],
        //     //         },
        //     //     ],
        //     // }
        //     // setInitialContent(noContent)
        // }
    }, [content])

    useEffect(() => {
        setIsCompleted(status === 'Completed')
    }, [status])

    return (
        <ScrollArea className="h-full">
            <div className="mt-24 text-left">
                <h1 className="font-bold text-lg my-5">{content?.title}</h1>
                <div className="mt-2 text-start">
                    <RemirrorTextEditor
                        initialContent={initialContent}
                        setInitialContent={setInitialContent}
                        preview={true}
                    />
                </div>
                {!isCompleted && (
                    <div className="my-10 text-end">
                        <Button
                            disabled={
                                !content?.articleContent ||
                                !content.articleContent.some((doc: any) =>
                                    doc?.content?.some(
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
