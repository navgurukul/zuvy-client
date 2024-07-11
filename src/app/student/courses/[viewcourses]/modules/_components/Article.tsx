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
    // if (content.articleContent === null) {
    //     return <div>Article Content Not Added Yet</div>
    // }

    const editor = useEditor({
        extensions,
        content: content.articleContent[0] || `<h1>No Content Added Yet</h1>`,
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
