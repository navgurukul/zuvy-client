'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
    Bold,
    Strikethrough,
    Italic,
    List,
    ListOrdered,
    Minus,
    Undo,
    Redo,
    Code,
    Heading1Icon,
    LucideUnderline,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import Underline from '@tiptap/extension-underline'
import Heading from '@tiptap/extension-heading'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Text from '@tiptap/extension-text'

const extensions = [
    StarterKit,
    Underline,
    ListItem,
    Text,
    BulletList.configure({
        itemTypeName: 'listItem',
        HTMLAttributes: {
            class: 'list-disc inline-block text-left',
        },
    }),
    OrderedList.configure({
        HTMLAttributes: {
            class: 'list-decimal inline-block text-left',
        },
    }),
    Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
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
]
const content = `
<h1>This is a heading</h1>
<p>Press # and enter to create a heading:</p>
<p>Press backspace to remove the heading:</p>
<p>Press Enter/Space after a link and it will be converted to a link:</p>
www.google.com
`
interface TiptapProps {
    chapterContent: {
        id: number
        moduleId: number
    }
}

const TextEditorBtns = () => {
    const editor = useEditor({
        extensions,
        content,
    })
    const activeButtonStyles =
        'text-white flex items-center justify-center rounded-md  bg-green-900  focus:outline-none mr-2'

    const inActiveBtnStyles =
        'text-white flex items-center justify-center rounded-md  bg-secondary  focus:outline-none mr-2'
    return (
        <>
            <Button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                disabled={!editor?.can().chain().focus().toggleBold().run()}
                className={`${
                    editor?.isActive('bold')
                        ? activeButtonStyles
                        : inActiveBtnStyles
                }`}
            >
                <Bold />
            </Button>
            <Button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                disabled={!editor?.can().chain().focus().toggleItalic().run()}
                className={
                    editor?.isActive('italic')
                        ? activeButtonStyles
                        : inActiveBtnStyles
                }
            >
                <Italic />
            </Button>
            <Button
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                disabled={!editor?.can().chain().focus().toggleStrike().run()}
                className={
                    editor?.isActive('strike')
                        ? activeButtonStyles
                        : inActiveBtnStyles
                }
            >
                <Strikethrough />
            </Button>
            <Button
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className={
                    editor?.isActive('underline')
                        ? activeButtonStyles
                        : inActiveBtnStyles
                }
            >
                <LucideUnderline />
            </Button>
            <Button
                onClick={() => editor?.chain().focus().toggleCode().run()}
                disabled={!editor?.can().chain().focus().toggleCode().run()}
                className={
                    editor?.isActive('code')
                        ? activeButtonStyles
                        : inActiveBtnStyles
                }
            >
                <Code />
            </Button>

            <Button
                onClick={() =>
                    editor?.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={
                    editor?.isActive('heading', { level: 1 })
                        ? activeButtonStyles
                        : inActiveBtnStyles
                }
            >
                <Heading1Icon />
            </Button>

            <Button
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={
                    editor?.isActive('bulletList')
                        ? activeButtonStyles
                        : inActiveBtnStyles
                }
            >
                <List />
            </Button>
            <Button
                onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                }
                className={
                    editor?.isActive('orderedList')
                        ? activeButtonStyles
                        : inActiveBtnStyles
                }
            >
                <ListOrdered />
            </Button>

            <Button
                onClick={() =>
                    editor?.chain().focus().setHorizontalRule().run()
                }
                className="mr-2"
            >
                <Minus />
            </Button>
            <Button
                onClick={() => editor?.chain().focus().setHardBreak().run()}
                className="mr-2"
            >
                hard break
            </Button>
            <Button
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().chain().focus().undo().run()}
                className="mr-2"
            >
                <Undo />
            </Button>
            <Button
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().chain().focus().redo().run()}
            >
                <Redo />
            </Button>
        </>
    )
}

export default TextEditorBtns
