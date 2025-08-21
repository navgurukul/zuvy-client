'use client'
import React from 'react'
import { EditorContent } from '@tiptap/react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import{Editor} from '@/app/_components/editor/componentEditorType'
const TiptapEditor = ({ editor }: { editor: Editor }) => {
    return (
        <div className="focus:outline-none focus:border-0">
            <div className="bg-muted/80 py-4  rounded-sm  mt-2  text-start">
                <ScrollArea
                    // className={`${heightClass} pr-4`}

                    className="h-96 pr-4 md:pr-8 lg:pr-8"
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
