import React, { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
    Bold,
    Strikethrough,
    Italic,
    List,
    ListOrdered,
    Heading2,
    Quote,
    Minus,
    Undo,
    Redo,
    Code,
    Paragraph,
    Heading3Icon,
    Heading2Icon,
    Heading1Icon,
    Heading4Icon,
    Heading5Icon,
    Heading6Icon,
    UnderlineIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Underline from '@tiptap/extension-underline'
import Heading from '@tiptap/extension-heading'
import Blockquote from '@tiptap/extension-blockquote'
import Link from '@tiptap/extension-link'

const extensions = [
    StarterKit,
    Underline,
    Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
            class: 'font-bold text-secondary',
        },
    }),
    Heading.configure({
        levels: [1],
        HTMLAttributes: {
            class: 'font-bold text-2xl',
        },
    }),
    Blockquote.configure({
        HTMLAttributes: {
            class: '',
        },
    }),
]
const content = `
<h1>This is a 1st level heading</h1>
<p>This is a paragraph</p>
<blockquote>This is a blockquote</blockquote>
Press enter after the link and it will be converted to a link:
www.google.com 
`

const Tiptap = () => {
    const editor = useEditor({
        extensions,
        content,
    })

    const isActive = 'bg-blue-700 text-black rounded-lg'
    const notActive = 'hover:bg-blue-500 hover:text-blue-700 hover:rounded-lg'

    // const setLink = useCallback(() => {
    //     const previousUrl = editor.getAttributes('link').href
    //     const url = window.prompt('URL', previousUrl)

    //     // cancelled
    //     if (url === null) {
    //         return
    //     }

    //     // empty
    //     if (url === '') {
    //         editor.chain().focus().extendMarkRange('link').unsetLink().run()

    //         return
    //     }

    //     // update link
    //     editor
    //         .chain()
    //         .focus()
    //         .extendMarkRange('link')
    //         .setLink({ href: url })
    //         .run()
    // }, [editor])

    if (!editor) {
        return null
    }

    const handleContent = () => {
        console.log(editor.getJSON())
    }
    return (
        <div>
            <div className="toolbar-btns flex">
                <div>
                    <Bold
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                        disabled={
                            !editor.can().chain().focus().toggleBold().run()
                        }
                        className={
                            editor.isActive('bold') ? `isActive` : notActive
                        }
                    />
                </div>

                <div>
                    <Italic
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        disabled={
                            !editor.can().chain().focus().toggleItalic().run()
                        }
                        className={
                            editor.isActive('italic') ? isActive : notActive
                        }
                    />
                </div>

                <div>
                    <Strikethrough
                        onClick={() =>
                            editor.chain().focus().toggleStrike().run()
                        }
                        disabled={
                            !editor.can().chain().focus().toggleStrike().run()
                        }
                        className={
                            editor.isActive('strike') ? isActive : notActive
                        }
                    />
                </div>

                <div>
                    <UnderlineIcon
                        onClick={(e) => {
                            e.preventDefault()
                            editor.chain().focus().toggleUnderline().run()
                        }}
                        className={
                            editor.isActive('underline') ? isActive : notActive
                        }
                    />
                </div>

                <div>
                    <Code
                        onClick={() =>
                            editor.chain().focus().toggleCode().run()
                        }
                        disabled={
                            !editor.can().chain().focus().toggleCode().run()
                        }
                        className={
                            editor.isActive('code') ? isActive : notActive
                        }
                    />
                </div>

                <div>
                    <Heading1Icon
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()
                        }
                        className={
                            editor.isActive('heading', { level: 1 })
                                ? isActive
                                : notActive
                        }
                    />
                </div>

                <div>
                    <Quote
                        onClick={(e) => {
                            e.preventDefault()
                            editor.chain().focus().toggleBlockquote().run()
                        }}
                        className={
                            editor.isActive('blockquote') ? isActive : notActive
                        }
                    />
                </div>

                <div>
                    <List
                        onClick={(e) => {
                            e.preventDefault()
                            editor.chain().focus().toggleBulletList().run()
                        }}
                        className={
                            editor.isActive('bulletList') ? isActive : notActive
                        }
                    />
                </div>

                <div>
                    <ListOrdered
                        onClick={(e) => {
                            e.preventDefault()
                            editor.chain().focus().toggleOrderedList().run()
                        }}
                        className={
                            editor.isActive('orderedList')
                                ? isActive
                                : notActive
                        }
                    />
                </div>

                <div>
                    <Minus
                        onClick={() =>
                            editor.chain().focus().setHorizontalRule().run()
                        }
                        className={
                            editor.isActive('horizontalRule')
                                ? isActive
                                : notActive
                        }
                    />
                </div>

                <div>
                    <Undo
                        onClick={(e) => {
                            e.preventDefault()
                            editor.chain().focus().undo().run()
                        }}
                        className={
                            editor.isActive('undo') ? isActive : notActive
                        }
                    />
                </div>

                <div>
                    <Redo
                        onClick={(e) => {
                            e.preventDefault()
                            editor.chain().focus().redo().run()
                        }}
                        className={
                            editor.isActive('redo') ? isActive : notActive
                        }
                    />
                </div>
            </div>

            {/* <div>
                <button
                    onClick={setLink}
                    className={
                        editor.isActive('link') ? 'is-active mr-10' : 'mr-10'
                    }
                >
                    setLink
                </button>
                <button
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    disabled={!editor.isActive('link')}
                >
                    unsetLink
                </button>
            </div> */}
            <div>
                <EditorContent editor={editor} />
            </div>
            <Button onClick={handleContent}>Save</Button>
        </div>
    )
}

export default Tiptap
