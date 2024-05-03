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
    Heading3Icon,
    Heading2Icon,
    Heading1Icon,
    Heading4Icon,
    Heading5Icon,
    Heading6Icon,
    UnderlineIcon,
    LucideUnderline,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Underline from '@tiptap/extension-underline'
import Heading from '@tiptap/extension-heading'
import Blockquote from '@tiptap/extension-blockquote'
import Link from '@tiptap/extension-link'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

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
                <ToggleGroup type="multiple">
                    <ToggleGroupItem
                        value="bold"
                        aria-label="Toggle bold"
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                        disabled={
                            !editor.can().chain().focus().toggleBold().run()
                        }
                        // className={
                        //     editor.isActive('bold') ? isActive : notActive
                        // }
                    >
                        <Bold />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="italic"
                        aria-label="Toggle italic"
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        // disabled={
                        //     !editor.can().chain().focus().toggleItalic().run()
                        // }
                        // className={
                        //     editor.isActive('italic') ? isActive : notActive
                        // }
                    >
                        <Italic />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="underline"
                        aria-label="Toggle underline"
                        onClick={() =>
                            editor.chain().focus().toggleUnderline().run()
                        }
                        disabled={
                            !editor
                                .can()
                                .chain()
                                .focus()
                                .toggleUnderline()
                                .run()
                        }
                        // className={
                        //     editor.isActive('strike') ? isActive : notActive
                        // }
                    >
                        <LucideUnderline />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="strikethrough"
                        aria-label="Toggle underline"
                        onClick={() =>
                            editor.chain().focus().toggleStrike().run()
                        }
                        disabled={
                            !editor.can().chain().focus().toggleStrike().run()
                        }
                        // className={
                        //     editor.isActive('strike') ? isActive : notActive
                        // }
                    >
                        <Strikethrough />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="code"
                        aria-label="Toggle code"
                        onClick={() =>
                            editor.chain().focus().toggleCode().run()
                        }
                        disabled={
                            !editor.can().chain().focus().toggleCode().run()
                        }
                    >
                        <Code />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="heading1"
                        aria-label="Toggle heading1"
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()
                        }
                        disabled={
                            !editor
                                .can()
                                .chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()
                        }
                    >
                        <Heading1Icon />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="quote"
                        aria-label="Toggle quote"
                        onClick={() => {
                            editor.chain().focus().toggleBlockquote().run()
                        }}
                        disabled={
                            !editor
                                .can()
                                .chain()
                                .focus()
                                .toggleBlockquote()
                                .run()
                        }
                    >
                        <Quote />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="list"
                        aria-label="Toggle list"
                        onClick={() => {
                            editor.chain().focus().toggleBulletList().run()
                        }}
                        disabled={
                            !editor
                                .can()
                                .chain()
                                .focus()
                                .toggleBulletList()
                                .run()
                        }
                    >
                        <List />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="orderedList"
                        aria-label="Toggle ordered list"
                        onClick={() => {
                            editor.chain().focus().toggleOrderedList().run()
                        }}
                        disabled={
                            !editor
                                .can()
                                .chain()
                                .focus()
                                .toggleOrderedList()
                                .run()
                        }
                    >
                        <ListOrdered />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="horizontalRule"
                        aria-label="Toggle horizontal rule"
                        onClick={() => {
                            editor.chain().focus().setHorizontalRule().run()
                        }}
                        disabled={
                            !editor
                                .can()
                                .chain()
                                .focus()
                                .setHorizontalRule()
                                .run()
                        }
                    >
                        <Minus />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="undo"
                        aria-label="Toggle undo"
                        onClick={() => {
                            editor.chain().focus().undo().run()
                        }}
                        disabled={!editor.can().chain().focus().undo().run()}
                    >
                        <Undo />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="redo"
                        aria-label="Toggle redo"
                        onClick={() => {
                            editor.chain().focus().redo().run()
                        }}
                        disabled={!editor.can().chain().focus().redo().run()}
                    >
                        <Redo />
                    </ToggleGroupItem>
                </ToggleGroup>

                {/* 

                

              

                

                

                

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
                </div> */}
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
            <div className="bg-muted/80 p-2 rounded-sm mt-4">
                <EditorContent editor={editor} />
            </div>
            <div className="text-end">
                <Button onClick={handleContent} className="mt-5">
                    Save
                </Button>
            </div>
        </div>
    )
}

export default Tiptap
