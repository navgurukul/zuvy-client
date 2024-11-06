'use client'
import React, { useCallback, useState } from 'react'
import { type Editor } from '@tiptap/react'
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
    Heading2Icon,
    Heading3Icon,
    Heading4Icon,
    Heading5Icon,
    Heading6Icon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    ImageIcon,
    Video,
    BoldIcon,
    Code2Icon,
} from 'lucide-react'
import {
    Dialog,
    DialogOverlay,
    DialogTrigger,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import { Toggle } from '@/components/ui/toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const TiptapToolbar = ({ editor }: { editor: Editor | null }) => {
    const [selectedHeading, setSelectedHeading] = useState('H1')
    const [isDropdownOpen, setDropdownOpen] = useState(false)
    const [isDialogOpen, setDialogOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [inputType, setInputType] = useState('')

    const addImage = useCallback(() => {
        setInputType('image')
        setDialogOpen(true)
    }, [])
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    const handleDialogClose = () => {
        if (inputValue) {
            if (inputType === 'image') {
                editor
                    ?.chain()
                    .focus()
                    .setImage({ src: inputValue, alt: 'Image' })
                    .run()
            } else if (inputType === 'video') {
                editor?.commands.setYoutubeVideo({ src: inputValue })
            }
        }
        setInputValue('')
        setDialogOpen(false)
    }

    if (!editor) return null

    return (
        <div>
            <Toggle
                size={'sm'}
                pressed={editor.isActive('heading')}
                onPressedChange={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
            >
                <Heading2Icon className="w-4 h-4" />
            </Toggle>{' '}
            <Toggle
                size={'sm'}
                pressed={editor.isActive('bold')}
                onPressedChange={() =>
                    editor.chain().focus().toggleBold().run()
                }
            >
                <BoldIcon className="w-4 h-4" />
            </Toggle>{' '}
            <Toggle
                size={'sm'}
                pressed={editor.isActive('code')}
                onPressedChange={() =>
                    editor.chain().focus().toggleCode().run()
                }
            >
                <Code2Icon className="w-4 h-4" />
            </Toggle>
            <Toggle
                onClick={addImage}
                className="mr-2 px-2 py-1 bg-white text-black hover:bg-secondary hover:text-white"
            >
                <ImageIcon />
            </Toggle>
            {/* <Toggle
                size={'sm'}
                pressed={editor.isActive('left')}
                onPressedChange={() => () =>
                    editor.chain().focus().setTextAlign('left').run()}
                className={
                    editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''
                }
            >
                <AlignLeft className="w-4 h-4" />
            </Toggle> */}
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogOverlay />
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle> Add {inputType}</DialogTitle>
                        <div className="py-4">
                            <Input
                                type="text"
                                id={inputType}
                                placeholder={
                                    inputType === 'image'
                                        ? 'Enter Image URL'
                                        : 'Enter Video URL'
                                }
                                value={inputValue}
                                onChange={handleInputChange}
                            />
                        </div>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <DialogClose asChild>
                            <Button onClick={handleDialogClose}>
                                Submit Url
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default TiptapToolbar
