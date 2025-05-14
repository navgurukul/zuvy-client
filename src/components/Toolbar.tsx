// // // // components/Toolbar.tsx
// // // 'use client';

// // // import React from 'react';
// // // import {
// // //   useRemirrorContext,
// // //   ToolbarGroup,
// // //   ToolbarBoldButton,
// // //   ToolbarItalicButton,
// // //   ToolbarBulletListButton,
// // //   ToolbarOrderedListButton,
// // // } from '@remirror/react';

// // // export default function Toolbar() {
// // //   const { editor } = useRemirrorContext();

// // //   return (
// // //     <div className="toolbar">
// // //       <ToolbarGroup>
// // //         <ToolbarBoldButton />
// // //         <ToolbarItalicButton />
// // //         <ToolbarBulletListButton />
// // //         <ToolbarOrderedListButton />
// // //         {/* Add more buttons as needed */}
// // //       </ToolbarGroup>
// // //     </div>
// // //   );
// // // }

// // // // components/RemirrorToolbar.tsx
// // // import React from 'react';
// // // import {
// // //   ToolbarGroup,
// // //   ToolbarBoldButton,
// // //   ToolbarItalicButton,
// // //   ToolbarBulletListButton,
// // //   ToolbarOrderedListButton,
// // //   ToolbarImageButton,
// // //   ToolbarMentionButton,
// // // } from '@remirror/react-editors';

// // // export default function RemirrorToolbar() {
// // //   return (
// // //     <div className="custom-toolbar">
// // //       <ToolbarGroup>
// // //         <ToolbarBoldButton />
// // //         <ToolbarItalicButton />
// // //         <ToolbarBulletListButton />
// // //         <ToolbarOrderedListButton />
// // //         <ToolbarMentionButton />
// // //         <ToolbarImageButton />
// // //       </ToolbarGroup>
// // //     </div>
// // //   );
// // // }

// // import React from 'react'
// // import { useRemirrorContext } from '@remirror/react'

// // export default function RemirrorToolbar() {
// //     const { commands } = useRemirrorContext()

// //     return (
// //         <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
// //             <button onClick={() => commands.toggleBold()}>Bold</button>
// //             <button onClick={() => commands.toggleItalic()}>Italic</button>
// //             <button onClick={() => commands.toggleBulletList()}>
// //                 Bullet List
// //             </button>
// //             <button onClick={() => commands.toggleOrderedList()}>
// //                 Ordered List
// //             </button>
// //             <button
// //                 onClick={() =>
// //                     commands.insertImage({
// //                         src: 'https://placekitten.com/300/200',
// //                     })
// //                 }
// //             >
// //                 Insert Image
// //             </button>
// //             <button
// //                 onClick={() =>
// //                     commands.createMention({
// //                         id: 'zuvy',
// //                         label: '@zuvy',
// //                         name: 'mention',
// //                     })
// //                 }
// //             >
// //                 Mention
// //             </button>
// //         </div>
// //     )
// // }

// // components/Toolbar.tsx
// 'use client'

// import { Editor } from '@tiptap/react'

// export default function Toolbar({ editor }: { editor: Editor | null }) {
//     if (!editor) return null

//     return (
//         <div
//             style={{
//                 borderBottom: '1px solid #ddd',
//                 padding: '10px',
//                 background: '#f9f9f9',
//             }}
//         >
//             <button onClick={() => editor.chain().focus().toggleBold().run()}>
//                 Bold
//             </button>
//             <button onClick={() => editor.chain().focus().toggleItalic().run()}>
//                 Italic
//             </button>
//             <button
//                 onClick={() => editor.chain().focus().toggleBulletList().run()}
//             >
//                 Bullet List
//             </button>
//         </div>
//     )
// }

'use client'

import React, { useRef } from 'react'
import { useCommands, useActive } from '@remirror/react'
import {
    Camera,
    Code,
    Quote,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    ListOrdered,
    List,
} from 'lucide-react'

export const Toolbar = () => {
    const {
        toggleBold,
        toggleItalic,
        toggleUnderline,
        toggleStrike,
        toggleHeading,
        toggleCodeBlock,
        toggleBlockquote,
        toggleBulletList,
        toggleOrderedList,
    } = useCommands()
    const active = useActive()

    const fileInputRef = useRef<HTMLInputElement>(null)
    const { insertImage } = useCommands()

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
        <div className="sticky top-0 z-10 bg-white border-b mb-2 p-2 flex flex-wrap gap-2">
            {/* Text formatting */}
            <button
                onClick={() => toggleBold()}
                className={`p-2 rounded ${
                    active.bold() ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                title="Bold"
                type="button"
            >
                <Bold size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleItalic()}
                className={`p-2 rounded ${
                    active.italic() ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                title="Italic"
                type="button"
            >
                <Italic size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleUnderline()}
                className={`p-2 rounded ${
                    active.underline() ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                title="Underline"
                type="button"
            >
                <Underline size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleStrike()}
                className={`p-2 rounded ${
                    active.strike() ? 'bg-gray-200' : 'hover:bg-gray-100'
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
                        ? 'bg-gray-200'
                        : 'hover:bg-gray-100'
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
                        ? 'bg-gray-200'
                        : 'hover:bg-gray-100'
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
                        ? 'bg-gray-200'
                        : 'hover:bg-gray-100'
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
                        ? 'bg-gray-200'
                        : 'hover:bg-gray-100'
                }`}
                title="Heading 4"
                type="button"
            >
                <Heading4 size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleHeading({ level: 5 })}
                className={`p-2 rounded ${
                    active.heading({ level: 5 })
                        ? 'bg-gray-200'
                        : 'hover:bg-gray-100'
                }`}
                title="Heading 5"
                type="button"
            >
                <Heading5 size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleHeading({ level: 6 })}
                className={`p-2 rounded ${
                    active.heading({ level: 6 })
                        ? 'bg-gray-200'
                        : 'hover:bg-gray-100'
                }`}
                title="Heading 6"
                type="button"
            >
                <Heading6 size={18} className="text-gray-700" />
            </button>

            <div className="border-l h-8 mx-1"></div>

            {/* Lists */}
            <button
                onClick={() => toggleBulletList()}
                className={`p-2 rounded ${
                    active.bulletList() ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                title="Bullet List"
                type="button"
            >
                <List size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleOrderedList()}
                className={`p-2 rounded ${
                    active.orderedList() ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                title="Ordered List"
                type="button"
            >
                <ListOrdered size={18} className="text-gray-700" />
            </button>

            <div className="border-l h-8 mx-1"></div>

            {/* Block elements */}
            <button
                onClick={() => toggleCodeBlock()}
                className={`p-2 rounded ${
                    active.codeBlock() ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                title="Code Block"
                type="button"
            >
                <Code size={18} className="text-gray-700" />
            </button>

            <button
                onClick={() => toggleBlockquote()}
                className={`p-2 rounded ${
                    active.blockquote() ? 'bg-gray-200' : 'hover:bg-gray-100'
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
                    className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
                >
                    <Camera size={18} className="text-gray-700" />
                </label>
            </div>
        </div>
    )
}
