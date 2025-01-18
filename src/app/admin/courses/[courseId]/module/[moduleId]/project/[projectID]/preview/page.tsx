// import React from 'react'
// import { useEditor } from '@tiptap/react'
// import extensions from '@/app/_components/editor/TiptapExtensions'
// import { Button } from '@/components/ui/button'
// import { X } from 'lucide-react'
// import TiptapEditor from '@/app/_components/editor/TiptapEditor'

// type Props = {
//     content: any
//     setShowPreview: React.Dispatch<React.SetStateAction<boolean>>
// }

// const ProjectPreview = ({ content, setShowPreview }: Props) => {
//     const timestamp = content.project[0].deadline
//     const date = new Date(timestamp)

//     const options: any = {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         timeZone: 'UTC',
//         timeZoneName: 'short',
//     }
//     const options2: any = {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//     }
//     const formattedDate = date.toLocaleDateString('en-US', options)

//     let editorContent

//     if (
//         content?.project &&
//         Array.isArray(content.project) &&
//         content.project.length > 0 &&
//         content.project[0]?.instruction?.description &&
//         content.project[0].instruction.description.length > 0 &&
//         content.project[0].instruction.description[0]?.content &&
//         content.project[0].instruction.description[0].content.length > 0
//     ) {
//         editorContent = content.project[0].instruction.description[0].content[0]
//     } else {
//         editorContent = {
//             type: 'doc',
//             content: [
//                 {
//                     type: 'paragraph',
//                     attrs: {
//                         textAlign: 'left',
//                     },
//                     content: [
//                         {
//                             text: 'No Assignment added yet. Please come back later for some interesting article to learn from...',
//                             type: 'text',
//                         },
//                     ],
//                 },
//             ],
//         }
//     }

//     const editor = useEditor({
//         extensions,
//         content: editorContent,
//         editable: false,
//     })

//     return (
//         <div>
//             <div className="flex  flex-col items-start">
//                 <h1 className="text-2xl font-semibold text-left">
//                     {projectPreviewContent?.project[0]
//                         ? content.project[0].title
//                         : 'No Title yet'}
//                 </h1>
//                 <h1 className="font-semibold">Deadline: {formattedDate}</h1>
//                 <Button
//                     onClick={() => setShowPreview(false)}
//                     className="gap-x-1 flex items-center"
//                     variant={'ghost'}
//                 >
//                     <X className="text-red-400" size={15} />
//                     <h1 className="text-red-400">Close Preview</h1>
//                 </Button>
//             </div>

//             <TiptapEditor editor={editor} />
//             <div className="mt-2 text-end">
//                 <Button>Mark as Done</Button>
//             </div>
//         </div>
//     )
// }

// export default ProjectPreview

'use client'

import React, { useEffect } from 'react'
import { getProjectPreviewStore } from '@/store/store'
import { fetchPreviewData } from '@/utils/admin'
import { ArrowLeft } from 'lucide-react'
// import Link from 'next/link'
import { useEditor } from '@tiptap/react'
import extensions from '@/app/_components/editor/TiptapExtensions'
import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import { Button } from '@/components/ui/button'
import { Link } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

