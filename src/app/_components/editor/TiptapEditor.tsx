'use client'
import React from 'react'
import { EditorContent } from '@tiptap/react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const TiptapEditor = ({ editor }: { editor: any }) => {
    return (
        <div>
            <div className="bg-muted/80 py-4 pl-2 pr-4  rounded-sm mt-2  text-start">
                <ScrollArea
                    // className={`${heightClass} pr-4`}

                    className="h-96"
                    type="hover"
                    style={{
                        scrollbarWidth: 'none', // Firefox
                        msOverflowStyle: 'none', // IE and Edge
                    }}
                >
                    {/* <ScrollBar /> */}
                    <EditorContent editor={editor} className="" />
                </ScrollArea>
            </div>
        </div>
    )
}

export default TiptapEditor
