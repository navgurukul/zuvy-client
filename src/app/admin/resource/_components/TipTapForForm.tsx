import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'

import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import extensions from '@/app/_components/editor/TiptapExtensions'
import TiptapToolbarforForm from './TipTapToolbarforForm'
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'

type Props = {}

const TipTapForForm = ({
    description,
    onChange,
}: {
    description: String
    onChange: (richText: String) => void
}) => {
    const editor = useEditor({
        extensions,
        content: description,
        onUpdate({ editor }) {
            onChange(editor.getHTML())
        },
    })

    return (
        <RemirrorForm description={description} onChange={onChange} />
        // <div className="w-screen">
        //     <div className="text-left">
        //         {/* <div className="w-1/2">
        //             <TiptapToolbarforForm editor={editor} />
        //         </div> */}
        //         {/* <div className="outline-1 outline">
        //             <TiptapEditor editor={editor} />
        //         </div> */}
        //         <RemirrorForm description={description} onChange={onChange} />
        //     </div>
        // </div>
    )
}

export default TipTapForForm

// import React from 'react'
// import { useState, useEffect } from 'react'
// import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'

// type Props = {}

// type EditorDoc = {
//     type: string
//     content: any[]
// }

// const TipTapForForm = ({
//     description,
//     onChange,
// }: {
//     description: String
//     onChange: (richText: String) => void
// }) => {
//     const descriptionJSON = {
//         doc: {
//             type: 'doc',
//             content: [
//                 {
//                     type: 'paragraph',
//                     content: [
//                         {
//                             type: 'text',
//                             text: description as string,
//                         },
//                     ],
//                 },
//             ],
//         },
//     }
//     const [initialContent, setInitialContent] = useState<
//         { doc: EditorDoc } | undefined
//     >(descriptionJSON)

//     console.log('description', description)

//     // const extractTextFromDoc = (doc: any): string => {
//     //     const texts: string[] = []

//     //     const traverse = (node: any) => {
//     //         if (!node) return

//     //         if (node.type === 'text' && node.text) {
//     //             texts.push(node.text)
//     //         }

//     //         if (Array.isArray(node.content)) {
//     //             node.content.forEach(traverse)
//     //         }
//     //     }

//     //     traverse(doc)
//     //     return texts.join(' ')
//     // }

//     function convertDocToHTML(doc: { type?: string; content: any }) {
//         if (!doc || !doc.content) return ''

//         const parseMarks = (text: any, marks = []) => {
//             let html = text
//             marks.forEach((mark) => {
//                 console.log('mark', mark)
//                 // switch (mark.type) {
//                 //     case 'bold':
//                 //         html = `<strong>${html}</strong>`
//                 //         break
//                 //     case 'italic':
//                 //         html = `<em>${html}</em>`
//                 //         break
//                 //     case 'underline':
//                 //         html = `<u>${html}</u>`
//                 //         break
//                 //     case 'strike':
//                 //         html = `<s>${html}</s>`
//                 //         break
//                 //     case 'code':
//                 //         html = `<code>${html}</code>`
//                 //         break
//                 // }
//             })
//             return html
//         }

//         const renderContent = (content: any) => {
//             if (!content) return ''

//             return content
//                 .map((node: any) => {
//                     switch (node.type) {
//                         case 'paragraph':
//                             const paraText = (node.content || [])
//                                 .map((child: any) => {
//                                     return child.type === 'text'
//                                         ? parseMarks(child.text, child.marks)
//                                         : ''
//                                 })
//                                 .join('')
//                             return `<p>${paraText}</p>`

//                         case 'heading':
//                             const headingText = (node.content || [])
//                                 .map((child: any) => {
//                                     return child.type === 'text'
//                                         ? parseMarks(child.text, child.marks)
//                                         : ''
//                                 })
//                                 .join('')
//                             const level = node.attrs?.level || 1
//                             return `<h${level}>${headingText}</h${level}>`

//                         case 'bulletList':
//                             return `<ul>${(node.content || [])
//                                 .map((item: any) => renderContent(item.content))
//                                 .map((item: any) => `<li>${item}</li>`)
//                                 .join('')}</ul>`

//                         case 'orderedList':
//                             return `<ol>${(node.content || [])
//                                 .map((item: any) => renderContent(item.content))
//                                 .map((item: any) => `<li>${item}</li>`)
//                                 .join('')}</ol>`

//                         case 'blockquote':
//                             return `<blockquote>${renderContent(
//                                 node.content
//                             )}</blockquote>`

//                         case 'codeBlock':
//                             const codeText = (node.content || [])
//                                 .map((child: any) => child.text || '')
//                                 .join('')
//                             const lang = node.attrs?.language || ''
//                             return `<pre><code class="language-${lang}">${codeText}</code></pre>`

//                         case 'text':
//                             return parseMarks(node.text, node.marks)

//                         default:
//                             return ''
//                     }
//                 })
//                 .join('')
//         }

//         return renderContent(doc.content)
//     }

//     // Convert description to initial content format if needed
//     useEffect(() => {
//         if (description && !initialContent) {
//             // You may need to adjust this based on RemirrorTextEditor's expected format
//             // setInitialContent({
//             //     doc: {
//             //         type: 'doc',
//             //         content: [
//             //             {
//             //                 type: 'paragraph',
//             //                 content: [
//             //                     {
//             //                         type: 'text',
//             //                         text: description as string,
//             //                     },
//             //                 ],
//             //             },
//             //         ],
//             //     },
//             // })
//         }
//         if (initialContent) {
//             // const allText = extractTextFromDoc(initialContent.doc)
//             const allText = convertDocToHTML(initialContent.doc)
//             onChange(allText)
//         }
//     }, [description, initialContent])

//     console.log('initialContent in tiptap form', initialContent)

//     return (
//         <div className="w-full">
//             <div className="text-left">
//                 <RemirrorTextEditor
//                     initialContent={initialContent}
//                     setInitialContent={setInitialContent}
//                 />
//             </div>
//         </div>
//     )
// }

// export default TipTapForForm
