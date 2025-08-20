'use client'

import 'remirror/styles/all.css'
import React, { useCallback, useRef, useEffect } from 'react'
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
import {
    useRemirror,
    Remirror,
    EditorComponent,
    ThemeProvider,
    useHelpers,
    useActive,
} from '@remirror/react'
import { Toolbar } from './Toolbar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {RemirrorFormProps} from "@/components/remirror-editor/componentRemirrorType"

export const RemirrorForm: React.FC<RemirrorFormProps> = ({
    description,
    onChange,
    onValidationChange, // New prop
    preview,
    bigScreen,
}) => {
    const { manager, state } = useRemirror({
        extensions: () => [
            new BoldExtension({}),
            new ItalicExtension(),
            new UnderlineExtension(),
            new StrikeExtension(),
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
        content: description,
        selection: 'end',
        stringHandler: 'html',
    })

    const validateContent = useCallback(
        (htmlContent: string) => {
            // Check if we're on the client side
            if (typeof window === 'undefined' || typeof document === 'undefined') {
                // Fallback for SSR - simple text validation
                const plainText = htmlContent.replace(/<[^>]*>/g, '')
                const isValid = plainText.trim().length > 0
                onValidationChange?.(isValid)
                return
            }

            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = htmlContent

            // Remove <img> tags to check for other content
            tempDiv.querySelectorAll('img').forEach((img) => img.remove())

            // Check if there's any meaningful content left
            const isValid = (tempDiv.textContent ?? '').trim().length > 0
            onValidationChange?.(isValid) // Notify parent
        },
        [onValidationChange]
    )

    const EditorChangeHandler = () => {
        const helpers = useHelpers()

        React.useEffect(() => {
            if (onChange && helpers) {
                try {
                    // Get HTML content from the editor using the correct helper method
                    const htmlContent = helpers.getHTML()
                    onChange(htmlContent)
                    validateContent(htmlContent) // Validate content
                } catch (error) {
                    console.warn('Failed to get HTML content:', error)
                }
            }
        }, [helpers, onChange])

        return null
    }

    const CodeBlockHelper = () => {
        const active = useActive()

        if (!active.codeBlock()) {
            return null
        }

        return (
            <div className="absolute bottom-2 left-2 right-2 z-10 bg-blue-100 border border-blue-300 rounded px-3 py-2 shadow-sm">
                <p className="text-xs text-blue-700 font-medium m-0">
                    💡 Press Ctrl+Enter to exit code block and add a new line
                    below.
                </p>
            </div>
        )
    }

    return (
        <div className="remirror-theme">
            <div
                className={`${
                    bigScreen ? 'remirror-form-bigscreen' : 'border rounded'
                }`}
            >
                <Remirror
                    manager={manager}
                    initialContent={state}
                    editable={!preview}
                    placeholder="Start typing..."
                    onChange={(parameter) => {
                        // Get HTML from the editor state
                        const htmlContent = parameter.helpers.getHTML()
                        onChange && onChange(htmlContent)
                        validateContent(htmlContent) // Validate content
                    }}
                >
                    <div
                        className={`${
                            bigScreen
                                ? 'lg:w-[39rem] sm:w-[37rem]'
                                : preview
                                ? 'lg:w-[28rem] sm:w-[25rem]'
                                : 'lg:w-[44rem] sm:w-[44rem]'
                        }`}
                    >
                        {!preview && (
                            <div className="bg-white">
                                <Toolbar />
                            </div>
                        )}
                        {bigScreen ? (
                            <div className="min-h-auto remirror-form-bigscreen-content">
                                <div className="px-2" data-gramm="false">
                                    <EditorComponent />
                                    <EditorChangeHandler />
                                </div>
                                {!preview && <CodeBlockHelper />}
                            </div>
                        ) : description.length < 525 && preview ? (
                            <div className="min-h-auto remirror-form-bigscreen-content">
                                <div className="px-2 pb-2" data-gramm="false">
                                    <EditorComponent />
                                    <EditorChangeHandler />
                                </div>
                                {!preview && <CodeBlockHelper />}
                            </div>
                        ) : (
                            <ScrollArea
                                className="h-96"
                                type="hover"
                                style={{
                                    scrollbarWidth: 'none', // Firefox
                                    msOverflowStyle: 'none', // IE and Edge
                                }}
                            >
                                <div
                                    className="px-2 min-h-[250px] break-words whitespace-pre-wrap"
                                    data-gramm="false"
                                >
                                    <EditorComponent />
                                    <EditorChangeHandler />
                                </div>
                                {!preview && <CodeBlockHelper />}
                            </ScrollArea>
                        )}
                    </div>
                </Remirror>
            </div>
        </div>
    )
}
