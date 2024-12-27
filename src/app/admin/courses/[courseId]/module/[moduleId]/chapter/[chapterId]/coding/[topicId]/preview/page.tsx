'use client'

import React, { useEffect, useState } from 'react'
import { getCodingPreviewStore, getCodingQuestionTags } from '@/store/store'
import { fetchPreviewData } from '@/utils/admin'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { requestFullScreen } from '@/utils/students'
import IDE from '@/app/student/playground/[editor]/editor'
import CodingQuestionCard from '@/app/student/courses/[viewcourses]/modules/_components/CodingQuestionCard'

const PreviewCoding = ({ params }: { params: any }) => {
    const { codingPreviewContent, setCodingPreviewContent } =
        getCodingPreviewStore()
    const { tags, setTags } = getCodingQuestionTags()

    const [showCodePanel, setShowCodePanel] = useState(false)

    useEffect(() => {
        fetchPreviewData(params, setCodingPreviewContent)
    }, [params.chapterId, fetchPreviewData])

    // Add a check to prevent accessing properties of undefined
    const tag =
        codingPreviewContent?.codingQuestionDetails &&
        codingPreviewContent?.codingQuestionDetails.length > 0
            ? tags.find(
                  (item: any) =>
                      item.id ===
                      codingPreviewContent?.codingQuestionDetails[0].tagId
              )
            : null

    useEffect(() => {
        if (showCodePanel) requestFullScreen(document.documentElement)
    }, [showCodePanel])

    const remainingTime = null
    const assessmentSubmitId = 1
    const selectedCodingOutsourseId = ''
    return (
        <>
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center">
                <h1 className="text-center text-[#FFFFFF]">
                    You are in the Admin Preview Mode. The questions cannot be
                    interacted with.
                </h1>
            </div>
            <div className="relative flex flex-col items-center justify-center px-4 py-8 mt-20">
                <Link
                    href={`/admin/courses/${params.courseId}/module/${params.moduleId}/chapters/${params.chapterId}`}
                    className="absolute left-0 top-0 flex items-center space-x-2 p-4"
                >
                    {' '}
                    {/* Absolute positioning */}
                    <ArrowLeft size={20} />
                    <p className="ml-1 text-sm font-medium text-gray-800">
                        Go back
                    </p>
                </Link>
                {showCodePanel ? (
                    <div className="mt-5">
                        <IDE
                            params={{
                                editor: String(
                                    codingPreviewContent
                                        ?.codingQuestionDetails[0]?.id
                                ), // Use optional chaining here
                            }}
                            onBack={() => console.log('Here..!')}
                            remainingTime={remainingTime}
                            assessmentSubmitId={assessmentSubmitId}
                            selectedCodingOutsourseId={
                                selectedCodingOutsourseId
                            }
                        />
                    </div>
                ) : (
                    <>
                        <h2 className="font-bold">Coding Challenges</h2>
                        {codingPreviewContent?.codingQuestionDetails?.map(
                            (question: any) => (
                                <CodingQuestionCard
                                    key={question.id}
                                    id={question.id}
                                    title={question.title}
                                    difficulty={question.difficulty}
                                    tagName={tag?.tagName} // Optional chaining for safety
                                    description={question.description}
                                    status={'Pending'}
                                    onSolveChallenge={() =>
                                        setShowCodePanel(true)
                                    }
                                />
                            )
                        )}
                    </>
                )}
            </div>
        </>
    )
}

export default PreviewCoding
