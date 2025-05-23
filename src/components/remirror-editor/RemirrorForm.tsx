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

    return (
        <div className="remirror-theme">
            <div className="p-1 border rounded">
                <Remirror
                    manager={manager}
                    initialContent={state}
                    editable={!preview}
                    onChange={(parameter) => {
                        // Get HTML from the editor state
                        const htmlContent = parameter.helpers.getHTML()
                        onChange && onChange(htmlContent)
                    }}
                >
                    {/* <div className="w-[44rem]"> */}
                    <div
                        className={`${
                            bigScreen
                                ? 'w-[37rem]'
                                : preview
                                ? 'w-[25rem]'
                                : 'w-[44rem]'
                        }`}
                    >
                        {!preview && (
                            <div className="bg-white pb-2 border-b mb-2">
                                <Toolbar />
                            </div>
                        )}
                        <ScrollArea
                            className="h-96 pr-8"
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
                        </ScrollArea>
                    </div>
                </Remirror>
            </div>
        </div>
    )
}
