'use client'
import React from 'react'
import { EditorContent } from '@tiptap/react'

const TiptapEditor = ({
    editor,
    chapterContent,
}: {
    editor: any
    chapterContent: any
}) => {
    return (
        <div>
            <div className="bg-muted/80 p-2 rounded-sm mt-4">
                <EditorContent editor={editor} className="min-h-80" />
            </div>
        </div>
    )
}

export default TiptapEditor
