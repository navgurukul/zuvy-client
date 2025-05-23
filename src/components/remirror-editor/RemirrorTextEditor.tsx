'use client'

import React, { useCallback, useRef, useEffect } from 'react'
import {
    useRemirror,
    Remirror,
    EditorComponent,
    ThemeProvider,
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

interface RemirrorTextEditorProps {
    initialContent: any
    setInitialContent: (content: any) => void
    preview?: boolean
}

// Create a simple default content if needed
const createDefaultContent = (preview: boolean | undefined) => {
    return {
        type: 'doc',
        content: [
            {
                type: 'paragraph',
                content: [
                    {
                        type: 'text',
                        text: preview
                            ? 'No content has been added yet'
                            : 'Start typing here...',
                    },
                ],
            },
        ],
    }
}

export const RemirrorTextEditor: React.FC<RemirrorTextEditorProps> = ({
    initialContent,
    setInitialContent,
    preview,
}) => {
    // Track if we're in the middle of editing to prevent feedback loops
    const isEditingRef = useRef<boolean>(false)

    // Reference to compare content changes
    const contentRef = useRef<string>('')

    // Use default content if initialContent is undefined or invalid
    const editorContent =
        initialContent?.doc || initialContent || createDefaultContent(preview)

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
            return createDefaultContent(preview)
        },
    })

    // Handle changes from the editor
    const handleEditorChange = useCallback(
        ({ state }: { state: any }) => {
            // Convert the current state to JSON
            const json = state.toJSON()

            // Store current selection state
            const selection = window.getSelection()
            const selectionRange = selection?.rangeCount
                ? selection.getRangeAt(0)
                : null

            // Mark that we're editing to prevent setState feedback loops
            isEditingRef.current = true

            // Update our reference content immediately to prevent issues
            contentRef.current = JSON.stringify(json)

            // Set content without setTimeout for immediate reflection
            setInitialContent(json)

            // Use requestAnimationFrame instead of setTimeout for better performance
            // This prevents feedback loops while not interfering with selection
            requestAnimationFrame(() => {
                isEditingRef.current = false

                // Restore selection if it existed
                if (selectionRange && selection) {
                    selection.removeAllRanges()
                    selection.addRange(selectionRange)
                }
            })
        },
        [setInitialContent]
    )

    // Initialize contentRef with the initial content
    useEffect(() => {
        contentRef.current = JSON.stringify(editorContent)
    }, [])

    // Effect to apply valid initialContent when available
    useEffect(() => {
        // Skip if we're currently editing to prevent feedback loops
        if (isEditingRef.current || !initialContent) return

        try {
            // Try to update the content carefully
            const safeContent =
                initialContent.doc || createDefaultContent(preview)
            const currentContentString = JSON.stringify(safeContent)

            // Only update if content has actually changed
            if (currentContentString !== contentRef.current) {
                contentRef.current = currentContentString

                try {
                    // Try to create a valid state with error handling
                    const newState = manager.createState({
                        content: safeContent,
                        selection: 'end',
                    })

                    // Update if state creation succeeded
                    manager.view.updateState(newState)
                } catch (err) {
                    console.warn('Failed to update editor state:', err)
                    // Continue with current state on error
                }
            }
        } catch (err) {
            console.warn('Error processing initialContent:', err)
        }
    }, [initialContent, manager])

    return (
        <ThemeProvider
            theme={{
                color: {
                    primary: '#3b82f6', // Tailwind's blue-500
                    border: '#d1d5db', // Tailwind's gray-300
                    background: '#f9fafb', // Tailwind's gray-50
                    active: { border: '#2563eb', primary: '#1d4ed8' }, // blue-600, blue-700
                },
                fontFamily: { default: 'Inter, sans-serif' },
            }}
        >
            <div className="p-1 border rounded shadow">
                <Remirror
                    manager={manager}
                    initialContent={state}
                    editable={!preview}
                    onChange={handleEditorChange}
                    placeholder="Start typing..."
                >
                    {!preview && (
                        <div className="bg-white pb-2 border-b mb-2">
                            <Toolbar />
                        </div>
                    )}

                    <ScrollArea
                        className="h-96 pr-8 "
                        type="hover"
                        style={{
                            scrollbarWidth: 'none', // Firefox
                            msOverflowStyle: 'none', // IE and Edge
                        }}
                    >
                        <div
                            className="remirror-editor-wrapper p-4 min-h-[250px]"
                            data-gramm="false"
                        >
                            <EditorComponent />
                        </div>
                    </ScrollArea>
                </Remirror>
            </div>
        </ThemeProvider>
    )
}

export default RemirrorTextEditor
