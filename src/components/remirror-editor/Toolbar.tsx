'use client'

import React, { useRef } from 'react'
import { useCommands, useActive } from '@remirror/react'
import {
    Camera,
    Code,
    Braces,
    Quote,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    ListOrdered,
    List,
} from 'lucide-react'
import './remirror-editor.css'
import { api } from '@/utils/axios.config'

export const Toolbar = () => {
    const {
        toggleBold,
        toggleItalic,
        toggleUnderline,
        toggleStrike,
        toggleHeading,
        toggleCode,
        toggleCodeBlock,
        toggleBlockquote,
        toggleBulletList,
        toggleOrderedList,
        focus,
    } = useCommands()
    const active = useActive()

    const fileInputRef = useRef<HTMLInputElement>(null)
    const { insertImage } = useCommands()

    const uploadImageToServer = async (file: File): Promise<string> => {
        // ⚠️ 1) Build the FormData
        const formData = new FormData()
        formData.append('images', file, file.name) // must match FilesInterceptor('images')

        try {
            // ⚠️ 2) Pass formData *directly*, not [formData]
            const response = await api.post(
                '/Content/curriculum/upload-images',
                formData,
                {
                    // Let axios set the correct multipart boundary for you:
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            )

            // response.data should be { urls: string[] }
            const { urls } = response.data as { urls: string[] }
            return urls[0] // or whatever index you need
        } catch (err: any) {
            console.error('Image upload failed:', err)
            throw err
        }
    }

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Create a URL for the uploaded image
        // const imageUrl = URL.createObjectURL(file)
        const imageUrl = file && (await uploadImageToServer(file))

        // Insert the image into the editor
        insertImage({ src: imageUrl, alt: file.name })

        // Focus the editor after inserting the image
        // Use setTimeout to ensure the image insertion is complete
        setTimeout(() => {
            focus()
        }, 100)

        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="sticky top-0 z-10 bg-white border-b p-2 flex flex-wrap gap-2">
            {/* Text formatting */}
            <button
                onClick={() => toggleBold()}
                className={`p-2 rounded ${
                    active.bold() ? 'bg-[#d1d5db]' : 'hover:bg-gray-200'
                }`}
                title="Bold"
                type="button"
            >
                <Bold size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleItalic()}
                className={`p-2 rounded ${
                    active.italic() ? 'bg-[#d1d5db]' : 'hover:bg-gray-200'
                }`}
                title="Italic"
                type="button"
            >
                <Italic size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleUnderline()}
                className={`p-2 rounded ${
                    active.underline() ? 'bg-[#d1d5db]' : 'hover:bg-gray-200'
                }`}
                title="Underline"
                type="button"
            >
                <Underline size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleStrike()}
                className={`p-2 rounded ${
                    active.strike() ? 'bg-[#d1d5db]' : 'hover:bg-gray-200'
                }`}
                title="Strikethrough"
                type="button"
            >
                <Strikethrough size={18} className="text-gray-700" />
            </button>

            <div className="border-l h-8 mx-1"></div>

            {/* Headings */}
            <button
                onClick={() => toggleHeading({ level: 1 })}
                className={`p-2 rounded ${
                    active.heading({ level: 1 })
                        ? 'bg-[#d1d5db]'
                        : 'hover:bg-gray-200'
                }`}
                title="Heading 1"
                type="button"
            >
                <Heading1 size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleHeading({ level: 2 })}
                className={`p-2 rounded ${
                    active.heading({ level: 2 })
                        ? 'bg-[#d1d5db]'
                        : 'hover:bg-gray-200'
                }`}
                title="Heading 2"
                type="button"
            >
                <Heading2 size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleHeading({ level: 3 })}
                className={`p-2 rounded ${
                    active.heading({ level: 3 })
                        ? 'bg-[#d1d5db]'
                        : 'hover:bg-gray-200'
                }`}
                title="Heading 3"
                type="button"
            >
                <Heading3 size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleHeading({ level: 4 })}
                className={`p-2 rounded ${
                    active.heading({ level: 4 })
                        ? 'bg-[#d1d5db]'
                        : 'hover:bg-gray-200'
                }`}
                title="Heading 4"
                type="button"
            >
                <Heading4 size={18} className="text-gray-700" />
            </button>

            <div className="border-l h-8 mx-1"></div>

            {/* Lists */}
            <button
                onClick={() => toggleBulletList()}
                className={`p-2 rounded ${
                    active.bulletList() ? 'bg-[#d1d5db]' : 'hover:[#d1d5db]'
                }`}
                title="Bullet List"
                type="button"
            >
                <List size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleOrderedList()}
                className={`p-2 rounded ${
                    active.orderedList() ? 'bg-[#d1d5db]' : 'hover:bg-gray-200'
                }`}
                title="Ordered List"
                type="button"
            >
                <ListOrdered size={18} className="text-gray-700" />
            </button>

            <div className="border-l h-8 mx-1"></div>

            {/* Block elements */}

            <button
                onClick={() => toggleCode()}
                className={`p-2 rounded ${
                    active.code() ? 'bg-[#d1d5db]' : 'hover:bg-gray-200'
                }`}
                title="Code"
                type="button"
            >
                <Code size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleCodeBlock()}
                className={`p-2 rounded ${
                    active.codeBlock() ? 'bg-[#d1d5db]' : 'hover:bg-gray-200'
                }`}
                title="Code Block"
                type="button"
            >
                <Braces size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleBlockquote()}
                className={`p-2 rounded ${
                    active.blockquote() ? 'bg-[#cbd1da]' : 'hover:bg-gray-200'
                }`}
                title="Blockquote"
                type="button"
            >
                <Quote size={18} className="text-gray-700" />
            </button>

            <div className="border-l h-8 mx-1"></div>

            {/* Image upload */}
            <div className="flex items-center">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                />
                <label
                    htmlFor="image-upload"
                    className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-200"
                >
                    <Camera size={18} className="text-gray-700" />
                </label>
            </div>
        </div>
    )
}
