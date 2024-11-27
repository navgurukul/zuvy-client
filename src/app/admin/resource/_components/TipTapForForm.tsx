import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
<<<<<<< HEAD
import StarterKit from '@tiptap/starter-kit'
// import TiptapToolbar from '@/app/_components/editor/TiptapToolbar'
import TipTapToolbarforForm from './TipTapToolbarforForm'
import Paragraph from '@tiptap/extension-paragraph'
import Dropcursor from '@tiptap/extension-dropcursor'
import Text from '@tiptap/extension-text'
import Image from '@tiptap/extension-image'
import Document from '@tiptap/extension-document'
import Code from '@tiptap/extension-code'
import Bold from '@tiptap/extension-bold'
import Heading from '@tiptap/extension-heading'
=======

import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import extensions from '@/app/_components/editor/TiptapExtensions'
import TiptapToolbarforForm from './TipTapToolbarforForm'
>>>>>>> df6a03afe18827e065f032f510b5e9069eed1ddb

type Props = {}

const TipTapForForm = ({
    description,
    onChange,
}: {
    description: String
    onChange: (richText: String) => void
}) => {
    const editor = useEditor({
<<<<<<< HEAD
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
                class: 'rounded-md min-h-[150px] border-input  ',
            },
        },
=======
        extensions,
        content: description,
>>>>>>> df6a03afe18827e065f032f510b5e9069eed1ddb
        onUpdate({ editor }) {
            onChange(editor.getHTML())
        },
    })

    return (
<<<<<<< HEAD
        <div className="w-full">
            <TipTapToolbarforForm editor={editor} />
            <EditorContent editor={editor} />
=======
        <div className="w-full ">
            <div className="text-left  ">
                <div className="w-1/2">
                    <TiptapToolbarforForm editor={editor} />
                </div>
                <div className="outline-1 outline">
                    <TiptapEditor editor={editor} />
                </div>
            </div>
>>>>>>> df6a03afe18827e065f032f510b5e9069eed1ddb
        </div>
    )
}

export default TipTapForForm
