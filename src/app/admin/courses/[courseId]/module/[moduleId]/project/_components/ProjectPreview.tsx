import React from 'react'
import { useEditor } from '@tiptap/react'
import extensions from '@/app/_components/editor/TiptapExtensions'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import TiptapEditor from '@/app/_components/editor/TiptapEditor'

type Props = {
    content: any
    setShowPreview: React.Dispatch<React.SetStateAction<boolean>>
}

const ProjectPreview = ({ content, setShowPreview }: Props) => {
    let editorContent

    if (
        content?.project &&
        Array.isArray(content.project) &&
        content.project.length > 0 &&
        content.project[0]?.instruction?.description &&
        content.project[0].instruction.description.length > 0 &&
        content.project[0].instruction.description[0]?.content &&
        content.project[0].instruction.description[0].content.length > 0
    ) {
        editorContent = content.project[0].instruction.description[0].content[0]
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
                            text: 'No Assignment added yet. Please come back later for some interesting article to learn from...',
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
                    {content?.project[0]
                        ? content.project[0].title
                        : 'No Title yet'}
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

export default ProjectPreview
