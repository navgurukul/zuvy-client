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

interface RemirrorFormProps {
    description: any
    onChange?: (html: string) => void
    preview?: boolean
    bigScreen?: boolean
}

export const RemirrorForm: React.FC<RemirrorFormProps> = ({
    description,
    onChange,
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

    const EditorChangeHandler = () => {
        const helpers = useHelpers()

        React.useEffect(() => {
            if (onChange && helpers) {
                try {
                    // Get HTML content from the editor using the correct helper method
                    const htmlContent = helpers.getHTML()
                    onChange(htmlContent)
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
            <div className="p-1 md:p-1 lg:p-1 border rounded">
                <Remirror
                    manager={manager}
                    initialContent={state}
                    editable={!preview}
                    placeholder="Start typing..."
                    onChange={(parameter) => {
                        // Get HTML from the editor state
                        const htmlContent = parameter.helpers.getHTML()
                        onChange && onChange(htmlContent)
                    }}
                >
                    <div
                        className={`${
                            bigScreen
                                ? 'lg:w-[37rem] sm:w-[37rem]'
                                : preview
                                ? 'lg:w-[25rem] sm:w-[25rem]'
                                : 'lg:w-[44rem] sm:w-[44rem]'
                        }`}
                    >
                        {!preview && (
                            <div className="bg-white pb-2 border-b mb-2">
                                <Toolbar />
                            </div>
                        )}
                        <ScrollArea
                            className="h-96"
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
                                <EditorChangeHandler />
                            </div>
                            {!preview && <CodeBlockHelper />}
                        </ScrollArea>
                    </div>
                </Remirror>
            </div>
        </div>
    )
}
