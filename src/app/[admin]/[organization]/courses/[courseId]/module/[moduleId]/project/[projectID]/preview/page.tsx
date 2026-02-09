'use client'

import React, { useEffect, useState } from 'react'
import { getProjectPreviewStore } from '@/store/store'
import { fetchProjectDetails } from '@/utils/admin'
import { ArrowLeft } from 'lucide-react'
import { getUser } from '@/store/store'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useParams, usePathname } from 'next/navigation'
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'

const ProjectPreview = () => {
    const router = useRouter()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const { courseId, moduleId, projectID } = useParams()
    const { projectPreviewContent, setProjectPreviewContent } =
        getProjectPreviewStore()
    const [initialContent, setInitialContent] = useState()
    const pathname = usePathname()
    const orgName = pathname.split('/')[2]

    const goBack = () => {
        router.push(
            `/${userRole}/${orgName}/courses/${courseId}/module/${moduleId}/project/${projectID}`
        )
    }

    const timestamp = projectPreviewContent?.project[0].deadline
    const date = new Date(timestamp)

    const options: any = {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        // second: '2-digit',
        hour12: true,   
        // timeZoneName: 'short',
    }
    const options2: any = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    const formattedDate = date.toLocaleString('en-US', options)

    useEffect(() => {
        fetchProjectDetails(setProjectPreviewContent, projectID, courseId)
    }, [fetchProjectDetails, projectID, courseId])

    useEffect(() => {
        if (projectPreviewContent?.project[0]?.instruction?.description) {
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
            <div className="fixed top-0 left-0 right-0 h-12 bg-accent flex items-center justify-center z-50">
                <h1 className="text-center text-[16px] text-accent-foreground">
                    You are in the Admin Preview Mode.
                </h1>
            </div>

            <div className="min-h-screen pt-12">
                <div className="fixed top-16 left-4 z-40">
                    <Button variant={'ghost'} onClick={goBack}>
                        <ArrowLeft size={20} />
                        <p className="ml-1 text-sm font-medium">
                            Go back
                        </p>
                    </Button>
                </div>

                {/* Right Section: Editor */}
                <div className="flex justify-center items-start min-h-screen pt-16 px-4 bg-background">
                    <div className="w-full max-w-4xl mx-auto rounded-lg bg-card shadow-lg p-8">
                        <div className="mb-8 text-center">
                            <h1 className="text-2xl font-semibold text-foreground mb-2">
                                {projectPreviewContent?.project[0]
                                    ? projectPreviewContent?.project[0].title
                                    : 'No Title yet'}
                            </h1>
                            <p className="text-lg font-semibold text-muted-foreground">
                                Deadline: {formattedDate}
                            </p>
                        </div>

                        <div className="w-full mb-8 text-start">
                            {/* <div className="min-h-[600px] border border-red-200 rounded-lg p-4 bg-white"> */}
                                <RemirrorTextEditor
                                    initialContent={initialContent}
                                    setInitialContent={setInitialContent}
                                    preview={true}
                                />
                            {/* </div> */}
                        </div>
                        <div className="flex justify-center">
                            <Button disabled className="px-8 py-2">
                                Mark as Done
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProjectPreview
