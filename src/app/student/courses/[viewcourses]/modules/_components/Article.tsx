import { Editor, useEditor } from '@tiptap/react'
import React, { useEffect, useState } from 'react'
import extensions from '@/app/_components/editor/TiptapExtensions'
import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import '@/app/_components/editor/Tiptap.css'
import { Button } from '@/components/ui/button'

function Article({
    content,
    completeChapter,
    status,
}: {
    content: any
    completeChapter: () => void
    status:string
}) {
    let editorContent;
    const [isCompleted, setIsCompleted] = useState<boolean>(false)

    if (content?.articleContent && Array.isArray(content.articleContent) && content.articleContent.length > 0) {
        editorContent = content.articleContent[0];
    } else {
        editorContent = {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    attrs: {
                        textAlign: "left",
                    },
                    content: [
                        {
                            text: "No article added yet. Please come back later for some interesting article to learn from...",
                            type: "text",
                        },
                    ],
                },
            ],
        };
    }

    const editor = useEditor({
        extensions,
        content: editorContent,
        editable: false,
    });
    
    useEffect(()=>{
        setIsCompleted(status === "Completed")
        
    },[status])

    return (
        <>
            <TiptapEditor editor={editor} />
            {!isCompleted && (
                   <div className="mt-2 text-end">
                   <Button onClick={completeChapter}>Mark as Done</Button>
               </div>
            )}
        </>
    );
}

export default Article;
