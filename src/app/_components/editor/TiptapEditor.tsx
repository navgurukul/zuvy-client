'use client'
import React from 'react'
import { EditorContent } from '@tiptap/react'

const TiptapEditor = ({ editor }: { editor: any }) => {
    return (
        <div>
            <div className="bg-muted/80 py-4 pl-2 pr-4  rounded-sm mt-2  text-start">
                <EditorContent editor={editor} className="min-h-80 " />
            </div>
        </div>
    )
}

export default TiptapEditor
