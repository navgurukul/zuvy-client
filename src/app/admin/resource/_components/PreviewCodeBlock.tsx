import { Button } from '@/components/ui/button'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
// load all languages with "all" or common languages with "common"
import { all, createLowlight } from 'lowlight'
import React from 'react'

// create a lowlight instance with all languages loaded
const lowlight = createLowlight(all)

// This is only an example, all supported languages are already loaded above
// but you can also register only specific languages to reduce bundle-size
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)

// Define the type of the prop (question)
interface MyEditorProps {
    question: string
}

const MyEditorComponent: React.FC<MyEditorProps> = ({ question }) => {
    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            CodeBlockLowlight.configure({
                lowlight,
            }),
        ],
        content: question, // Use the 'question' prop as the content
    })

    if (!editor) {
        return null
    }

    return (
        <div>
            <div className="control-group">
                <div className="button-group">
                    <Button
                        onClick={() =>
                            editor.chain().focus().toggleCodeBlock().run()
                        }
                        className={
                            editor.isActive('codeBlock') ? 'is-active' : ''
                        }
                    >
                        Toggle code block
                    </Button>
                    <Button
                        onClick={() =>
                            editor.chain().focus().setCodeBlock().run()
                        }
                        disabled={editor.isActive('codeBlock')}
                    >
                        Set code block
                    </Button>
                </div>
            </div>
            <EditorContent editor={editor} />
        </div>
    )
}

export default MyEditorComponent
