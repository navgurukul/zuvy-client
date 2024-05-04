'use client'

import { useEditor, EditorContent } from '@tiptap/react'
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

interface TiptapProps {
    editor: ReturnType<typeof useEditor>
}

const Tiptap = ({ editor }: TiptapProps) => {
    const activeButtonStyles =
        'text-white flex items-center justify-center rounded-md  bg-secondary  focus:outline-none mr-2'

    const inactiveBtnStyles =
        'text-black flex items-center justify-center bg-muted rounded-md focus:outline-none mr-2'

    return (
        <div>
            <div className="toolbar-btns flex justify-start">
                <Button
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    disabled={!editor?.can().chain().focus().toggleBold().run()}
                    className={`${
                        editor?.isActive('bold')
                            ? activeButtonStyles
                            : inactiveBtnStyles
                    }`}
                >
                    <Bold />
                </Button>
                <Button
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    disabled={
                        !editor?.can().chain().focus().toggleItalic().run()
                    }
                    className={
                        editor?.isActive('italic')
                            ? activeButtonStyles
                            : inactiveBtnStyles
                    }
                >
                    <Italic />
                </Button>
                <Button
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                    disabled={
                        !editor?.can().chain().focus().toggleStrike().run()
                    }
                    className={
                        editor?.isActive('strike')
                            ? activeButtonStyles
                            : inactiveBtnStyles
                    }
                >
                    <Strikethrough />
                </Button>
                <Button
                    onClick={() =>
                        editor?.chain().focus().toggleUnderline().run()
                    }
                    className={
                        editor?.isActive('underline')
                            ? activeButtonStyles
                            : inactiveBtnStyles
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
                            : inactiveBtnStyles
                    }
                >
                    <Code />
                </Button>

                <Button
                    onClick={() =>
                        editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 1 })
                            .run()
                    }
                    className={
                        editor?.isActive('heading', { level: 1 })
                            ? activeButtonStyles
                            : inactiveBtnStyles
                    }
                >
                    <Heading1Icon />
                </Button>

                <Button
                    onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                    }
                    className={
                        editor?.isActive('bulletList')
                            ? activeButtonStyles
                            : inactiveBtnStyles
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
                            : inactiveBtnStyles
                    }
                >
                    <ListOrdered />
                </Button>

                <Button
                    onClick={() =>
                        editor?.chain().focus().setHorizontalRule().run()
                    }
                    className={
                        editor?.isActive('horizontalRule')
                            ? activeButtonStyles
                            : inactiveBtnStyles
                    }
                >
                    <Minus />
                </Button>
                {/* <Button
                    onClick={() => editor?.chain().focus().setHardBreak().run()}
                    className="mr-2"
                >
                    hard break
                </Button> */}
                <Button
                    onClick={() => editor?.chain().focus().undo().run()}
                    disabled={!editor?.can().chain().focus().undo().run()}
                    className={
                        editor?.isActive('undo')
                            ? activeButtonStyles
                            : inactiveBtnStyles
                    }
                >
                    <Undo />
                </Button>
                <Button
                    onClick={() => editor?.chain().focus().redo().run()}
                    disabled={!editor?.can().chain().focus().redo().run()}
                    className={
                        editor?.isActive('redo')
                            ? activeButtonStyles
                            : inactiveBtnStyles
                    }
                >
                    <Redo />
                </Button>
            </div>

            <div className="bg-muted/80 p-2 rounded-sm my-4">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}

export default Tiptap
