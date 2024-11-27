'use client'
import React, { useCallback, useState } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

const activeButtonStyles =
    'text-white flex rounded-md bg-secondary text-white focus:outline-none mr-2 px-2 py-1'

const inActiveBtnStyles =
    'text-white flex rounded-md bg-white text-black focus:outline-none mr-2 px-2 py-1'

const activeHeadingButtonStyles =
    'text-white flex rounded-md bg-secondary text-white focus:outline-none px-2 py-1'

const inActiveHeadingButtonStyles =
    'text-white flex rounded-md bg-white text-black focus:outline-none px-2 py-1'

enum Level {
    Level1 = 1,
    Level2 = 2,
    Level3 = 3,
    Level4 = 4,
    Level5 = 5,
    Level6 = 6,
}

const TiptapToolbar = ({ editor }: { editor: any; mcqSide?: boolean }) => {
    const [selectedHeading, setSelectedHeading] = useState('H1')
    const [isDropdownOpen, setDropdownOpen] = useState(false)
    const [isDialogOpen, setDialogOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [inputType, setInputType] = useState('')

    const addImage = useCallback(() => {
        setInputType('image')
        setDialogOpen(true)
    }, [])

    const addYoutubeVideo = useCallback(() => {
        setInputType('video')
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

    return (
        <div>
            <div className="toolbar-btns flex">
                <Button
                    type="button"
                    onClick={addImage}
                    className="mr-2 px-2 py-1 bg-white text-black hover:bg-secondary hover:text-white"
                >
                    <ImageIcon />
                </Button>

                <Button
                    type="button"
                    onClick={addYoutubeVideo}
                    className="mr-2 px-2 py-1 bg-white text-black hover:bg-secondary hover:text-white"
                >
                    <Video />
                </Button>

                <Button
                    type="button"
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
                    type="button"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    disabled={
                        !editor?.can().chain().focus().toggleItalic().run()
                    }
                    className={
                        editor?.isActive('italic')
                            ? activeButtonStyles
                            : inActiveBtnStyles
                    }
                >
                    <Italic />
                </Button>
                <Button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                    disabled={
                        !editor?.can().chain().focus().toggleStrike().run()
                    }
                    className={
                        editor?.isActive('strike')
                            ? activeButtonStyles
                            : inActiveBtnStyles
                    }
                >
                    <Strikethrough />
                </Button>
                <Button
                    type="button"
                    onClick={() =>
                        editor?.chain().focus().toggleUnderline().run()
                    }
                    className={
                        editor?.isActive('underline')
                            ? activeButtonStyles
                            : inActiveBtnStyles
                    }
                >
                    <LucideUnderline />
                </Button>
                <Button
                    type="button"
                    onClick={() =>
                        editor?.chain().focus().setTextAlign('left').run()
                    }
                    className={
                        editor?.isActive({ textAlign: 'left' })
                            ? activeButtonStyles
                            : inActiveBtnStyles
                    }
                >
                    <AlignLeft />
                </Button>
                <Button
                    onClick={() =>
                        editor?.chain().focus().setTextAlign('center').run()
                    }
                    className={
                        editor?.isActive({ textAlign: 'center' })
                            ? activeButtonStyles
                            : inActiveBtnStyles
                    }
                >
                    <AlignCenter />
                </Button>
                <Button
                    onClick={() =>
                        editor?.chain().focus().setTextAlign('right').run()
                    }
                    className={
                        editor?.isActive({ textAlign: 'right' })
                            ? activeButtonStyles
                            : inActiveBtnStyles
                    }
                >
                    <AlignRight />
                </Button>

                <Button
                    type="button"
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
                    type="button"
                    onClick={() =>
                        editor
                            ?.chain()
                            .focus()
                            .toggleHeading({
                                level: Number(
                                    selectedHeading.replace(/\D/g, '')
                                ) as Level,
                            })
                            .run()
                    }
                    className={
                        editor?.isActive('heading', {
                            level: Number(
                                selectedHeading.replace(/\D/g, '')
                            ) as Level,
                        })
                            ? activeHeadingButtonStyles
                            : inActiveHeadingButtonStyles
                    }
                >
                    {selectedHeading === 'H1' && <Heading1Icon />}
                    {selectedHeading === 'H2' && <Heading2Icon />}
                    {selectedHeading === 'H3' && <Heading3Icon />}
                    {selectedHeading === 'H4' && <Heading4Icon />}
                    {selectedHeading === 'H5' && <Heading5Icon />}
                    {selectedHeading === 'H6' && <Heading6Icon />}
                </Button>

                <Select
                    onValueChange={(value: any) => {
                        setSelectedHeading(value)
                        setDropdownOpen(false)
                    }}
                    onOpenChange={(isOpen: boolean) => setDropdownOpen(isOpen)}
                >
                    <SelectTrigger
                        className="mr-2 w-15 focus:ring-transparent "
                        onClick={() => setDropdownOpen(!isDropdownOpen)}
                    >
                        {isDropdownOpen && selectedHeading && (
                            <SelectValue placeholder={selectedHeading} />
                        )}
                    </SelectTrigger>
                    {isDropdownOpen && (
                        <SelectContent>
                            <SelectGroup className="p-0 justify-start text-center">
                                <SelectLabel></SelectLabel>
                                <SelectItem value="H1">H1</SelectItem>
                                <SelectItem value="H2">H2</SelectItem>
                                <SelectItem value="H3">H3</SelectItem>
                                <SelectItem value="H4">H4</SelectItem>
                                <SelectItem value="H5">H5</SelectItem>
                                <SelectItem value="H6">H6</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    )}
                </Select>

                <Button
                    type="button"
                    onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                    }
                    className={
                        editor?.isActive('bulletList')
                            ? activeButtonStyles
                            : inActiveBtnStyles
                    }
                >
                    <List />
                </Button>
                <Button
                    type="button"
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
                    type="button"
                    onClick={() =>
                        editor?.chain().focus().setHorizontalRule().run()
                    }
                    className="mr-2 bg-white text-black hover:bg-secondary hover:text-white px-2 py-1"
                >
                    <Minus />
                </Button>

                <Button
                    type="button"
                    onClick={() => editor?.chain().focus().undo().run()}
                    disabled={!editor?.can().chain().focus().undo().run()}
                    className="mr-2 px-2 py-1 bg-white text-black hover:bg-secondary hover:text-white"
                >
                    <Undo />
                </Button>
                <Button
                    type="button"
                    onClick={() => editor?.chain().focus().redo().run()}
                    disabled={!editor?.can().chain().focus().redo().run()}
                    className="mr-2 px-2 py-1 bg-white text-black hover:bg-secondary hover:text-white"
                >
                    <Redo />
                </Button>
            </div>

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
