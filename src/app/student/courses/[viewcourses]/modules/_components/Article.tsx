import { Editor, useEditor } from '@tiptap/react'
import React, { useEffect, useState } from 'react'
import extensions from '@/app/_components/editor/TiptapExtensions'
import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import '@/app/_components/editor/Tiptap.css'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'

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
    const [initialContent, setInitialContent] = useState()

    if (
        content?.articleContent &&
        Array.isArray(content.articleContent) &&
        content.articleContent.length > 0
    ) {
        // console.log(
        //     'content.articleContent',
        //     JSON.parse(content.articleContent[0])
        // )
        editorContent = content.articleContent[0]
        // const articleContent = JSON.parse(content.articleContent[0])
        // console.log('articleContent', articleContent.doc)
        // editorContent = { doc: content.articleContent[0] }
        // setInitialContent(JSON.parse(content.articleContent[0]))
        // if (typeof content.articleContent[0] === 'string') {
        //     const json = JSON.parse(content.articleContent[0])
        //     setInitialContent(json.doc)
        // } else {
        //     setInitialContent(content.articleContent[0])
        // }
        console.log('content.articleContent[0]', content.articleContent[0])
        // setInitialContent(JSON.parse(editorContent))
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

    console.log('initialContent', initialContent)

    const editor = useEditor({
        extensions,
        content: editorContent,
        editable: false,
    })

    useEffect(() => {
        setIsCompleted(status === 'Completed')
    }, [status])

    return (
        <ScrollArea className="h-full">
            <div className="mt-24 text-left">
                <h1 className="font-bold text-lg my-5">{content?.title}</h1>
                <TiptapEditor editor={editor} />
                <RemirrorTextEditor
                    initialContent={initialContent}
                    setInitialContent={setInitialContent}
                    preview={true}
                />
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
