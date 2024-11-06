import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
// import TiptapToolbar from '@/app/_components/editor/TiptapToolbar'
import TiptapToolbar from './TipTapToolbarforForm'
import Paragraph from '@tiptap/extension-paragraph'
import Dropcursor from '@tiptap/extension-dropcursor'
import Text from '@tiptap/extension-text'
import Image from '@tiptap/extension-image'
import Document from '@tiptap/extension-document'
import Code from '@tiptap/extension-code'
import Bold from '@tiptap/extension-bold'
import Heading from '@tiptap/extension-heading'

type Props = {}

const TipTapForForm = ({
    description,
    onChange,
}: {
    description: String
    onChange: (richText: String) => void
}) => {
    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            Image,
            Dropcursor,
            Code,
            Bold,
            Heading.configure({
                levels: [2],
            }),
        ],
        content: description,
        editorProps: {
            attributes: {
                class: 'rounded-md min-h-[150px]  border-input  ',
            },
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML())
        },
    })

    return (
        <div className="w-full ">
            <TiptapToolbar editor={editor} />
            <div className="">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}

export default TipTapForForm
