import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'
import Link from 'next/link'

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
    const [pdfLink, setPdfLink] = useState('')
    const [viewPdf, setViewPdf] = useState(false)
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
        if (content?.links && content.links.length > 0) {
            setPdfLink(content.links[0])
            setViewPdf(true)
        } else {
            setPdfLink('')
            setViewPdf(false)
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

    const action =
        initialContent &&
        (initialContent?.doc.content?.length > 1 ||
            initialContent?.doc.content[0].content[0].text !==
                'No content has been added yet')

    return (
        <ScrollArea className="h-full">
            <div className="mt-24 text-left">
                <h1 className="font-bold text-lg my-5">{content?.title}</h1>
                {viewPdf ? (
                    <div className="flex items-start   h-[38rem] flex-col gap-2 justify-start">
                        <h1 className="font-medium text-black">
                            Here is your learning material :-
                        </h1>
                        <iframe
                            src={pdfLink}
                            className="h-screen
                         w-[67rem]"
                        />
                    </div>
                ) : (
                    <div>
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
                                    disabled={!action}
                                    onClick={completeChapter}
                                >
                                    Mark as Done
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ScrollArea>
    )
}

export default Article
