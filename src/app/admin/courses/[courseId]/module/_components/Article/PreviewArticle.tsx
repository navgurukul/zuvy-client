import { useEditor } from '@tiptap/react'
import React from 'react'
import extensions from '@/app/_components/editor/TiptapExtensions'
import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

type Props = {}

const PreviewArticle = ({
    content,
    setShowPreview,
}: {
    content: any
    setShowPreview: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    console.log(content)

    let editorContent

    if (
        content?.contentDetails &&
        Array.isArray(content.contentDetails) &&
        content.contentDetails.length > 0 &&
        content.contentDetails[0]?.content &&
        content.contentDetails[0].content.length > 0
    ) {
        editorContent = content.contentDetails[0].content[0]
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

    return (
        <div>
            <div className="flex  flex-col items-start">
                <h1 className="text-2xl font-semibold text-left">
                    {content?.title ? content.title : 'No Title yet'}
                </h1>
                <Button
                    onClick={() => setShowPreview(false)}
                    className="gap-x-1 flex items-center"
                    variant={'ghost'}
                >
                    <X className="text-red-400" size={15} />
                    <h1 className="text-red-400">Close Preview</h1>
                </Button>
            </div>

            <TiptapEditor editor={editor} />
            <div className="mt-2 text-end">
                <Button>Mark as Done</Button>
            </div>
        </div>
    )
}

export default PreviewArticle
