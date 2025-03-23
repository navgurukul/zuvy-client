import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'

import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import extensions from '@/app/_components/editor/TiptapExtensions'
import TiptapToolbarforForm from './TipTapToolbarforForm'

type Props = {}

const TipTapForForm = ({
    description,
    onChange,
}: {
    description: String
    onChange: (richText: String) => void
}) => {
    const editor = useEditor({
        extensions,
        content: description,
        onUpdate({ editor }) {
            onChange(editor.getHTML())
        },
    })

    return (
        <div className="w-full ">
            <div className="text-left  ">
                <div className="w-1/2">
                    <TiptapToolbarforForm editor={editor} />
                </div>
                <div className="outline-1 outline">
                    <TiptapEditor editor={editor} />
                </div>
            </div>
        </div>
    )
}

export default TipTapForForm
