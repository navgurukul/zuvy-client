
'use client'

import React, { useCallback, useRef, useEffect } from 'react'
import {
    useRemirror,
    Remirror,
    EditorComponent,
    ThemeProvider,
    useActive,
    useCommands,
    useEditorEvent,
} from '@remirror/react'
import {
    BoldExtension,
    ItalicExtension,
    HeadingExtension,
    CodeExtension,
    CodeBlockExtension,
    ImageExtension,
    BlockquoteExtension,
    CalloutExtension,
    UnderlineExtension,
    StrikeExtension,
    BulletListExtension,
    OrderedListExtension,
    ListItemExtension,
} from 'remirror/extensions'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Toolbar } from './Toolbar'
import './remirror-editor.css'
import useWindowSize from '@/hooks/useHeightWidth'
import { useThemeStore } from '@/store/store'
import {RemirrorTextEditorProps} from "@/components/remirror-editor/componentRemirrorType"
import { toast } from '@/components/ui/use-toast'

// Image compression utility
const compressImage = (file: File, maxWidth = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                // Calculate new dimensions
                if (width > maxWidth) {
                    height = (height * maxWidth) / width
                    width = maxWidth
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Could not get canvas context'))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)

                // Convert to compressed base64 with lower quality
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
                
                console.log('Original size:', (e.target?.result as string).length / 1024, 'KB')
                console.log('Compressed size:', compressedBase64.length / 1024, 'KB')
                
                resolve(compressedBase64)
            }
            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = e.target?.result as string
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

// Create empty content structure
const createEmptyContent = () => {
    return {
        type: 'doc',
        content: [
            {
                type: 'paragraph',
                content: [],
            },
        ],
    }
}

// Create a simple default content if needed
const createPreviewDefaultContent = () => {
    return {
        type: 'doc',
        content: [
            {
                type: 'paragraph',
                content: [
                    {
                        type: 'text',
                        text: 'No content has been added yet',
                    },
                ],
            },
        ],
    }
}

const CodeBlockHelper = () => {
    const active = useActive()

    if (!active.codeBlock()) {
        return null
    }

    return (
        <div className="absolute bottom-2 left-2 right-2 z-10 bg-blue-100 border border-blue-300 rounded px-3 py-2 shadow-sm">
            <p className="text-xs text-blue-700 font-medium m-0">
                💡 Press Ctrl+Enter to exit code block and add a new line below.
            </p>
        </div>
    )
}

// Custom hook to handle paste events
const usePasteImageHandler = () => {
    const commands = useCommands()
    const toastShownRef = useRef(false)

    useEditorEvent('paste', (event) => {
        const clipboardData = event.clipboardData
        if (!clipboardData) return false

        const items = Array.from(clipboardData.items)
        const imageItem = items.find(item => item.type.startsWith('image/'))

        if (imageItem) {
            event.preventDefault()
            
            const file = imageItem.getAsFile()
            if (!file) return true

            // Process image compression asynchronously
            const processImage = async () => {
                try {
                    // Show loading toast
                    if (!toastShownRef.current) {
                        // toast.info({
                        //     title: 'Processing Image',
                        //     description: 'Compressing image, please wait...',
                        // })
                        toastShownRef.current = true
                    }

                    // Compress the image
                    const compressedBase64 = await compressImage(file, 800, 0.6)

                    // Insert the compressed image
                    commands.insertImage({ src: compressedBase64 })

                    // Show success toast
                    setTimeout(() => {
                        toast.success({
                            title: 'Image Added',
                            description: 'Image compressed and inserted successfully.',
                        })
                        toastShownRef.current = false
                    }, 500)

                } catch (error) {
                    console.error('Failed to compress image:', error)
                    toast.error({
                        title: 'Error',
                        description: 'Failed to process image. Please try again.',
                    })
                    toastShownRef.current = false
                }
            }

            // Call async function without awaiting
            processImage()
            return true
        }

        return false
    })
}

const EditorWithPasteHandler = () => {
    usePasteImageHandler()
    return null
}

export const RemirrorTextEditor: React.FC<RemirrorTextEditorProps> = ({
    initialContent,
    setInitialContent,
    preview,
    hideBorder = false,
    assignmentSide,
}) => {
    // Track if we're in the middle of editing to prevent feedback loops
    // const isEditingRef = useRef<boolean>(false)
    const { width } = useWindowSize();
    const isMobile = width < 768;
    const {isDark} = useThemeStore()


    // Reference to compare content changes
    // const contentRef = useRef<string>('') // No longer needed

    // Use default content if initialContent is undefined or invalid
    const getEditorContent = () => {
        if (initialContent?.doc || initialContent) {
            return initialContent?.doc || initialContent
        }

        // If no initial content
        if (preview) {
            return createPreviewDefaultContent()
        } else {
            return createEmptyContent()
        }
    }

    const editorContent = getEditorContent()

    // Setup the Remirror manager with needed extensions
    const { manager, state } = useRemirror({
        extensions: () => [
            new BoldExtension({}),
            new ItalicExtension(),
            new UnderlineExtension(),
            new StrikeExtension(),
            // new HeadingExtension({}),
            new HeadingExtension({
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 1,
            }),
            new CodeExtension(),
            new CodeBlockExtension({
                defaultLanguage: 'javascript',
            }),
            new ImageExtension({
                enableResizing: true,
            }),
            new BlockquoteExtension(),
            new CalloutExtension({ defaultType: 'info' }),
            new BulletListExtension({}),
            new OrderedListExtension(),
            new ListItemExtension({}),
        ],
        // Use fallback content if initialContent is potentially invalid
        content: editorContent,
        selection: 'end',
        // Add error handler for content validation issues
        onError: (error) => {
            console.warn('Content validation error:', error)
            // Return default content on error
            return preview
                ? createPreviewDefaultContent()
                : createEmptyContent()
        },
    })

    // Handle changes from the editor
    const handleEditorChange = useCallback(
        (parameter: any) => {
            const state = parameter.state
            const json = state.toJSON()
            setInitialContent(json)
        },
        [setInitialContent]
    )

    // Initialize contentRef with the initial content
    // useEffect(() => {
    //     contentRef.current = JSON.stringify(editorContent)
    // }, [])
    // Effect to apply valid initialContent when available
    useEffect(() => {
        if (initialContent && manager.view.state) {
            try {
                const newContent = initialContent?.doc || initialContent
                const newDoc = manager.createState({ content: newContent }).doc
                if (!newDoc.eq(manager.view.state.doc)) {
                    manager.view.updateState(
                        manager.createState({ content: newContent })
                    )
                }
            } catch (err) {
                console.warn('Failed to update editor content:', err)
            }
        }
    }, [initialContent, manager])

    return (
        <ThemeProvider
            theme={{
                color: {
                    primary: '#3b82f6', // Tailwind's blue-500
                    // border: '#d1d5db', // Tailwind's gray-300
                    text: isDark ? '#f9fafb' : '#000',
                    border: 'none',
                    background: '#f9fafb', // Tailwind's gray-50
                    // active: { border: '#2563eb', primary: '#1d4ed8' }, // blue-600, blue-700
                    active: { border: 'transparent', primary: '#1d4ed8' },
                },
                fontFamily: { default: 'Inter, sans-serif' },
            }}
        >
            <div className={hideBorder ? "" : "border rounded shadow"}>
                <Remirror
                    manager={manager}
                    initialContent={state}
                    editable={!preview}
                    onChange={handleEditorChange}
                    placeholder="Start typing..."
                >
                    {!preview && (
                        <>
                            <EditorWithPasteHandler />
                            <div className="bg-white">
                                <Toolbar />
                            </div>
                        </>
                    )}

                    <ScrollArea
                        className={`${assignmentSide ? "h-72 overflow-y-auto" : "h-[28rem]"}`}
                        type="hover"
                        style={{
                            scrollbarWidth: 'none', // Firefox
                            msOverflowStyle: 'none', // IE and Edge
                        }}
                    >
                       <div className={`${isMobile && 'px-1 h-full pb-1 max-w-xs break-words whitespace-pre-wrap' } `} data-gramm="false">
                            <EditorComponent />
                        </div>
                        {!preview && <CodeBlockHelper />}
                    </ScrollArea>
                </Remirror>
            </div>
        </ThemeProvider>
    )
}

export default RemirrorTextEditor
