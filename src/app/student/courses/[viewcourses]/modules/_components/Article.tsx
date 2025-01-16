import { Editor, useEditor } from '@tiptap/react'
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
    let editorContent;

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

    return (
        <>
            <TiptapEditor editor={editor} />
            <div className="mt-2 text-end">
                <Button onClick={completeChapter}>Mark as Done</Button>
            </div>
        </>
    );
}

export default Article;