const ProjectPreview = () => {
    const router = useRouter()
    const { courseId, moduleId, projectID } = useParams()
    const { projectPreviewContent, setProjectPreviewContent } =
        getProjectPreviewStore()

    const goBack = () => {
        router.push(
            `/admin/courses/${courseId}/module/${moduleId}/project/${projectID}`
        )
    }

    const timestamp = projectPreviewContent?.project[0].deadline
    const date = new Date(timestamp)

    console.log('projectPreviewContent', projectPreviewContent)

    const options: any = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short',
    }
    const options2: any = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    const formattedDate = date.toLocaleDateString('en-US', options)

    // let editorContent

    // if (
    //     projectPreviewContent?.project &&
    //     Array.isArray(projectPreviewContent.project) &&
    //     projectPreviewContent.project.length > 0 &&
    //     projectPreviewContent.project[0]?.instruction?.description &&
    //     projectPreviewContent.project[0].instruction.description.length > 0 &&
    //     projectPreviewContent.project[0].instruction.description[0]
    //         ?.projectPreviewContent &&
    //     projectPreviewContent.project[0].instruction.description[0]
    //         .projectPreviewContent.length > 0
    // ) {
    //     editorContent =
    //         projectPreviewContent.project[0].instruction.description[0]
    //             .content[0]
    // } else {
    //     editorContent = {
    //         type: 'doc',
    //         content: [
    //             {
    //                 type: 'paragraph',
    //                 attrs: {
    //                     textAlign: 'left',
    //                 },
    //                 content: [
    //                     {
    //                         text: 'No Assignment added yet. Please come back later for some interesting article to learn from...',
    //                         type: 'text',
    //                     },
    //                 ],
    //             },
    //         ],
    //     }
    // }

    // const editor = useEditor({
    //     extensions,
    //     content: editorContent,
    //     editable: false,
    // })

    const editor = useEditor({
        extensions,
        content: '', // Initialize with empty content
        editable: false,
    })

    // useEffect(() => {
    //     fetchPreviewData(params, setArticlePreviewContent)
    // }, [params.chapterId, fetchPreviewData])

    console.log(
        'Editdata',
        projectPreviewContent?.project[0].instruction.description[0].content[0]
            .content
    )

    useEffect(() => {
        if (
            editor &&
            projectPreviewContent?.project[0].instruction.description[0]
                .content[0].content
        ) {
            const contentDetails =
                projectPreviewContent?.project[0].instruction.description
            // [0].content[0].content
            console.log('contentDetails', contentDetails)
            const firstContent = contentDetails?.[0]?.content?.[0].content ?? {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        attrs: { textAlign: 'left' },
                    },
                ],
            }
            console.log('firstContent', firstContent)
            editor.commands.setContent(firstContent)
        }
    }, [projectPreviewContent, editor])

    console.log('editor', editor)

    return (
        <>
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center z-50">
                <h1 className="text-center text-[#FFFFFF]">
                    You are in the Admin Preview Mode.
                </h1>
            </div>

            <div className="flex mt-20 px-8 gap-8">
                {/* Left Section: Go Back Button */}
                <div className="w-1/4 flex flex-col">
                    <Button variant={'ghost'} onClick={goBack}>
                        <ArrowLeft size={20} />
                        <p className="ml-1 text-sm font-medium text-gray-800">
                            Go back
                        </p>
                    </Button>
                </div>

                {/* Right Section: Editor */}
                <div className="pt-20">
                    <div>
                        <div className="flex  flex-col items-start">
                            <h1 className="text-2xl font-semibold text-left">
                                {projectPreviewContent?.project[0]
                                    ? projectPreviewContent?.project[0].title
                                    : 'No Title yet'}
                            </h1>
                            <h1 className="font-semibold">
                                Deadline: {formattedDate}
                            </h1>
                        </div>

                        <TiptapEditor editor={editor} />
                        <div className="mt-2 text-end">
                            <Button>Mark as Done</Button>
                        </div>
                    </div>
                    {/* <div className="flex justify-between">
                            <div className="flex flex-col items-start mb-3">
                                <h1 className="text-2xl font-semibold text-left">
                                    {assignmentPreviewContent?.title
                                        ? assignmentPreviewContent.title
                                        : 'No Title yet'}
                                </h1>
                                <h1 className="font-semibold">
                                    Deadline: {formattedDate}
                                </h1>
                            </div>
                            <div className="mt-2 text-end">
                                <Button disabled>Submit</Button>
                            </div>
                        </div> */}

                    {/* <TiptapEditor editor={editor} />
                        <div className="mt-2">
                            <div className="flex items-center">
                                <Link className="mr-2 h-4 w-4" />
                                <Input
                                    placeholder="Paste your Assignment Link Here"
                                    disabled
                                />
                            </div>
                        </div> */}
                </div>
            </div>
        </>
    )
}

export default ProjectPreview
