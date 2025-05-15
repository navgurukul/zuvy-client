'use client'

import React, { useEffect, useState } from 'react'
import { getProjectPreviewStore } from '@/store/store'
import { fetchProjectDetails } from '@/utils/admin'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'

const ProjectPreview = () => {
    const router = useRouter()
    const { courseId, moduleId, projectID } = useParams()
    const { projectPreviewContent, setProjectPreviewContent } =
        getProjectPreviewStore()
    const [initialContent, setInitialContent] = useState()

    const goBack = () => {
        router.push(
            `/admin/courses/${courseId}/module/${moduleId}/project/${projectID}`
        )
    }

    const timestamp = projectPreviewContent?.project[0].deadline
    const date = new Date(timestamp)

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

    useEffect(() => {
        fetchProjectDetails(setProjectPreviewContent, projectID, courseId)
    }, [fetchProjectDetails, projectID, courseId])

    useEffect(() => {
        if (projectPreviewContent?.project[0].instruction.description) {
            const contentDetails =
                projectPreviewContent?.project[0].instruction.description
            const firstContent = contentDetails ?? {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        attrs: { textAlign: 'left' },
                    },
                ],
            }
            setInitialContent(JSON.parse(firstContent))
        }
    }, [projectPreviewContent])

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

                        <div className="mt-2 text-start">
                            <RemirrorTextEditor
                                initialContent={initialContent}
                                setInitialContent={setInitialContent}
                                preview={true}
                            />
                        </div>
                        <div className="mt-2 text-end">
                            <Button disabled>Mark as Done</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProjectPreview
