import { Editor, EditorContent, useEditor } from '@tiptap/react'
import React from 'react'
import extensions from '@/app/_components/editor/TiptapExtensions'
import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import '@/app/_components/editor/Tiptap.css'
import { Button } from '@/components/ui/button'

function Article({
    content,
    completeChapter,
}: {
    content: any
    completeChapter: () => void
}) {
    const editor = useEditor({
        extensions,
        content: content.articleContent[0],
        editable: false,
    })

    return (
        <>
            <TiptapEditor editor={editor} />
            <div className="mt-2 text-end">
                <Button onClick={completeChapter}>Mark as Done</Button>
            </div>
        </>
    )
}

export default Article
