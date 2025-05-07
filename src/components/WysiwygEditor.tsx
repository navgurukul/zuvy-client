'use client'

import React, { useCallback, useState, useRef, useEffect } from 'react'
import type { RemirrorJSON } from 'remirror'
import { OnChangeJSON } from '@remirror/react'
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg'
import { useCommands } from '@remirror/react'
import { Camera } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface MyEditorProps {
    onChange: (json: RemirrorJSON) => void
    initialContent?: RemirrorJSON
}

// Create a custom toolbar button for image uploads
const ImageUploadButton = () => {
    const { insertImage } = useCommands()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Create a URL for the uploaded image
        const imageUrl = URL.createObjectURL(file)

        // Insert the image into the editor
        insertImage({ src: imageUrl, alt: file.name })

        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
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
                className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
            >
                <Camera size={18} className="text-gray-600" />
                <span className="ml-2">Upload Image</span>
            </label>
        </div>
    )
}

export const RemirrorTextEditor = ({
    initialContent,
    setInitialContent,
}: {
    initialContent: RemirrorJSON | null | undefined
    setInitialContent: (content: any) => void
}) => {
    // Track the editor key to force remounts when initialContent changes significantly
    const [editorKey, setEditorKey] = useState<number>(0)

    // Store the last seen initialContent to detect changes
    const lastContentRef = useRef<string>(JSON.stringify(initialContent || {}))

    // Track if the editor has received initial focus
    const hasInitialFocus = useRef<boolean>(false)

    // Track if we're in the middle of editing
    const isEditingRef = useRef<boolean>(false)

    // Handle debounced updates to parent
    const debouncedUpdate = useCallback(
        (json: RemirrorJSON) => {
            isEditingRef.current = true
            setInitialContent(json)
        },
        [setInitialContent]
    )

    // Handle changes from the editor
    const handleEditorChange = useCallback(
        (json: RemirrorJSON) => {
            // Mark that we've started editing
            hasInitialFocus.current = true

            // Debounce updates to parent
            const timeoutId = setTimeout(() => {
                debouncedUpdate(json)
            }, 300)

            return () => clearTimeout(timeoutId)
        },
        [debouncedUpdate]
    )

    // Effect to handle external initialContent updates
    useEffect(() => {
        const currentContentString = JSON.stringify(initialContent || {})

        // Check if content has significantly changed from external source
        if (
            currentContentString !== lastContentRef.current &&
            !isEditingRef.current
        ) {
            // If it's a significant change, force a remount
            lastContentRef.current = currentContentString
            setEditorKey((prevKey) => prevKey + 1)
        }

        // Reset editing flag after each external update check
        isEditingRef.current = false
    }, [initialContent])

    return (
        <ScrollArea
            className="h-96 pr-8 "
            type="hover"
            style={{
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE and Edge
            }}
        >
            <WysiwygEditor
                key={editorKey}
                placeholder="Start typing..."
                initialContent={initialContent || undefined}
            >
                <div className="sticky top-0 z-10 bg-white pb-2">
                    <ImageUploadButton />
                </div>
                <OnChangeJSON onChange={handleEditorChange} />
            </WysiwygEditor>
        </ScrollArea>
    )
}
